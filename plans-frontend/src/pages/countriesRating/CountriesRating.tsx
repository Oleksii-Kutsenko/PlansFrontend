import type { FC } from 'react';
import { Container, Table } from 'react-bootstrap';

import {
  type Country,
  useFetchCountriesOptionsQuery,
  useFetchCountriesQuery,
} from '../../store/api/countriesApi';
import { CountriesRatingHistory } from './CountriesRatingRow';

const CountriesRating: FC = () => {
  const {
    data: countriesOptions,
    isLoading: isOptionsLoading,
    isError: isOptionsError,
  } = useFetchCountriesOptionsQuery();
  const {
    data: countries,
    isLoading: isCountriesLoading,
    isError: isCountriesError,
  } = useFetchCountriesQuery();

  if (isOptionsLoading || isCountriesLoading) {
    return <div>Loading...</div>;
  }

  if (isOptionsError || isCountriesError || !countriesOptions || !countries) {
    return <div>Failed to load countries data.</div>;
  }

  return (
    <Container fluid>
      <h1 className="text-center">Countries Rating</h1>
      <Table bordered className="text-center">
        <thead style={{ backgroundColor: 'rgb(220, 220, 220)' }}>
          <tr>
            <th key="chevron" />
            <th key="name">Name</th>
            {countriesOptions.map((option, index) => (
              <th key={index}>{option.name}</th>
            ))}
            <th key="rating">Rating</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country: Country) => (
            <CountriesRatingHistory
              key={country.id}
              country={country}
              countriesOptions={countriesOptions}
            />
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default CountriesRating;
