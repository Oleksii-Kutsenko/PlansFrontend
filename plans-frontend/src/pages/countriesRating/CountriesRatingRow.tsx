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
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

import type { countriesActions, type Country, Option, type RootState } from '@/store';
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

  type RGB = readonly [number, number, number];

  const minColor: RGB = [203, 52, 66];
  const maxColor: RGB = [125, 177, 69];
  const zeroColor: RGB = [255, 255, 0];

  const lerp = (a: number, b: number, t: number) => Math.round(a + t * (b - a));

  function mapValueToColor(value: number | string): string {
    const numValue = Number.isFinite(Number(value)) ? Number(value) : 0;

    const min = -100;
    const max = 100;

    let color: RGB;

    if (numValue < 0) {
      const t = (numValue - min) / -min;
      color = [
        lerp(minColor[0], zeroColor[0], t),
        lerp(minColor[1], zeroColor[1], t),
        lerp(minColor[2], zeroColor[2], t)
      ];
    } else if (numValue > 0) {
      const t = numValue / max;
      color = [
        lerp(zeroColor[0], maxColor[0], t),
        lerp(zeroColor[1], maxColor[1], t),
        lerp(zeroColor[2], maxColor[2], t)
      ];
    } else {
      color = zeroColor;
    }

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  const countriesRatingHistoryMap = new Map<number, Country[]>(countriesRatingHistory);

  useEffect(() => {
    if (expanded && !countriesRatingHistoryMap.has(country.id)) {
      void dispatch(countriesActions.fetchCountryRatingHistory(country.id))
        .unwrap()
        .catch((error) => {
          console.error('Failed to fetch rating history', error);
        });
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
              style={{ backgroundColor: mapValueToColor(country[option.normalized_name] ?? 0) }}
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
