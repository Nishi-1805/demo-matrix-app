// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/Chat';
import SignUp from "./pages/SignUp";
import Navigation from './components/Navigation';
import PlatformIntegration from './components/PlatformIntegration';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/Home" element={<Home />} />  
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/platforms" element={<PlatformIntegration />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
