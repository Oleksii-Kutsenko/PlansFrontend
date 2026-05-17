import './App.css';

import { JSX } from 'react';
import { ToastContainer } from 'react-toastify';

import Main from './Main';
import Header from './pages/Header';

function App(): JSX.Element {
  return (
    <>
      <ToastContainer />
      <Header />
      <Main />
    </>
  );
}

export default App;
