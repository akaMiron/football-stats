import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useMultipleApi } from '../hooks/useApi';

const TeamDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const league = searchParams.get('league');
  const season = searchParams.get('season') || new Date().getFullYear();

  // Build API calls object conditionally
  const apiCalls = {
    team: {
      method: 'getTeam',
      params: id
    },
    fixtures: {
      method: 'getFixtures',
      params: { team: id, last: 10 }
    }
  };

  // Add statistics only if league is provided
  if (league) {
    apiCalls.statistics = {
      method: 'getTeamStatistics',
      params: { id: id, league: league, season: season }
    };
  }

  const { 
    data, 
    loading, 
    error, 
    refetch, 
    isMockMode 
  } = useMultipleApi(apiCalls);

  const team = data.team?.response?.[0];
  const fixtures = data.fixtures?.response || [];
  const statistics = data.statistics?.response;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return 'Invalid date';
    }
  };

  const getMatchResult = (fixture, teamId) => {
    if (fixture.fixture.status.short !== 'FT') return null;
    
    const isHome = fixture.teams.home.id === parseInt(teamId);
    const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
    const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;
    
    if (teamScore > opponentScore) return 'W';
    if (teamScore < opponentScore) return 'L';
    return 'D';
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'W': return 'bg-green-100 text-green-800 border-green-200';
      case 'L': return 'bg-red-100 text-red-800 border-red-200';
      case 'D': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Loading team details... {isMockMode ? '(Mock Data)' : '(Live API)'}
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
            Failed to Load Team Data
          </h3>
          <p className="text-red-600 text-sm mb-4">
            Unable to load data for team {id}
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

  if (!team) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Not Found</h3>
          <p className="text-gray-600 mb-4">
            Unable to find team with ID: {id}
          </p>
          <Link
            to="/leagues"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-block"
          >
            Browse All Leagues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {team.team.logo && (
              <img 
                src={team.team.logo} 
                alt={team.team.name}
                className="w-24 h-24 mr-6 object-contain"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/96x96?text=T';
                }}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {team.team.name}
              </h1>
              <p className="text-gray-600 mb-1 flex items-center gap-2">
                <span>📍</span>
                {team.team.country}
              </p>
              <p className="text-sm text-gray-500">
                Founded: {team.team.founded || 'Unknown'}
              </p>
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

        {/* Team Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Club Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>ℹ️</span>
              Club Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="font-medium">{team.team.code || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">National Team:</span>
                <span className="font-medium">{team.team.national ? 'Yes' : 'No'}</span>
              </div>
              {team.venue && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium text-right">{team.venue.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">
                      {team.venue.capacity?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{team.venue.city}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Season Statistics */}
          {statistics && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📊</span>
                Season Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">League:</span>
                  <span className="font-medium text-right">{statistics.league.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Season:</span>
                  <span className="font-medium">{statistics.league.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matches:</span>
                  <span className="font-medium">{statistics.fixtures.played.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Wins:</span>
                  <span className="font-medium text-green-600">{statistics.fixtures.wins.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">Draws:</span>
                  <span className="font-medium text-yellow-600">{statistics.fixtures.draws.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Losses:</span>
                  <span className="font-medium text-red-600">{statistics.fixtures.loses.total}</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Form */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>📈</span>
              Recent Form
            </h3>
            {fixtures.length > 0 ? (
              <div className="space-y-3">
                <div className="flex space-x-1">
                  {fixtures.slice(0, 5).map((fixture, index) => {
                    const result = getMatchResult(fixture, id);
                    return (
                      <div
                        key={index}
                        title={`${fixture.teams.home.name} vs ${fixture.teams.away.name}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                          result ? getResultColor(result) : 'bg-gray-100 text-gray-500 border-gray-200'
                        }`}
                      >
                        {result || '?'}
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600">
                  Last 5 matches (left = most recent)
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No recent matches available</p>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Goals Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚽</span>
              Goals
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-gray-700">Goals For:</span>
                <span className="text-xl font-bold text-green-600">
                  {statistics.goals.for.total.total}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-gray-700">Goals Against:</span>
                <span className="text-xl font-bold text-red-600">
                  {statistics.goals.against.total.total}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-gray-700">Goal Difference:</span>
                <span className={`text-xl font-bold ${
                  (statistics.goals.for.total.total - statistics.goals.against.total.total) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {statistics.goals.for.total.total - statistics.goals.against.total.total > 0 ? '+' : ''}
                  {statistics.goals.for.total.total - statistics.goals.against.total.total}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-700">Avg per Game:</span>
                <span className="font-bold text-gray-900">
                  {(statistics.goals.for.total.total / statistics.fixtures.played.total).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🏆</span>
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="text-gray-700">Win Rate:</span>
                <span className="text-xl font-bold text-blue-600">
                  {((statistics.fixtures.wins.total / statistics.fixtures.played.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-gray-700">Clean Sheets:</span>
                <span className="text-xl font-bold text-green-600">
                  {statistics.clean_sheet.total}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-gray-700">Failed to Score:</span>
                <span className="text-xl font-bold text-red-600">
                  {statistics.failed_to_score.total}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                <span className="text-gray-700">Penalty Success:</span>
                <span className="text-xl font-bold text-purple-600">
                  {statistics.penalty.scored.total}/{statistics.penalty.total}
                </span>
              </div>
            </div>
          </div>

          {/* Cards & Discipline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🟨</span>
              Cards & Discipline
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="text-gray-700">Yellow Cards:</span>
                <span className="text-xl font-bold text-yellow-600">
                  {Object.values(statistics.cards.yellow).reduce((sum, period) => sum + (period.total || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="text-gray-700">Red Cards:</span>
                <span className="text-xl font-bold text-red-600">
                  {Object.values(statistics.cards.red).reduce((sum, period) => sum + (period.total || 0), 0)}
                </span>
              </div>
              
              {/* Cards by time period */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Yellow Cards by Period</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>0-15':</span>
                    <span>{statistics.cards.yellow['0-15'].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>16-30':</span>
                    <span>{statistics.cards.yellow['16-30'].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>31-45':</span>
                    <span>{statistics.cards.yellow['31-45'].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>46-60':</span>
                    <span>{statistics.cards.yellow['46-60'].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>61-75':</span>
                    <span>{statistics.cards.yellow['61-75'].total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>76-90':</span>
                    <span>{statistics.cards.yellow['76-90'].total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Matches */}
      {fixtures.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span>📅</span>
              Recent Matches
            </span>
            <span className="text-sm text-gray-500">
              Last {fixtures.length} games
            </span>
          </h3>
          
          <div className="space-y-4">
            {fixtures.map((fixture) => {
              const result = getMatchResult(fixture, id);
              const isHome = fixture.teams.home.id === parseInt(id);
              const opponent = isHome ? fixture.teams.away : fixture.teams.home;
              
              return (
                <Link
                  key={fixture.fixture.id}
                  to={`/match/${fixture.fixture.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500 w-20">
                        {formatDate(fixture.fixture.date)}
                      </div>
                      
                      {result && (
                        <span className={`px-2 py-1 text-xs rounded-full font-bold border ${getResultColor(result)}`}>
                          {result}
                        </span>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {isHome ? 'vs' : '@'}
                        </span>
                        {opponent.logo && (
                          <img 
                            src={opponent.logo} 
                            alt={opponent.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/24x24?text=T';
                            }}
                          />
                        )}
                        <span className="font-medium">{opponent.name}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {fixture.fixture.status.short === 'FT' ? (
                        <div className="font-bold text-lg">
                          {isHome ? 
                            `${fixture.goals.home} - ${fixture.goals.away}` :
                            `${fixture.goals.away} - ${fixture.goals.home}`
                          }
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {fixture.fixture.status.long}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {fixture.league.name}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* No Statistics Notice */}
      {!statistics && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800">
            <span>💡</span>
            <span className="font-medium">Limited Statistics</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Detailed season statistics are only available when viewing a team from a specific league. 
            <Link 
              to="/leagues" 
              className="underline hover:no-underline"
            >
              Browse leagues
            </Link> to see complete team statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamDetails;