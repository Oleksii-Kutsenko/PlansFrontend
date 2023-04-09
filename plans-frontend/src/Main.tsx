import { Route, Routes } from 'react-router-dom';

import type { FC } from 'react';
import React from 'react';
import ProtectedRoutes from './Auth/ProtectedRoutes';

const Login = React.lazy(async () => {
  const module = await import('./Components/Login');
  return { default: module.default };
});

const SignUp = React.lazy(async () => {
  const module = await import('./Components/SignUp');
  return { default: module.default };
});

const Home = React.lazy(async () => {
  const module = await import('./Components/Home');
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
