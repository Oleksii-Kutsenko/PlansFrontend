import type { FC } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { fetchCountriesOptions } from '../store/slices/countriesOptions';
import { fetchCountries } from '../store/slices/countries';
import { Container, Table } from 'react-bootstrap';
import type { Country } from '../store/slices/countries';

const CountriesRating: FC = () => {
  const dispatch = useAppDispatch();

  const { options: countriesOptions, loading: isCountriesOptionsLoading } = useSelector(
    (state: RootState) => state.countriesOptions
  );
  const isCountriesOptionsLoaded = useSelector(
    (state: RootState) => state.countriesOptions.options.length > 0
  );

  const { countries, loading: isCountriesLoading } = useSelector(
    (state: RootState) => state.countries
  );
  const isCountriesLoaded = useSelector((state: RootState) => state.countries.countries.length > 0);

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
    if (!(isCountriesOptionsLoaded || isCountriesOptionsLoading)) {
      dispatch(fetchCountriesOptions()).catch((err) => {
        console.log(err);
      });
    }
    if (!(isCountriesLoaded || isCountriesOptionsLoading)) {
      dispatch(fetchCountries()).catch((err) => {
        console.log(err);
      });
    }
  }, [isCountriesOptionsLoading, isCountriesOptionsLoaded, isCountriesLoading, isCountriesLoaded]);

  if (isCountriesOptionsLoading || isCountriesLoading) {
    return <div>Loading...</div>;
  } else {
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
    return (
      <>
        <Container fluid>
          <h1 className="text-center">Countries Rating</h1>
          <Table bordered className="text-center">
            <thead style={{ backgroundColor: 'grey' }}>
              <tr>{tableHeader}</tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </Table>
        </Container>
      </>
    );
  }
};
export default CountriesRating;
