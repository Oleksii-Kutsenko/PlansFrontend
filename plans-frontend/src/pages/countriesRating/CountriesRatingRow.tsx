import { useEffect, useState } from 'react';
import { countriesActions, type Country, type RootState } from '@/store';
import type { Option } from '@/store';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/store/hooks';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const CountriesRatingHistory = ({
  country,
  countriesOptions
}: {
  country: Country;
  countriesOptions: Option[];
}) => {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const { countriesRatingHistory } = useSelector((state: RootState) => state.countries);

  function mapValueToColor(value: number | string): string {
    const numValue = isNaN(Number(value)) ? 0 : Number(value);
    const min = -100;
    const max = 100;
    const minColor = [203, 52, 66]; // RGB color for minimum value (red)
    const maxColor = [125, 177, 69]; // RGB color for maximum value (green)
    const zeroColor = [255, 255, 0]; // RGB color for zero (yellow)

    let color: number[] = [];

    if (numValue < 0) {
      const ratio = (numValue - min) / -min;
      color = minColor.map((c, i) => Math.round(c + ratio * (zeroColor[i] - c)));
    } else if (numValue > 0) {
      const ratio = numValue / max;
      color = zeroColor.map((c, i) => Math.round(c + ratio * (maxColor[i] - c)));
    } else {
      color = zeroColor;
    }

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  const countriesRatingHistoryMap = new Map<number, Country[]>(countriesRatingHistory);

  useEffect(() => {
    if (expanded && !countriesRatingHistoryMap.has(country.id)) {
      dispatch(countriesActions.fetchCountryRatingHistory(country.id));
    }
  }, [expanded, countriesRatingHistory, country.id, dispatch]);

  const values = countriesRatingHistoryMap.get(country.id);
  const valuesMap = values?.map((val) => val.rating) ?? [];
  const labels = values?.map((val) => val.year) ?? [];

  const data = {
    labels,
    datasets: [
      {
        label: `Rating ${country.name} history`,
        data: valuesMap,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)'
      }
    ]
  };

  return (
    <>
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        <td>
          <a>
            <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`}></i>
          </a>
        </td>
        <td>{country.name}</td>
        {countriesOptions.map((option, j) => {
          return (
            <td
              key={j}
              style={{ backgroundColor: mapValueToColor(country[option.normalized_name]) }}
            >
              {country[option.normalized_name]}
            </td>
          );
        })}
        <td>{country.rating}</td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={2}></td>
          <td colSpan={countriesOptions.length}>
            <Line data={data} options={{ responsive: true }} />
          </td>
          <td colSpan={1}></td>
        </tr>
      )}
    </>
  );
};
