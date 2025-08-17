import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLeagues } from '../hooks/useApi';

const Leagues = () => {
  const [filter, setFilter] = useState('all');
  
  const { 
    data: leaguesData, 
    loading, 
    error, 
    refetch, 
    isMockMode 
  } = useLeagues();

  // Filter leagues based on selected filter
  const filteredLeagues = useMemo(() => {
    if (!leaguesData?.response) return [];
    
    return leaguesData.response.filter(leagueData => {
      if (filter === 'all') return true;
      if (filter === 'league') return leagueData.league.type === 'League';
      if (filter === 'cup') return leagueData.league.type === 'Cup';
      return true;
    });
  }, [leaguesData, filter]);

  // Get filter counts
  const filterCounts = useMemo(() => {
    if (!leaguesData?.response) return { all: 0, league: 0, cup: 0 };
    
    const leagues = leaguesData.response;
    return {
      all: leagues.length,
      league: leagues.filter(l => l.league.type === 'League').length,
      cup: leagues.filter(l => l.league.type === 'Cup').length
    };
  }, [leaguesData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Loading leagues... {isMockMode ? '(Mock Data)' : '(Live API)'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-red-800 font-medium text-lg mb-2">
            Failed to Load Leagues
          </h3>
          <p className="text-red-600 text-sm mb-4">
            {error.message}
          </p>
          <div className="space-x-4">
            <button
              onClick={refetch}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            {!isMockMode && (
              <button
                onClick={() => {
                  localStorage.setItem('mock_mode', 'true');
                  window.location.reload();
                }}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Switch to Mock Mode
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Leagues & Competitions
            </h1>
            <p className="text-gray-600 mt-1">
              Browse {filterCounts.all} football leagues and competitions worldwide
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {isMockMode && (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                🧪 Demo Mode
              </span>
            )}
            <button
              onClick={refetch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({filterCounts.all})
          </button>
          <button
            onClick={() => setFilter('league')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'league' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Leagues ({filterCounts.league})
          </button>
          <button
            onClick={() => setFilter('cup')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cup' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cups ({filterCounts.cup})
          </button>
        </div>

        {/* Active Filter Indicator */}
        {filter !== 'all' && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <span className="text-blue-800 text-sm">
              Showing {filteredLeagues.length} {filter === 'league' ? 'leagues' : 'cups'}
            </span>
            <button
              onClick={() => setFilter('all')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Leagues Grid */}
      {filteredLeagues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeagues.map((leagueData) => (
            <Link
              key={leagueData.league.id}
              to={`/league/${leagueData.league.id}?season=${leagueData.seasons[leagueData.seasons.length - 1]?.year}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 hover:border-blue-300 group"
            >
              <div className="flex items-center mb-4">
                {leagueData.league.logo && (
                  <img 
                    src={leagueData.league.logo} 
                    alt={leagueData.league.name}
                    className="w-12 h-12 mr-4 object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=⚽';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {leagueData.league.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    {leagueData.country.flag && (
                      <img 
                        src={leagueData.country.flag} 
                        alt={leagueData.country.name}
                        className="w-4 h-3 object-cover rounded"
                      />
                    )}
                    {leagueData.country.name}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                    leagueData.league.type === 'League' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {leagueData.league.type}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 space-y-1">
                <p>ID: <span className="font-medium">{leagueData.league.id}</span></p>
                {leagueData.seasons && leagueData.seasons.length > 0 && (
                  <p>
                    Current Season: <span className="font-medium">
                      {leagueData.seasons[leagueData.seasons.length - 1]?.year}
                    </span>
                  </p>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                  View League Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">⚽</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {filter === 'all' ? 'leagues' : filter === 'league' ? 'leagues' : 'cups'} found
            </h3>
            <p className="text-gray-600 mb-4">
              {filter !== 'all' ? (
                <>Try a different filter or <button 
                  onClick={() => setFilter('all')} 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  view all leagues
                </button></>
              ) : (
                isMockMode 
                  ? 'Mock data may have limited leagues. Try switching to live API.' 
                  : 'Unable to load leagues at this time.'
              )}
            </p>
            
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Show All Leagues
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mock Mode Notice */}
      {isMockMode && filteredLeagues.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <span>🧪</span>
            <span className="font-medium">Demo Mode Active</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            You're viewing sample data. Toggle to Live API in the bottom-right corner for real-time league information.
          </p>
        </div>
      )}
    </div>
  );
};

export default Leagues;