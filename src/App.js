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
import Record from './pages/Record';
import UserData from './pages/UserData';
import ShoulderAbdLRest from './pages/ROM/ShoulderAbdL/RestPost';
import ShoulderAbdLMeasure from './pages/ROM/ShoulderAbdL/Measure';
import ShoulderAbdRRest from './pages/ROM/ShoulderAbdR/RestPost';
import ShoulderAbdRMeasure from './pages/ROM/ShoulderAbdR/Measure';
import GameWipeGlass from './pages/GameWipeGlass';
import InstructionWipeGlass from './pages/InstructionWipeGlass';
import GameBadminton from './pages/GameBadminton';
import InstructionBadminton from './pages/InstructionBadminton';

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
        <Route path="/record" element={<Record />} />
        <Route path="/user-data" element={<UserData />} />
        <Route path="/rom/shoulder-abd-l/rest" element={<ShoulderAbdLRest />} />
        <Route path="/rom/shoulder-abd-l/measure" element={<ShoulderAbdLMeasure />} />
        <Route path="/rom/shoulder-abd-r/rest" element={<ShoulderAbdRRest />} />
        <Route path="/rom/shoulder-abd-r/measure" element={<ShoulderAbdRMeasure />} />
        <Route path="/game-wipe-glass" element={<GameWipeGlass />} />
        <Route path="/instruction-wipe-glass" element={<InstructionWipeGlass />} />
        <Route path="/game-badminton" element={<GameBadminton />} />
        <Route path="/instruction-badminton" element={<InstructionBadminton />} />
      </Routes>
    </Router>
  );
}

export default App;
