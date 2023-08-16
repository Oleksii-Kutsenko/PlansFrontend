import type { FC } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { fetchCountriesOptions, CountriesOptionsStatus } from '../store/slices/countriesOptions';
import { Container, Table } from 'react-bootstrap';
import { CountriesStatus, fetchCountries, type Country } from '../store/slices/countries';

const CountriesRating: FC = () => {
  const dispatch = useAppDispatch();

  const { options: countriesOptions, status: countriesOptionsStatus } = useSelector(
    (state: RootState) => state.countriesOptions
  );

  const { countries, status: countriesStatus } = useSelector((state: RootState) => state.countries);

  function mapValueToColor(value: number | string): string {
    value = Number(value);
    const min = -100;
    const max = 100;
    const minColor = [203, 52, 66]; // RGB color for minimum value (red)
    const maxColor = [125, 177, 69]; // RGB color for maximum value (green)
    const zeroColor = [255, 255, 0]; // RGB color for zero (yellow)
    let color: number[] = [];

    if (value < 0) {
      const ratio = (value - min) / -min;
      color = minColor.map((c, i) => Math.round(c + ratio * (zeroColor[i] - c)));
    } else if (value > 0) {
      const ratio = value / max;
      color = zeroColor.map((c, i) => Math.round(c + ratio * (maxColor[i] - c)));
    } else {
      color = zeroColor;
    }

    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  useEffect(() => {
    if (countriesOptionsStatus === CountriesOptionsStatus.IDLE) {
      dispatch(fetchCountriesOptions()).catch((err) => {
        console.log(err);
      });
    }
    if (countriesStatus === CountriesStatus.IDLE) {
      dispatch(fetchCountries()).catch((err) => {
        console.log(err);
      });
    }
  }, [countriesOptionsStatus, countriesStatus]);

  let content;

  if (
    countriesOptionsStatus === CountriesOptionsStatus.LOADING ||
    countriesStatus === CountriesStatus.LOADING
  ) {
    content = <div>Loading...</div>;
  } else if (
    countriesOptionsStatus === CountriesOptionsStatus.SUCCEEDED &&
    countriesStatus === CountriesStatus.SUCCEEDED
  ) {
    const tableHeader = [];
    tableHeader.push(<th key="name">Name</th>);
    countriesOptions.forEach((option, index) => {
      tableHeader.push(<th key={index}>{option.name}</th>);
    });
    tableHeader.push(<th key="rating">Rating</th>);

    const countriesOptionsNormalizedNames = countriesOptions.map(
      (option) => option.normalized_name
    );
    type ExactCountry = {
      [K in (typeof countriesOptionsNormalizedNames)[number]]: number;
    } & Country;
    const exactCountries = countries as ExactCountry[];

    const tableContent = exactCountries.map((country: ExactCountry, i) => {
      return (
        <tr key={i}>
          <td style={{ backgroundColor: mapValueToColor(country.rating) }}>{country.name}</td>
          {countriesOptions.map((option, j) => {
            return (
              <td
                key={j}
                style={{ backgroundColor: mapValueToColor(country[option.normalized_name]) }}>
                {country[option.normalized_name]}
              </td>
            );
          })}
          <td style={{ backgroundColor: mapValueToColor(country.rating) }}>{country.rating}</td>
        </tr>
      );
    });
    content = (
      <Container fluid>
        <h1 className="text-center">Countries Rating</h1>
        <Table bordered className="text-center">
          <thead style={{ backgroundColor: 'rgb(220, 220, 220)' }}>
            <tr>{tableHeader}</tr>
          </thead>
          <tbody>{tableContent}</tbody>
        </Table>
        condition
      </Container>
    );
  } else if (
    countriesOptionsStatus === CountriesOptionsStatus.FAILED ||
    countriesStatus === CountriesStatus.FAILED
  ) {
    content = <div>Failed to load countries options</div>;
  }

  return <>{content}</>;
};
export default CountriesRating;
