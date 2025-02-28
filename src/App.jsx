/* eslint-disable max-len */
/* eslint-disable react/react-in-jsx-scope */
import './App.css';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Dashboard from './Pages/Dashboard/Dashboard';
import Loading from './Pages/Loading/Loading';
import Comparison from './Pages/Comparison/Comparison';
import {useSelector} from 'react-redux';
import ErrorPage from './Pages/Error/ErrorPage';

/**
 *
 * @return {Routes}
 */
function App() {
  const data=useSelector((state)=>state.data.data);
  console.log(data);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading/>}/>
          <Route path="/home" element={data.length > 0 ? <Dashboard/>:<Navigate to="/"/>}/>
          <Route path="/comparison" element={data.length >0 ?<Comparison/>:<Navigate to="/"/>} />
          <Route path="/error" element={<ErrorPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
