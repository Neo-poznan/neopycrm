import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Room from './pages/Room';
import Main from './pages/Main';
import NotFound from './pages/NotFound';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route exact path='/calls' Component={Main}/>
          <Route Component={NotFound}/>
          <Route path='/calls/room/:id' Component={Room}/>
    
        </Routes>
      </BrowserRouter>
  );
}

export default App;
