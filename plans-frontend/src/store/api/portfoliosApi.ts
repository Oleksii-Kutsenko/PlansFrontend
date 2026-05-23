import { apiSlice } from './apiSlice';

export interface Ticker {
  symbol: string;
  name: string;
  weight: number;
}

export interface Portfolio {
  name: string;
  tickers: Ticker[];
}

export interface BacktestResults {
  id: number;
  twrAnnual: number;
  maxDrawdown: number;
  sharpe: number;
  standardDeviation: number;
  startDate: string;
  portfolio: Portfolio;
  strategy: string;
}

export interface AgeMaxDrawdownDependency {
  age: number;
  maxDrawdown: number;
}

interface PersonalMaxDrawdownResponse {
  personalMaxDrawdown: number;
}

export const portfoliosApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchPortfolios: builder.query<Portfolio[], undefined>({
      query: () => '/api/investments/portfolios/',
      providesTags: ['Portfolios'],
    }),

    fetchPortfolioBacktestResults: builder.query<BacktestResults[], undefined>({
      query: () => '/api/investments/portfolio-backtest-results/',
      providesTags: ['Portfolios'],
    }),

    fetchPersonalMaxDrawdown: builder.query<number, undefined>({
      query: () => '/api/investments/portfolios/personal-max-drawdown/',
      transformResponse: (response: PersonalMaxDrawdownResponse) => response.personalMaxDrawdown,
      providesTags: ['Portfolios'],
    }),

    fetchAgeMaxDrawdownDependence: builder.query<AgeMaxDrawdownDependency[], number | undefined>({
      query: (age) =>
        age === undefined
          ? '/api/investments/portfolios/age-max-drawdown-dependence/'
          : `/api/investments/portfolios/age-max-drawdown-dependence/?age=${String(age)}`,
      providesTags: ['Portfolios'],
    }),
  }),
});

export const {
  useFetchPortfoliosQuery,
  useFetchPortfolioBacktestResultsQuery,
  useFetchPersonalMaxDrawdownQuery,
  useFetchAgeMaxDrawdownDependenceQuery,
} = portfoliosApi;
