import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Leagues from './pages/Leagues';
import LeagueDetails from './pages/LeagueDetails';
import MatchDetails from './pages/MatchDetails';
import TeamDetails from './pages/TeamDetails';

function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leagues" element={<Leagues />} />
            <Route path="/league/:id" element={<LeagueDetails />} />
            <Route path="/match/:id" element={<MatchDetails />} />
            <Route path="/team/:id" element={<TeamDetails />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;