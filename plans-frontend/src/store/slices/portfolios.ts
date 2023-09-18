import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

export enum LoadStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

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

interface State {
  portfolios: Portfolio[];
  portfoliosLoadingStatus: LoadStatus;
  personalMaxDrawdown: number | null;
  personalMaxDrawdownLoadingStatus: LoadStatus;
  backtestStartDate: Date | null;
  ageMaxDrawdownDependence: number[][];
  ageMaxDrawdownDependenceLoadingStatus: LoadStatus;
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

export const fetchAgeMaxDrawdownDependence = createAsyncThunk<number[][]>(
  `${name}/fetchAgeMaxDrawdownDependence`,
  async () => {
    const response = await fetcher.get('/api/investments/portfolios/age-max-drawdown-dependence/');
    return response.data;
  }
);

// Initial state
const initialState: State = {
  portfolios: [],
  portfoliosLoadingStatus: LoadStatus.IDLE,
  personalMaxDrawdown: null,
  personalMaxDrawdownLoadingStatus: LoadStatus.IDLE,
  backtestStartDate: null,
  ageMaxDrawdownDependence: [],
  ageMaxDrawdownDependenceLoadingStatus: LoadStatus.IDLE
};

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
        state.portfoliosLoadingStatus = LoadStatus.LOADING;
      })
      .addCase(fetchPortfolios.fulfilled, (state, action) => {
        state.portfolios = action.payload;
        state.portfoliosLoadingStatus = LoadStatus.SUCCEEDED;
      })
      .addCase(fetchPortfolios.rejected, (state) => {
        state.portfoliosLoadingStatus = LoadStatus.FAILED;
      })
      .addCase(fetchPersonalMaxDrawdown.pending, (state) => {
        state.personalMaxDrawdownLoadingStatus = LoadStatus.LOADING;
      })
      .addCase(fetchPersonalMaxDrawdown.fulfilled, (state, action) => {
        state.personalMaxDrawdown = action.payload;
        state.personalMaxDrawdownLoadingStatus = LoadStatus.SUCCEEDED;
      })
      .addCase(fetchPersonalMaxDrawdown.rejected, (state) => {
        state.personalMaxDrawdownLoadingStatus = LoadStatus.FAILED;
      })
      .addCase(fetchAgeMaxDrawdownDependence.pending, (state) => {
        state.ageMaxDrawdownDependenceLoadingStatus = LoadStatus.LOADING;
      })
      .addCase(fetchAgeMaxDrawdownDependence.fulfilled, (state, action) => {
        state.ageMaxDrawdownDependence = action.payload;
        state.ageMaxDrawdownDependenceLoadingStatus = LoadStatus.SUCCEEDED;
      })
      .addCase(fetchAgeMaxDrawdownDependence.rejected, (state) => {
        state.ageMaxDrawdownDependenceLoadingStatus = LoadStatus.FAILED;
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
