import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <img src="dancer.gif" alt="Dancing Character" className="dancer-gif" />
      <h1 className="title-text">FunMotion</h1>
      <div className="button-container">
        <Link to="/login" className="home-button">Log In</Link>
        <Link to="/signup" className="home-button">Sign Up</Link>
      </div>
  </div>
  );
}

export default HomePage;
