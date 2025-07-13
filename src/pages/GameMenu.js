// pages/GameMenu.js
import React from 'react';
import './GameMenu.css';
import { Link } from 'react-router-dom';

const GameMenu = () => {
  return (
    <div className="game-menu-container">
      <h1 className="game-menu-title">Game Menu</h1>

      <div className="game-menu-grid">
        <div className="game-menu-card">
          <Link to="/rom/shoulder-abd-l/rest" className="menu-link">
            <img src="/measure-rom.png" alt="ROM Icon" className="menu-icon" />
            <p className="menu-label">Measure Range of Motion</p>
            <p className="menu-note">If this is your first time, please start by measuring your joint range.</p>
          </Link>
        </div>

        <div className="game-menu-card small">
          <Link to="/user-data" className="menu-link">
            <img src="/user-icon.png" alt="User Icon" className="menu-icon small" />
            <p className="menu-label">Profile</p>
          </Link>
        </div>

        <div className="game-menu-card small">
          <Link to="/dashboard" className="menu-link">
            <img src="/dashboard-icon.png" alt="Dashboard Icon" className="menu-icon small" />
            <p className="menu-label">Dashboard</p>
          </Link>
        </div>

        <div className="game-menu-card">
          <Link to="/instruction-wipe-glass" className="menu-link">
            <img src="/wipe-glass-icon.png" alt="Wipe Glass Icon" className="menu-icon" />
            <p className="menu-label">Wipe Glass</p>
            <p className="menu-note">This is a game to practice straightening and raising your arms~</p>
          </Link>
        </div>

        <div className="game-menu-card">
          <Link to="/game-badminton" className="menu-link">
            <img src="/badminton-icon.png" alt="Badminton Icon" className="menu-icon" />
            <p className="menu-label">Badminton Game</p>
            <p className="menu-note">This game has not been built successfully</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;
