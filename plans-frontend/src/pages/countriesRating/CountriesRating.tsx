import type { FC } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState, Country } from '../../store';
import { useAppDispatch } from '../../store/hooks';
import {
  fetchCountriesOptions,
  CountriesOptionsStatus,
  CountriesStatus,
  countriesActions
} from '../../store';
import { Container, Table } from 'react-bootstrap';
import { CountriesRatingHistory } from './CountriesRatingRow';

const CountriesRating: FC = () => {
  const dispatch = useAppDispatch();

  const { options: countriesOptions, status: countriesOptionsStatus } = useSelector(
    (state: RootState) => state.countriesOptions
  );

  const { countries, status: countriesStatus } = useSelector((state: RootState) => state.countries);

  useEffect(() => {
    if (countriesOptionsStatus === CountriesOptionsStatus.IDLE) {
      dispatch(fetchCountriesOptions()).catch((err) => {
        console.log(err);
      });
    }
    if (countriesStatus === CountriesStatus.IDLE) {
      dispatch(countriesActions.fetchCountries()).catch((err) => {
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
    tableHeader.push(<th key='chevron'></th>);
    tableHeader.push(<th key='name'>Name</th>);
    countriesOptions.forEach((option, index) => {
      tableHeader.push(<th key={index}>{option.name}</th>);
    });
    tableHeader.push(<th key='rating'>Rating</th>);

    const countriesOptionsNormalizedNames = countriesOptions.map(
      (option) => option.normalized_name
    );
    type ExactCountry = {
      [K in (typeof countriesOptionsNormalizedNames)[number]]: number;
    } & Country;
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
        <h1 className='text-center'>Countries Rating</h1>
        <Table bordered className='text-center'>
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
