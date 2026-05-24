import { skipToken } from '@reduxjs/toolkit/query';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';

import { toCamel } from '@/utils/caseUtils';

import { Country, CountryOption, useFetchCountryRatingHistoryQuery } from '../api/countriesApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const lerp = (a: number, b: number, t: number) => Math.round(a + t * (b - a));

export const CountriesRatingHistory = ({
  country,
  countriesOptions,
}: {
  country: Country;
  countriesOptions: CountryOption[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const { data: countriesRatingHistory } = useFetchCountryRatingHistoryQuery(
    expanded ? country.id : skipToken,
  );

  type RGB = readonly [number, number, number];

  const minColor: RGB = [203, 52, 66];
  const maxColor: RGB = [125, 177, 69];
  const zeroColor: RGB = [255, 255, 0];

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
        lerp(minColor[2], zeroColor[2], t),
      ];
    } else if (numValue > 0) {
      const t = numValue / max;
      color = [
        lerp(zeroColor[0], maxColor[0], t),
        lerp(zeroColor[1], maxColor[1], t),
        lerp(zeroColor[2], maxColor[2], t),
      ];
    } else {
      color = zeroColor;
    }

    return `rgb(${String(color[0])}, ${String(color[1])}, ${String(color[2])})`;
  }

  const labels = countriesRatingHistory?.map((val) => val.year) ?? [];
  const valuesMap = countriesRatingHistory?.map((val) => val.rating) ?? [];

  const data = {
    labels,
    datasets: [
      {
        label: `Rating ${country.name} history`,
        data: valuesMap,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
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
          <button
            type="button"
            className="btn"
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            <i className={`bi bi-chevron-${expanded ? 'down' : 'right'}`} />
          </button>
        </td>
        <td>{country.name}</td>
        {countriesOptions.map((option, j) => {
          return (
            <td
              key={j}
              style={{
                backgroundColor: mapValueToColor(country[toCamel(option.normalizedName)] ?? 0),
              }}
            >
              {country[toCamel(option.normalizedName)]}
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
