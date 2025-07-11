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
  const [selectedSide, setSelectedSide] = useState('shoulder-abd-l');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'users', user.uid, 'romMeasurements', selectedSide, 'records'),
        orderBy('timestamp', 'asc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        date: doc.data().timestamp?.toDate().toLocaleDateString(),
      }));

      setRecords(data);
    };

    fetchRecords();
  }, [selectedSide]);

  const chartData = {
    labels: records.map(r => r.date),
    datasets: [
      {
        label: selectedSide === 'shoulder-abd-l' ? 'Left Shoulder' : 'Right Shoulder',
        data: records.map(r => r.angle),
        fill: false,
        borderColor: selectedSide === 'shoulder-abd-l' ? 'orange' : 'blue',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      {/* 頂部標題列 */}
      <div className="dashboard-top-bar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-top-right">
          <img src="/gamemenu-icon.png" alt="Game Menu" className="nav-icon" onClick={() => navigate('/game-menu')} />
          <img src="/user-icon.png" alt="User Data" className="nav-icon" onClick={() => navigate('/user-data')} />
        </div>
      </div>

      {/* 下拉選單 */}
      <div className="dashboard-header">
        <h2>Shoulder Abduction History</h2>
        <select value={selectedSide} onChange={e => setSelectedSide(e.target.value)}>
          <option value="shoulder-abd-l">Left Shoulder</option>
          <option value="shoulder-abd-r">Right Shoulder</option>
        </select>
      </div>

      {/* 折線圖 */}
      <div className="chart-section">
        <Line data={chartData} />
      </div>

      {/* 歷史記錄（由新至舊） */}
      <div className="record-list">
        {records.slice().reverse().map((rec, idx) => (
          <div key={idx} className="record-item">
            <span>{rec.date}</span>
            <span>{rec.angle.toFixed(1)}°</span>
          </div>
        ))}
      </div>

      {/* 底部按鈕（可選擇保留或移除） */}
      {/* <div className="nav-buttons">
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
      </div> */}
    </div>
  );
};

export default Dashboard;
