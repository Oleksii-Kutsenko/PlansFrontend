import { Route, Routes } from 'react-router-dom';

import type { FC } from 'react';
import React from 'react';
import ProtectedRoutes from './routes/ProtectedRoutes';

const Login = React.lazy(async () => {
  const module = await import('./pages/Login');
  return { default: module.default };
});

const SignUp = React.lazy(async () => {
  const module = await import('./pages/SignUp');
  return { default: module.default };
});

const Home = React.lazy(async () => {
  const module = await import('./pages/Home');
  return { default: module.default };
});

const CountriesRating = React.lazy(async () => {
  const module = await import('./pages/CountriesRating');
  return { default: module.default };
});

const Profile = React.lazy(async () => {
  const module = await import('./pages/Profile');
  return { default: module.default };
});

const Portfolios = React.lazy(async () => {
  const module = await import('./pages/Portfolios');
  return { default: module.default };
});

const WealthManagement = React.lazy(async () => {
  const module = await import('./pages/WealthManagement');
  return { default: module.default };
});

const Loading: FC = () => <p>Loading ...</p>;

const Main: FC = () => {
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        {/** Protected Routes */}
        <Route path="/" element={<ProtectedRoutes />}>
          <Route path="/" element={<Home />} />
          <Route path="/countries" element={<CountriesRating />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wealth-management" element={<WealthManagement />} />
        </Route>

        {/** Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
    </React.Suspense>
  );
};
export default Main;
