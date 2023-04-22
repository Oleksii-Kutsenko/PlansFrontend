import { type PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetcher } from '../../utils/axios';

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
  portfoliosLoading: boolean;
  personalMaxDrawdown: number | null;
  personalMaxDrawdownLoading: boolean;
}

const name = 'portfolios';

// Thunk
export const fetchPortfolios = createAsyncThunk(
  `${name}/fetchPortfolios`,
  async (): Promise<Portfolio[]> => {
    const response = await fetcher.get('/api/investments/portfolios/');
    return response.data;
  }
);

export const fetchPersonalMaxDrawdown = createAsyncThunk(
  `${name}/fetchPersonalMaxDrawdown`,
  async (): Promise<number> => {
    const response = await fetcher.get('/api/investments/portfolios/personal-max-drawdown/');
    return response.data.personalMaxDrawdown;
  }
);

// Initial state
const initialState: State = {
  portfolios: [],
  portfoliosLoading: false,
  personalMaxDrawdown: null,
  personalMaxDrawdownLoading: false
};

// Slice
const portfoliosSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolios.pending, (state: State) => {
        state.portfoliosLoading = true;
      })
      .addCase(fetchPortfolios.fulfilled, (state: State, action: PayloadAction<Portfolio[]>) => {
        state.portfolios = action.payload;
        state.portfoliosLoading = false;
      })
      .addCase(fetchPortfolios.rejected, (state: State) => {
        state.portfoliosLoading = false;
      })
      .addCase(fetchPersonalMaxDrawdown.pending, (state: State) => {
        state.personalMaxDrawdownLoading = true;
      })
      .addCase(
        fetchPersonalMaxDrawdown.fulfilled,
        (state: State, action: PayloadAction<number>) => {
          state.personalMaxDrawdown = action.payload;
          state.personalMaxDrawdownLoading = false;
        }
      )
      .addCase(fetchPersonalMaxDrawdown.rejected, (state: State) => {
        state.personalMaxDrawdownLoading = false;
      });
  }
});

// Exports
export const portfoliosReducer = portfoliosSlice.reducer;
export const portfoliosActions = { ...portfoliosSlice.actions, fetchPortfolios };
