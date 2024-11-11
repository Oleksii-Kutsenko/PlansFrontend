import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';
import { LoadingStatus } from './utils';

interface BacktestData {
  cagr: number;
  maxDrawdown: number;
  sharpe: number;
  standardDeviation: number;
  startDate: string;
}

export interface Ticker {
  symbol: string;
  name: string;
  weight: number;
}

export interface Portfolio {
  name: string;
  backtestData: BacktestData;
  tickers: Ticker[];
}

export interface AgeMaxDrawdownDependency {
  age: number;
  maxDrawdown: number;
}

interface State {
  portfolios: Portfolio[];
  portfoliosLoadingStatus: LoadingStatus;
  personalMaxDrawdown: number | null;
  personalMaxDrawdownLoadingStatus: LoadingStatus;
  backtestStartDate: string;
  ageMaxDrawdownDependence: AgeMaxDrawdownDependency[];
  ageMaxDrawdownDependenceLoadingStatus: LoadingStatus;
}

const name = 'portfolios';

// Thunk Action Creators
export const fetchPortfolios = createAsyncThunk<Portfolio[]>(
  `${name}/fetchPortfolios`,
  async () => {
    const response = await fetcher.get('/api/investments/portfolios/');
    return response.data;
  }
);

export const fetchPersonalMaxDrawdown = createAsyncThunk<number>(
  `${name}/fetchPersonalMaxDrawdown`,
  async () => {
    const response = await fetcher.get('/api/investments/portfolios/personal-max-drawdown/');
    return response.data.personalMaxDrawdown;
  }
);

export const fetchAgeMaxDrawdownDependence = createAsyncThunk<
  AgeMaxDrawdownDependency[],
  number | void
>(`${name}/fetchAgeMaxDrawdownDependence`, async (age: number | void) => {
  let response;
  if (!age) {
    response = await fetcher.get('/api/investments/portfolios/age-max-drawdown-dependence/');
  } else {
    response = await fetcher.get(
      `/api/investments/portfolios/age-max-drawdown-dependence/?age=${age}`
    );
  }
  return response.data;
});

// Initial state
function createInitialState(): State {
  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  return {
    portfolios: [],
    portfoliosLoadingStatus: LoadingStatus.IDLE,
    personalMaxDrawdown: null,
    personalMaxDrawdownLoadingStatus: LoadingStatus.IDLE,
    backtestStartDate: fifteenYearsAgo.toISOString(),
    ageMaxDrawdownDependence: [],
    ageMaxDrawdownDependenceLoadingStatus: LoadingStatus.IDLE
  };
}
const initialState: State = createInitialState();

// Slice
const portfoliosSlice = createSlice({
  name,
  initialState,
  reducers: {
    setPersonalMaxDrawdown: (state, action: PayloadAction<number>) => {
      state.personalMaxDrawdown = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state) => {
        state.portfoliosLoadingStatus = LoadingStatus.LOADING;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.portfolios = action.payload;
        state.portfoliosLoadingStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchPortfolios.rejected, (state) => {
        state.portfoliosLoadingStatus = LoadingStatus.FAILED;
      })
      .addCase(fetchPersonalMaxDrawdown.pending, (state) => {
        state.personalMaxDrawdownLoadingStatus = LoadingStatus.LOADING;
      })
      .addCase(fetchPersonalMaxDrawdown.fulfilled, (state, action) => {
        state.personalMaxDrawdown = action.payload;
        state.personalMaxDrawdownLoadingStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchPersonalMaxDrawdown.rejected, (state) => {
        state.personalMaxDrawdownLoadingStatus = LoadingStatus.FAILED;
      })
      .addCase(fetchAgeMaxDrawdownDependence.pending, (state) => {
        state.ageMaxDrawdownDependenceLoadingStatus = LoadingStatus.LOADING;
      })
      .addCase(fetchAgeMaxDrawdownDependence.fulfilled, (state, action) => {
        state.ageMaxDrawdownDependence = action.payload;
        state.ageMaxDrawdownDependenceLoadingStatus = LoadingStatus.SUCCEEDED;
      })
      .addCase(fetchAgeMaxDrawdownDependence.rejected, (state) => {
        state.ageMaxDrawdownDependenceLoadingStatus = LoadingStatus.FAILED;
      });
  }
});

// Exports
export const { setPersonalMaxDrawdown } = portfoliosSlice.actions;
export const portfoliosReducer = portfoliosSlice.reducer;
export const portfoliosActions = {
  ...portfoliosSlice.actions,
  fetchPortfolios,
  fetchPersonalMaxDrawdown,
  fetchAgeMaxDrawdownDependence
};
