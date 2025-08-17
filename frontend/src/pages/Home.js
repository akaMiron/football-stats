import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useFixtures } from "../hooks/useApi";

const Home = () => {
  // Filter states
  const [selectedLeague, setSelectedLeague] = useState('top-leagues');
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Define top leagues
  const topLeagues = [
    { id: 39, name: "Premier League" },
    { id: 140, name: "La Liga" },
    { id: 135, name: "Serie A" },
    { id: 78, name: "Bundesliga" },
    { id: 61, name: "Ligue 1" },
    { id: 2, name: "Champions League" },
    { id: 3, name: "Europa League" },
    { id: 848, name: "Europa Conference League" }
  ];

  const topLeagueIds = topLeagues.map(league => league.id);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Create dynamic API parameters based on current filters
  const apiParams = useMemo(() => {
    const params = {};
    
    // Add date-specific parameters
    switch (selectedDate) {
      case 'today':
        params.date = today;
        break;
      case 'tomorrow':
        params.date = tomorrow;
        break;
      case 'yesterday':
        params.date = yesterday;
        break;
      case 'live':
        params.live = 'all';
        break;
      default:
        // For 'all' dates, don't add date filter
        break;
    }
    
    // Add league filter if specific league is selected
    if (selectedLeague !== 'top-leagues' && selectedLeague !== 'all') {
      params.league = parseInt(selectedLeague);
      params.season = new Date().getFullYear();
    }

    return params;
  }, [selectedLeague, selectedDate, today, tomorrow, yesterday]);

  // Use ONLY ONE hook that changes parameters dynamically
  const {
    data: fixturesData,
    loading,
    error,
    isMockMode,
    refetch,
  } = useFixtures(apiParams);

  // Filter fixtures based on selected filters (client-side filtering)
  const filteredFixtures = useMemo(() => {
    if (!fixturesData?.response) return [];
    
    let fixtures = fixturesData.response;
    
    // Filter by league (only if not already filtered by API)
    if (selectedLeague === 'top-leagues') {
      fixtures = fixtures.filter(fixture => 
        topLeagueIds.includes(fixture.league.id)
      );
    } else if (selectedLeague !== 'all' && !apiParams.league) {
      // Only filter client-side if we didn't filter server-side
      fixtures = fixtures.filter(fixture => 
        fixture.league.id === parseInt(selectedLeague)
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      fixtures = fixtures.filter(fixture => {
        const status = fixture.fixture.status.short;
        switch (selectedStatus) {
          case 'live':
            return ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(status);
          case 'finished':
            return ['FT', 'AET', 'PEN'].includes(status);
          case 'scheduled':
            return ['TBD', 'NS'].includes(status);
          case 'postponed':
            return ['PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status);
          default:
            return true;
        }
      });
    }
    
    // Sort fixtures by date and status
    return fixtures.sort((a, b) => {
      const dateA = new Date(a.fixture.date);
      const dateB = new Date(b.fixture.date);
      
      // Live matches first
      const isLiveA = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(a.fixture.status.short);
      const isLiveB = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(b.fixture.status.short);
      
      if (isLiveA && !isLiveB) return -1;
      if (!isLiveA && isLiveB) return 1;
      
      return dateB - dateA; // Most recent first
    });
  }, [fixturesData, selectedLeague, selectedStatus, topLeagueIds, apiParams.league]);

  // Get unique leagues from fixtures for filter options
  const availableLeagues = useMemo(() => {
    if (!fixturesData?.response) return [];
    
    const leagueMap = new Map();
    fixturesData.response.forEach(fixture => {
      leagueMap.set(fixture.league.id, {
        id: fixture.league.id,
        name: fixture.league.name,
        logo: fixture.league.logo,
        country: fixture.league.country
      });
    });
    
    return Array.from(leagueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [fixturesData]);

  // Get match status display
  const getMatchStatus = (fixture) => {
    const status = fixture.fixture.status;
    const elapsed = status.elapsed;
    
    switch (status.short) {
      case 'TBD':
        return { text: 'Time TBD', color: 'text-gray-500' };
      case 'NS':
        return { text: new Date(fixture.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: 'text-gray-600' };
      case '1H':
        return { text: `${elapsed}'`, color: 'text-green-600 animate-pulse' };
      case 'HT':
        return { text: 'Half Time', color: 'text-yellow-600' };
      case '2H':
        return { text: `${elapsed}'`, color: 'text-green-600 animate-pulse' };
      case 'ET':
        return { text: `${elapsed}' ET`, color: 'text-orange-600 animate-pulse' };
      case 'BT':
        return { text: 'Break Time', color: 'text-yellow-600' };
      case 'P':
        return { text: 'Penalties', color: 'text-red-600 animate-pulse' };
      case 'FT':
        return { text: 'Full Time', color: 'text-gray-600' };
      case 'AET':
        return { text: 'After ET', color: 'text-gray-600' };
      case 'PEN':
        return { text: 'Penalties', color: 'text-gray-600' };
      case 'PST':
        return { text: 'Postponed', color: 'text-red-500' };
      case 'CANC':
        return { text: 'Cancelled', color: 'text-red-500' };
      case 'ABD':
        return { text: 'Abandoned', color: 'text-red-500' };
      case 'AWD':
        return { text: 'Awarded', color: 'text-blue-500' };
      case 'WO':
        return { text: 'Walk Over', color: 'text-blue-500' };
      case 'LIVE':
        return { text: `${elapsed}'`, color: 'text-green-600 animate-pulse' };
      default:
        return { text: status.long, color: 'text-gray-500' };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Loading {selectedDate === 'live' ? 'live' : selectedDate} fixtures... {isMockMode ? "(Mock Data)" : "(Live API)"}
          </p>
          <p className="text-xs text-gray-500">
            API Call: {JSON.stringify(apiParams)}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-red-800 font-medium text-lg mb-2">
            Failed to Load Fixtures
          </h3>
          <p className="text-red-600 text-sm mb-4">
            {error.message}
          </p>
          <p className="text-xs text-gray-600 mb-4">
            API Parameters: {JSON.stringify(apiParams)}
          </p>
          <button
            onClick={refetch}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const allFixturesData = fixturesData?.response || [];

  return (
    <div>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Football Fixtures</h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing {filteredFixtures.length} of {allFixturesData.length} fixtures
          </p>
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-1">
              API Params: {JSON.stringify(apiParams)}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
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

      {/* Enhanced Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
        {/* Date Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Date</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'live', label: '🔴 Live', desc: 'Currently playing matches' },
              { key: 'today', label: 'Today', desc: new Date().toLocaleDateString() },
              { key: 'tomorrow', label: 'Tomorrow', desc: new Date(Date.now() + 86400000).toLocaleDateString() },
              { key: 'yesterday', label: 'Yesterday', desc: new Date(Date.now() - 86400000).toLocaleDateString() },
              { key: 'all', label: 'All Dates', desc: 'No date filter' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedDate(key)}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  selectedDate === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Matches', desc: 'All match statuses' },
              { key: 'live', label: '🔴 Live', desc: 'Currently playing' },
              { key: 'scheduled', label: '📅 Scheduled', desc: 'Not yet started' },
              { key: 'finished', label: '✅ Finished', desc: 'Completed matches' },
              { key: 'postponed', label: '⏸️ Postponed', desc: 'Cancelled or postponed' },
            ].map(({ key, label, desc }) => (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  selectedStatus === key
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* League Filter */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by League</h3>
          
          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedLeague('top-leagues')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                selectedLeague === 'top-leagues'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Show only top European leagues"
            >
              ⭐ Top Leagues
            </button>
            <button
              onClick={() => setSelectedLeague('all')}
              className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                selectedLeague === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Show all available leagues"
            >
              All Leagues
            </button>
          </div>

          {/* Top Leagues Quick Access */}
          <div className="flex flex-wrap gap-2 mb-4">
            {topLeagues.map(league => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id.toString())}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  selectedLeague === league.id.toString()
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                }`}
                title={`Show only ${league.name} matches`}
              >
                {league.name}
              </button>
            ))}
          </div>

          {/* Dropdown for All Available Leagues */}
          {availableLeagues.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Or select from all available leagues:
              </label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="top-leagues">⭐ Top Leagues ({topLeagues.length})</option>
                <option value="all">All Leagues ({availableLeagues.length})</option>
                <optgroup label="Specific Leagues">
                  {availableLeagues.map(league => (
                    <option key={league.id} value={league.id.toString()}>
                      {league.name} ({league.country})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedDate !== 'today' || selectedLeague !== 'top-leagues' || selectedStatus !== 'all') && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-700 font-medium">Active filters:</span>
            {selectedDate !== 'today' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Date: {selectedDate}
              </span>
            )}
            {selectedLeague !== 'top-leagues' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                League: {selectedLeague === 'all' ? 'All' : availableLeagues.find(l => l.id.toString() === selectedLeague)?.name || selectedLeague}
              </span>
            )}
            {selectedStatus !== 'all' && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Status: {selectedStatus}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedDate('today');
                setSelectedLeague('top-leagues');
                setSelectedStatus('all');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs underline ml-2"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Fixtures List */}
      {filteredFixtures.length > 0 ? (
        <div className="space-y-4">
          {filteredFixtures.map((fixture) => {
            const statusInfo = getMatchStatus(fixture);
            const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(fixture.fixture.status.short);
            
            return (
              <Link
                key={fixture.fixture.id}
                to={`/match/${fixture.fixture.id}`}
                className={`block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border hover:border-blue-300 ${
                  isLive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Home Team */}
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {fixture.teams.home.logo && (
                        <img
                          src={fixture.teams.home.logo}
                          alt={fixture.teams.home.name}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32x32?text=H";
                          }}
                        />
                      )}
                      <span className={`font-medium text-right truncate ${
                        fixture.teams.home.winner === true ? 'text-green-700 font-bold' :
                        fixture.teams.home.winner === false ? 'text-red-600' : ''
                      }`}>
                        {fixture.teams.home.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div className="text-center px-4">
                      {fixture.fixture.status.short !== "NS" && fixture.fixture.status.short !== "TBD" ? (
                        <div className={`text-xl font-bold ${isLive ? 'text-green-600' : 'text-gray-900'}`}>
                          {fixture.goals.home} : {fixture.goals.away}
                        </div>
                      ) : (
                        <div className="text-gray-500 font-medium">vs</div>
                      )}
                      <div className={`text-xs mt-1 ${statusInfo.color}`}>
                        {statusInfo.text}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className={`font-medium truncate ${
                        fixture.teams.away.winner === true ? 'text-green-700 font-bold' :
                        fixture.teams.away.winner === false ? 'text-red-600' : ''
                      }`}>
                        {fixture.teams.away.name}
                      </span>
                      {fixture.teams.away.logo && (
                        <img
                          src={fixture.teams.away.logo}
                          alt={fixture.teams.away.name}
                          className="w-8 h-8 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/32x32?text=A";
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="text-right ml-4">
                    <div className="text-sm text-gray-500">
                      {new Date(fixture.fixture.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                      {fixture.league.logo && (
                        <img
                          src={fixture.league.logo}
                          alt={fixture.league.name}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {fixture.league.name}
                    </div>
                    {topLeagueIds.includes(fixture.league.id) && (
                      <div className="text-xs text-blue-600 font-medium mt-1">
                        ⭐ Top League
                      </div>
                    )}
                    {fixture.fixture.venue?.name && (
                      <div className="text-xs text-gray-400 mt-1">
                        📍 {fixture.fixture.venue.name}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">⚽</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Fixtures Found
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedDate === 'live' 
                ? "No live matches at the moment."
                : selectedLeague === 'top-leagues' 
                ? `No fixtures found for top leagues on ${selectedDate}.`
                : selectedLeague === 'all'
                ? `No fixtures available for ${selectedDate}.`
                : `No fixtures found for the selected league on ${selectedDate}.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {selectedLeague !== 'all' && (
                <button
                  onClick={() => setSelectedLeague('all')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Show all leagues
                </button>
              )}
              {selectedDate !== 'today' && (
                <button
                  onClick={() => setSelectedDate('today')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Show today's matches
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {allFixturesData.length > 0 && (
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            {selectedDate === 'live' && "Showing live matches"}
            {selectedDate === 'today' && "Showing today's matches"}
            {selectedDate === 'tomorrow' && "Showing tomorrow's matches"}
            {selectedDate === 'yesterday' && "Showing yesterday's matches"}
            {selectedDate === 'all' && "Showing all available matches"}
            {selectedLeague === 'top-leagues' && (
              <> from <strong>{topLeagues.length} top leagues</strong></>
            )}
            {selectedLeague === 'all' && (
              <> from <strong>all {availableLeagues.length} leagues</strong></>
            )}
            {selectedLeague !== 'top-leagues' && selectedLeague !== 'all' && (
              <> from <strong>{availableLeagues.find(l => l.id.toString() === selectedLeague)?.name || 'selected league'}</strong></>
            )}
            {selectedStatus !== 'all' && (
              <> • <strong>{selectedStatus}</strong> matches only</>
            )}
            {isMockMode && (
              <span className="ml-2 text-yellow-600">• Demo data may be limited</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;