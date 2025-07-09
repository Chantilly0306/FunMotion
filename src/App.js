import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProfilePage from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GameMenu from './pages/GameMenu';
import Game1 from './pages/Game1';
import Record from './pages/Record';
import UserData from './pages/UserData';
import ShoulderAbdLRest from './pages/ROM/ShoulderAbdL/RestPost';
import ShoulderAbdLMeasure from './pages/ROM/ShoulderAbdL/Measure';
import ShoulderAbdRRest from './pages/ROM/ShoulderAbdR/RestPost';
import ShoulderAbdRMeasure from './pages/ROM/ShoulderAbdR/Measure';
import ShoulderFlexLRest from './pages/ROM/ShoulderFlexL/RestPost';
import ShoulderFlexLMeasure from './pages/ROM/ShoulderFlexL/Measure';
import ShoulderFlexRRest from './pages/ROM/ShoulderFlexR/RestPost';
import ShoulderFlexRMeasure from './pages/ROM/ShoulderFlexR/Measure';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/game-menu" element={<GameMenu />} />
        <Route path="/game1" element={<Game1 />} />
        <Route path="/record" element={<Record />} />
        <Route path="/user-data" element={<UserData />} />
        <Route path="/rom/shoulder-abd-l/rest" element={<ShoulderAbdLRest />} />
        <Route path="/rom/shoulder-abd-l/measure" element={<ShoulderAbdLMeasure />} />
        <Route path="/rom/shoulder-abd-r/rest" element={<ShoulderAbdRRest />} />
        <Route path="/rom/shoulder-abd-r/measure" element={<ShoulderAbdRMeasure />} />
        <Route path="/rom/shoulder-flex-l/rest" element={<ShoulderFlexLRest />} />
        <Route path="/rom/shoulder-flex-l/measure" element={<ShoulderFlexLMeasure />} />
        <Route path="/rom/shoulder-flex-r/rest" element={<ShoulderFlexRRest />} />
        <Route path="/rom/shoulder-flex-r/measure" element={<ShoulderFlexRMeasure />} />
      </Routes>
    </Router>
  );
}

export default App;



