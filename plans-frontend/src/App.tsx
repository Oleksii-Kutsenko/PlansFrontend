import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './Components/Header';
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
