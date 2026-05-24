import './App.css';

import { JSX } from 'react';
import { ToastContainer } from 'react-toastify';

import Header from './components/Header';
import Main from './Main';

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
