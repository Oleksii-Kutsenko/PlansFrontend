import { ToastContainer } from 'react-toastify';
import './App.css';
import Header from './pages/Header';
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
