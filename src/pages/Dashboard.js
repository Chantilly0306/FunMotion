// pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { db, auth } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [selectedGame, setSelectedGame] = useState('romMeasurements');
  const [selectedMetric, setSelectedMetric] = useState('shoulder-abd-l');
  const navigate = useNavigate();

  const measurementMetrics = [
    { label: 'Left Shoulder Abduction', value: 'shoulder-abd-l' },
    { label: 'Right Shoulder Abduction', value: 'shoulder-abd-r' },
  ];

  const wipeMetrics = [
    { label: 'Left Shoulder Flexion', value: 'shoulder-flex-l' },
    { label: 'Right Shoulder Flexion', value: 'shoulder-flex-r' },
    { label: 'Left Elbow Extension', value: 'elbow-ext-l' },
    { label: 'Right Elbow Extension', value: 'elbow-ext-r' },
  ];

  useEffect(() => {
    const validOptions =
      selectedGame === 'romMeasurements' ? measurementMetrics : wipeMetrics;
    const isValid = validOptions.some((opt) => opt.value === selectedMetric);
    if (!isValid) {
      setSelectedMetric(validOptions[0].value);
    }
  }, [selectedGame]);

  useEffect(() => {
    const fetchRecords = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const side = selectedMetric.endsWith('-l') ? 'left' : 'right';

      if (selectedGame === 'romMeasurements') {
        const q = query(
          collection(
            db,
            'users',
            user.uid,
            'romMeasurements',
            selectedMetric,
            'records'
          ),
          orderBy('timestamp', 'asc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          date: doc.data().timestamp?.toDate().toLocaleDateString(),
        }));
        setRecords(data);
      } else {
        const allDifficulties = ['easy', 'medium', 'difficult'];
        let combinedData = [];

        for (const difficulty of allDifficulties) {
          const q = query(
            collection(db, 'users', user.uid, 'wipeGlass', side, difficulty),
            orderBy('timestamp', 'asc')
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            difficulty,
            date: doc.data().timestamp?.toDate().toLocaleDateString(),
            timeValue: doc.data().timestamp?.toMillis(),
            side,
          }));
          combinedData = combinedData.concat(data);
        }

        combinedData.sort((a, b) => a.timeValue - b.timeValue);
        setRecords(combinedData);
      }
    };

    fetchRecords();
  }, [selectedGame, selectedMetric]);

  const chartData = {
    labels: records.map((r) => r.date),
    datasets: [
      {
        label:
          selectedGame === 'romMeasurements'
            ? selectedMetric
            : selectedMetric.includes('shoulder')
            ? 'Shoulder Flexion'
            : 'Elbow Extension',
        data: records.map((r) =>
          selectedGame === 'romMeasurements'
            ? r.angle
            : selectedMetric.includes('shoulder')
            ? r.shoulderFlex
            : r.elbowExtend
        ),
        fill: false,
        borderColor: selectedMetric.includes('shoulder') ? 'orange' : 'blue',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        min: 20,
        max: 180,
        ticks: {
          stepSize: 5,
        },
        title: {
          display: true,
          text: 'Angle (°)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 16,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const metricOptions =
    selectedGame === 'romMeasurements' ? measurementMetrics : wipeMetrics;

  return (
    <div className="dashboard-container">
      <div className="dashboard-top-bar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-top-right">
          <img
            src="/gamemenu-icon.png"
            alt="Game Menu"
            className="nav-icon"
            onClick={() => navigate('/game-menu')}
          />
          <img
            src="/user-icon.png"
            alt="User Data"
            className="nav-icon"
            onClick={() => navigate('/user-data')}
          />
        </div>
      </div>

      <div className="dashboard-header">
        <div>
          <label>Game:&nbsp;</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="romMeasurements">Measurements</option>
            <option value="wipeGlass">Wipe Glass</option>
          </select>
        </div>

        <div>
          <label>Movement:&nbsp;</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {metricOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-section">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="record-list">
        {records
          .slice()
          .reverse()
          .map((rec, idx) => (
            <div key={idx} className="record-item">
              <span>{rec.date}</span>
              {selectedGame === 'romMeasurements' ? (
                <span>{rec.angle?.toFixed(1)}°</span>
              ) : (
                <span>
                  {selectedMetric.includes('shoulder')
                    ? rec.shoulderFlex?.toFixed(1)
                    : rec.elbowExtend?.toFixed(1)}
                  ° / {rec.duration?.toFixed(1)}seconds / {rec.difficulty} /{' '}
                  {rec.side === 'left' ? 'Left' : 'Right'}
                </span>
              )}
            </div>
          ))}
      </div>

      <div className="nav-buttons">
        <img
          src="/gamemenu-icon.png"
          alt="Game Menu"
          onClick={() => navigate('/game-menu')}
          className="nav-icon"
        />
        <img
          src="/user-icon.png"
          alt="User Info"
          onClick={() => navigate('/user-data')}
          className="nav-icon"
        />
      </div>
    </div>
  );
};

export default Dashboard;
