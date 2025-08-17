import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useMultipleApi } from '../hooks/useApi';

const LeagueDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const season = searchParams.get('season') || new Date().getFullYear();
  const [activeTab, setActiveTab] = useState('standings');

  // Use multiple API calls for efficiency
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    isMockMode 
  } = useMultipleApi({
    standings: {
      method: 'getStandings',
      params: { league: id, season: season }
    },
    fixtures: {
      method: 'getFixtures',
      params: { league: id, season: season, last: 20 }
    }
  });

  const standings = data.standings?.response?.[0];
  const fixtures = data.fixtures?.response || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return 'Invalid date';
    }
  };

  const getMatchStatus = (fixture) => {
    if (!fixture?.fixture?.status) return 'Unknown';
    
    if (fixture.fixture.status.short === 'FT') return 'FT';
    if (fixture.fixture.status.short === 'LIVE') return 'LIVE';
    if (fixture.fixture.status.short === 'NS') return formatDate(fixture.fixture.date);
    return fixture.fixture.status.short;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Loading league details... {isMockMode ? '(Mock Data)' : '(Live API)'}
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
            Failed to Load League Data
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Unable to load data for league {id}
          </p>
          <div className="space-x-4">
            <button
              onClick={refetch}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/leagues"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
            >
              Back to Leagues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* League Header */}
      {standings && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {standings.league.logo && (
                  <img 
                    src={standings.league.logo} 
                    alt={standings.league.name}
                    className="w-16 h-16 mr-4 object-contain"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=⚽';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {standings.league.name}
                  </h1>
                  <p className="text-gray-600">{standings.league.country}</p>
                  <p className="text-sm text-gray-500">Season {standings.league.season}</p>
                </div>
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
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {standings.league.standings?.[0]?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Teams</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {fixtures.length}
                </div>
                <div className="text-sm text-gray-600">Recent Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {standings.league.season}
                </div>
                <div className="text-sm text-gray-600">Season</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'standings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Standings
                {standings?.league?.standings?.[0] && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({standings.league.standings[0].length})
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'fixtures'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Matches
                {fixtures.length > 0 && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({fixtures.length})
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Standings Tab */}
      {activeTab === 'standings' && standings && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">League Table</h3>
            <p className="text-sm text-gray-600">
              {standings.league.season} season standings
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MP
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    D
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GF
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GD
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pts
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(standings.league.standings?.[0] || []).map((team) => {
                  const rankColor = team.rank <= 4 ? 'border-l-4 border-l-green-500' :
                                   team.rank <= 6 ? 'border-l-4 border-l-blue-500' :
                                   team.rank >= standings.league.standings[0].length - 2 ? 'border-l-4 border-l-red-500' :
                                   'border-l-4 border-l-transparent';
                  
                  return (
                    <tr key={team.team.id} className={`hover:bg-gray-50 transition-colors ${rankColor}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/team/${team.team.id}?league=${id}&season=${season}`}
                          className="flex items-center hover:text-blue-600 transition-colors"
                        >
                          {team.team.logo && (
                            <img 
                              src={team.team.logo} 
                              alt={team.team.name}
                              className="w-6 h-6 mr-3 object-contain"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/24x24?text=T';
                              }}
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {team.team.name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.win}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.draw}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.lose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.goals.for}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {team.all.goals.against}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`font-medium ${
                          team.goalsDiff > 0 ? 'text-green-600' :
                          team.goalsDiff < 0 ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                        {team.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Legend */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500"></div>
                <span>Champions League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500"></div>
                <span>Europa League</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500"></div>
                <span>Relegation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixtures Tab */}
      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          {fixtures.length > 0 ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Recent Matches</h3>
                <p className="text-sm text-gray-600">
                  Last {fixtures.length} matches in {standings?.league?.name || 'this league'}
                </p>
              </div>
              
              {fixtures.map((fixture) => (
                <Link
                  key={fixture.fixture.id}
                  to={`/match/${fixture.fixture.id}`}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 hover:border-blue-300"
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
                              e.target.src = 'https://via.placeholder.com/32x32?text=H';
                            }}
                          />
                        )}
                        <span className="font-medium text-right truncate">
                          {fixture.teams.home.name}
                        </span>
                      </div>
                      
                      {/* Score */}
                      <div className="text-center px-4">
                        {fixture.fixture.status.short === 'FT' ? (
                          <div className="text-lg font-bold text-gray-900">
                            {fixture.goals.home} - {fixture.goals.away}
                          </div>
                        ) : (
                          <div className="text-gray-500 font-medium">vs</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {getMatchStatus(fixture)}
                        </div>
                      </div>
                      
                      {/* Away Team */}
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <span className="font-medium truncate">
                          {fixture.teams.away.name}
                        </span>
                        {fixture.teams.away.logo && (
                          <img 
                            src={fixture.teams.away.logo} 
                            alt={fixture.teams.away.name}
                            className="w-8 h-8 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/32x32?text=A';
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Match Info */}
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(fixture.fixture.date)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {fixture.league.round?.replace(/^[^0-9]*/, '') || 'Round N/A'}
                      </div>
                      {fixture.fixture.status.short === 'FT' && (
                        <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                          fixture.fixture.status.short === 'FT' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Full Time
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                <div className="text-gray-400 text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Matches</h3>
                <p className="text-gray-600">
                  {isMockMode 
                    ? 'Mock data may have limited fixtures. Try switching to live API.' 
                    : 'No recent matches found for this league.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data State */}
      {!standings && !loading && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">League Not Found</h3>
            <p className="text-gray-600 mb-4">
              Unable to find league data for ID: {id}
            </p>
            <Link
              to="/leagues"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
            >
              Browse All Leagues
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueDetails;