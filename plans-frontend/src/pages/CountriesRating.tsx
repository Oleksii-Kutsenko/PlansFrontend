import type { FC } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import { fetchCountriesOptions } from '../store/slices/countriesOptions';
import { fetchCountries } from '../store/slices/countries';
import { Container, Table } from 'react-bootstrap';

const CountriesRating: FC = () => {
  const dispatch = useAppDispatch();

  const countriesOptions = useSelector((state: RootState) => state.countriesOptions.options);
  const isCountriesOptionsLoading = useSelector(
    (state: RootState) => state.countriesOptions.loading
  );
  const isCountriesOptionsLoaded = useSelector(
    (state: RootState) => state.countriesOptions.options.length > 0
  );

  const countries = useSelector((state: RootState) => state.countries.countries);
  const isCountriesLoading = useSelector((state: RootState) => state.countries.loading);
  const isCountriesLoaded = useSelector((state: RootState) => state.countries.countries.length > 0);

  function mapValueToColor(value: number | string): string {
    value = Number(value);
    const min = -100;
    const max = 100;
    const minColor = [203, 52, 66]; // RGB color for minimum value (red)
    const maxColor = [125, 177, 69]; // RGB color for maximum value (green)
    const zeroColor = [241, 171, 66]; // RGB color for zero (brown)
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
      void dispatch(fetchCountriesOptions());
    }
    if (!(isCountriesLoaded || isCountriesOptionsLoading)) {
      void dispatch(fetchCountries());
    }
  }, [isCountriesOptionsLoading, isCountriesOptionsLoaded, isCountriesLoading, isCountriesLoaded]);

  if (isCountriesOptionsLoading || isCountriesLoading) {
    return <div>Loading...</div>;
  } else {
    let tableHeader = [];
    tableHeader.push(<th key="name">Name</th>);
    tableHeader = tableHeader.concat(
      countriesOptions.map((option, index) => {
        return <th key={index}>{option.name}</th>;
      })
    );
    tableHeader.push(<th key="rating">Rating</th>);

    const tableContent = countries.map((country, index) => {
      return (
        <tr key={index}>
          <td style={{ backgroundColor: mapValueToColor(country.rating) }}>{country.name}</td>
          {countriesOptions.map((option, index) => {
            return (
              <td
                key={index}
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
        <Container>
          <h1 className="text-center">Countries Rating</h1>
          <Table bordered className="text-center">
            <thead>
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
