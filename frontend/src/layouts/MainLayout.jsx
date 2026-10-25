import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import ToastContainer from '../components/common/ToastContainer';
import Badge from '../components/common/Badge';
import './MainLayout.css';

export const MainLayout = () => {
  return (
    <div className="app-layout">
      {/* Reusable Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header />

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div>
            <strong>BookNest</strong> — Library Management System with Book Recommendations
            <span style={{ margin: '0 0.5rem' }}>•</span>
            University PBL & Portfolio Project
          </div>
          <div className="footer-tags">
            <Badge variant="neutral" size="sm">React SPA</Badge>
            <Badge variant="neutral" size="sm">Redux Toolkit</Badge>
            <Badge variant="neutral" size="sm">Express & MongoDB</Badge>
            <Badge variant="purple" size="sm">FastAPI AI</Badge>
          </div>
        </footer>
      </div>

      {/* Global Toast Alert Notifications */}
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
