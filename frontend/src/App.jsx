import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import SafetyMonitor from './pages/SafetyMonitor';
import CrackDetection from './pages/CrackDetection';
import ProjectPlanning from './pages/ProjectPlanning';
import Valuation from './pages/Valuation';
import DailyAssistant from './pages/DailyAssistant';
import WeatherAdvisory from './pages/WeatherAdvisory';
import KnowledgeBase from './pages/KnowledgeBase';
import ConstructionChat from './pages/ConstructionChat';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/safety" element={<SafetyMonitor />} />
          <Route path="/crack" element={<CrackDetection />} />
          <Route path="/planning" element={<ProjectPlanning />} />
          <Route path="/valuation" element={<Valuation />} />
          <Route path="/assistant" element={<DailyAssistant />} />
          <Route path="/weather" element={<WeatherAdvisory />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/chat" element={<ConstructionChat />} />
        </Routes>
      </main>
    </div>
  );
}
