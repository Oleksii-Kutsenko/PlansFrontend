import type { FC } from 'react';
import { useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import type { Country, RootState } from '../../store';
import {
  countriesActions,
  CountriesOptionsStatus,
  CountriesStatus,
  fetchCountriesOptions,
} from '../../store';
import { useAppDispatch } from '../../store/hooks';
import { CountriesRatingHistory } from './CountriesRatingRow';

const CountriesRating: FC = () => {
  const dispatch = useAppDispatch();

  const { options: countriesOptions, status: countriesOptionsStatus } = useSelector(
    (state: RootState) => state.countriesOptions,
  );

  const { countries, status: countriesStatus } = useSelector((state: RootState) => state.countries);

  useEffect(() => {
    if (countriesOptionsStatus === CountriesOptionsStatus.IDLE) {
      dispatch(fetchCountriesOptions()).catch((error) => {
        console.log(error);
      });
    }
    if (countriesStatus === CountriesStatus.IDLE) {
      dispatch(countriesActions.fetchCountries()).catch((error) => {
        console.log(error);
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
    const tableHeader = [<th key="chevron"></th>, <th key="name">Name</th>];
    for (const [index, option] of countriesOptions.entries()) {
      tableHeader.push(<th key={index}>{option.name}</th>);
    }
    tableHeader.push(<th key="rating">Rating</th>);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const countriesOptionsNormalizedNames = countriesOptions.map(
      (option) => option.normalized_name,
    );
    type ExactCountry = Record<(typeof countriesOptionsNormalizedNames)[number], number> & Country;
    const exactCountries = countries as ExactCountry[];

    const tableContent = exactCountries.map((country: ExactCountry) => {
      return (
        <CountriesRatingHistory
          key={country.id}
          country={country}
          countriesOptions={countriesOptions}
        />
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
