// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UseCasesDashboard } from './components/UseCasesDashboard';
import TerminalSimulator from './components/TerminalSimulator';
import { SOCmain } from './components/dashboard/SOCmain';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UseCasesDashboard />} />
        <Route path="/terminal-simulation" element={<TerminalSimulator />} />
        <Route path="/soar-dashboard" element={<SOCmain />} />
        <Route path="*" element={<div className="flex items-center justify-center min-h-screen text-xl">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;