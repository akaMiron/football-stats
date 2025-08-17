import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Leagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leagues`);
      setLeagues(response.data.response);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(leagueData => {
    if (filter === 'all') return true;
    if (filter === 'league') return leagueData.league.type === 'League';
    if (filter === 'cup') return leagueData.league.type === 'Cup';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Leagues & Competitions</h1>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('league')}
            className={`px-4 py-2 rounded-md ${
              filter === 'league' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Leagues
          </button>
          <button
            onClick={() => setFilter('cup')}
            className={`px-4 py-2 rounded-md ${
              filter === 'cup' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cups
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeagues.map((leagueData) => (
          <Link
            key={leagueData.league.id}
            to={`/league/${leagueData.league.id}?season=${leagueData.seasons[leagueData.seasons.length - 1]?.year}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-center mb-4">
              {leagueData.league.logo && (
                <img 
                  src={leagueData.league.logo} 
                  alt={leagueData.league.name}
                  className="w-12 h-12 mr-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {leagueData.league.name}
                </h3>
                <p className="text-sm text-gray-600">{leagueData.country.name}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  leagueData.league.type === 'League' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {leagueData.league.type}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-700">
              <p>Code: {leagueData.league.id}</p>
              {leagueData.seasons && leagueData.seasons.length > 0 && (
                <p>
                  Current Season: {leagueData.seasons[leagueData.seasons.length - 1]?.year}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredLeagues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No leagues found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default Leagues;