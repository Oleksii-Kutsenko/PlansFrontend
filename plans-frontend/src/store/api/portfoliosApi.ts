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
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchPortfolios: builder.query<Portfolio[], void>({
      query: () => '/api/investments/portfolios/',
      providesTags: ['Portfolios'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchPortfolioBacktestResults: builder.query<BacktestResults[], void>({
      query: () => '/api/investments/portfolio-backtest-results/',
      providesTags: ['Portfolios'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchPersonalMaxDrawdown: builder.query<number, void>({
      query: () => '/api/investments/portfolios/personal-max-drawdown/',
      transformResponse: (response: PersonalMaxDrawdownResponse) => response.personalMaxDrawdown,
      providesTags: ['Portfolios'],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    fetchAgeMaxDrawdownDependence: builder.query<AgeMaxDrawdownDependency[], number | void>({
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
