import type { AnyAction } from '@reduxjs/toolkit';
import type { FC } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCountriesOptions, getCountriesOptions } from '../store/slices/countriesOptions';

const CountriesRating: FC = () => {
  const dispatch = useDispatch();

  const countriesOptions = useSelector(getCountriesOptions);

  useEffect(() => {
    dispatch(fetchCountriesOptions() as unknown as AnyAction);
  }, [dispatch]);

  console.log(countriesOptions);
  return (
    <>
      <h1>Countries</h1>
    </>
  );
};
export default CountriesRating;
