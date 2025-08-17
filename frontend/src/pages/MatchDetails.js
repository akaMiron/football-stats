import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useMatchData } from "../hooks/useApi";

const MatchDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  console.log("Match details. Id of the match: ", id);

  const {
    data,
    loading,
    error,
    isMockMode,
    refetch,
  } = useMatchData(id);

  const fixture = useMemo(() => {
    return data.fixture?.response?.[0] || null;
  }, [data.fixture]);

  const statistics = useMemo(() => {
    return data.statistics?.response || [];
  }, [data.statistics]);

  const events = useMemo(() => {
    return data.events?.response || [];
  }, [data.events]);

  const lineups = useMemo(() => {
    return data.lineups?.response || [];
  }, [data.lineups]);

  const predictions = useMemo(() => {
    return data.predictions?.response || [];
  }, [data.predictions]);

  const teamStatistics = useMemo(() => {
    return data.teamStatistics || { home: null, away: null };
  }, [data.teamStatistics]);

  // Helper function to get match status
  const getMatchStatus = (fixture) => {
    if (!fixture) return { text: '', color: 'text-gray-500' };
    
    const status = fixture.fixture.status;
    const elapsed = status.elapsed;
    
    switch (status.short) {
      case 'TBD':
        return { text: 'Time TBD', color: 'text-gray-500' };
      case 'NS':
        return { text: 'Not Started', color: 'text-blue-600' };
      case '1H':
        return { text: `${elapsed}' - First Half`, color: 'text-green-600 animate-pulse' };
      case 'HT':
        return { text: 'Half Time', color: 'text-yellow-600' };
      case '2H':
        return { text: `${elapsed}' - Second Half`, color: 'text-green-600 animate-pulse' };
      case 'ET':
        return { text: `${elapsed}' - Extra Time`, color: 'text-orange-600 animate-pulse' };
      case 'BT':
        return { text: 'Break Time', color: 'text-yellow-600' };
      case 'P':
        return { text: 'Penalty Shootout', color: 'text-red-600 animate-pulse' };
      case 'FT':
        return { text: 'Full Time', color: 'text-gray-600' };
      case 'AET':
        return { text: 'After Extra Time', color: 'text-gray-600' };
      case 'PEN':
        return { text: 'Penalty Shootout', color: 'text-gray-600' };
      case 'PST':
        return { text: 'Postponed', color: 'text-red-500' };
      case 'CANC':
        return { text: 'Cancelled', color: 'text-red-500' };
      case 'ABD':
        return { text: 'Abandoned', color: 'text-red-500' };
      case 'AWD':
        return { text: 'Technical Decision', color: 'text-blue-500' };
      case 'WO':
        return { text: 'Walk Over', color: 'text-blue-500' };
      case 'LIVE':
        return { text: `${elapsed}' - Live`, color: 'text-green-600 animate-pulse' };
      default:
        return { text: status.long, color: 'text-gray-500' };
    }
  };

  // Helper function to get event icon
  const getEventIcon = (type) => {
    switch (type) {
      case 'Goal':
        return '⚽';
      case 'Card':
        return '📰';
      case 'subst':
        return '🔄';
      case 'Var':
        return '📺';
      default:
        return '📌';
    }
  };

  // Helper function to format statistics
  const formatStatValue = (value) => {
    if (value === null || value === undefined) return '0';
    return value.toString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">
            Loading match details... {isMockMode ? "(Mock Data)" : "(Live API)"}
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
            Failed to Load Match Details
          </h3>
          <p className="text-red-600 text-sm mb-4">
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={refetch}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Back to Fixtures
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!fixture) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-400 text-6xl mb-4">🔍</div>
          <h3 className="text-yellow-800 font-medium text-lg mb-2">
            Match Not Found
          </h3>
          <p className="text-yellow-600 text-sm mb-4">
            The requested match could not be found.
          </p>
          <Link
            to="/"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Fixtures
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getMatchStatus(fixture);
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'].includes(fixture.fixture.status.short);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
          >
            ← Back to Fixtures
          </Link>
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

      {/* Match Header */}
      <div className={`bg-white rounded-lg shadow-md p-6 mb-6 border ${
        isLive ? 'border-green-300 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {fixture.league.logo && (
              <img
                src={fixture.league.logo}
                alt={fixture.league.name}
                className="w-6 h-6 object-contain"
              />
            )}
            <span className="text-lg font-semibold text-gray-800">
              {fixture.league.name}
            </span>
            <span className="text-sm text-gray-500">
              • {fixture.league.round}
            </span>
          </div>
          <div className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex items-center space-x-3">
              {fixture.teams.home.logo && (
                <img
                  src={fixture.teams.home.logo}
                  alt={fixture.teams.home.name}
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h2 className={`text-xl font-bold ${
                  fixture.teams.home.winner === true ? 'text-green-700' :
                  fixture.teams.home.winner === false ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {fixture.teams.home.name}
                </h2>
                <p className="text-sm text-gray-500">Home</p>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="text-center px-8">
            {fixture.fixture.status.short !== "NS" && fixture.fixture.status.short !== "TBD" ? (
              <div>
                <div className={`text-4xl font-bold ${isLive ? 'text-green-600' : 'text-gray-900'}`}>
                  {fixture.goals.home} : {fixture.goals.away}
                </div>
                {fixture.score.halftime.home !== null && (
                  <div className="text-sm text-gray-500 mt-1">
                    HT: {fixture.score.halftime.home} : {fixture.score.halftime.away}
                  </div>
                )}
                {fixture.score.penalty.home !== null && (
                  <div className="text-sm text-red-600 mt-1">
                    Penalties: {fixture.score.penalty.home} : {fixture.score.penalty.away}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-500">
                {new Date(fixture.fixture.date).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <h2 className={`text-xl font-bold ${
                  fixture.teams.away.winner === true ? 'text-green-700' :
                  fixture.teams.away.winner === false ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {fixture.teams.away.name}
                </h2>
                <p className="text-sm text-gray-500">Away</p>
              </div>
              {fixture.teams.away.logo && (
                <img
                  src={fixture.teams.away.logo}
                  alt={fixture.teams.away.name}
                  className="w-12 h-12 object-contain"
                />
              )}
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-600">
          <div>📅 {new Date(fixture.fixture.date).toLocaleDateString()}</div>
          {fixture.fixture.venue?.name && (
            <div>📍 {fixture.fixture.venue.name}, {fixture.fixture.venue.city}</div>
          )}
          {fixture.fixture.referee && (
            <div>👨‍⚖️ {fixture.fixture.referee}</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'events', label: 'Events', icon: '⚽', count: events.length },
              { key: 'statistics', label: 'Statistics', icon: '📈', available: statistics.length > 0 },
              { key: 'lineups', label: 'Lineups', icon: '👥', count: lineups.length },
              { key: 'predictions', label: 'Predictions', icon: '🔮', available: predictions.length > 0 },
            ].map(({ key, label, icon, count, available = true }) => (
              available && (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                      {count}
                    </span>
                  )}
                </button>
              )
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              {statistics.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statistics.map((teamStats, index) => {
                    const possessionStat = teamStats.statistics.find(s => s.type === "Ball Possession");
                    const shotsStat = teamStats.statistics.find(s => s.type === "Total Shots");
                    const cornersStat = teamStats.statistics.find(s => s.type === "Corner Kicks");
                    const foulsStat = teamStats.statistics.find(s => s.type === "Fouls");
                    
                    return (
                      <div key={teamStats.team.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={teamStats.team.logo}
                            alt={teamStats.team.name}
                            className="w-6 h-6 object-contain"
                          />
                          <h3 className="font-semibold text-sm">{teamStats.team.name}</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          {possessionStat && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Possession</span>
                              <span className="font-medium">{possessionStat.value}</span>
                            </div>
                          )}
                          {shotsStat && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shots</span>
                              <span className="font-medium">{formatStatValue(shotsStat.value)}</span>
                            </div>
                          )}
                          {cornersStat && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Corners</span>
                              <span className="font-medium">{formatStatValue(cornersStat.value)}</span>
                            </div>
                          )}
                          {foulsStat && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Fouls</span>
                              <span className="font-medium">{formatStatValue(foulsStat.value)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recent Events */}
              {events.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Key Events</h3>
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-600 w-12">
                          {event.time.elapsed}'
                          {event.time.extra && `+${event.time.extra}`}
                        </div>
                        <div className="text-xl">{getEventIcon(event.type)}</div>
                        <div className="flex-1">
                          <div className="font-medium">{event.player.name}</div>
                          <div className="text-sm text-gray-600">
                            {event.type} {event.detail && `(${event.detail})`}
                            {event.assist?.name && ` • Assist: ${event.assist.name}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={event.team.logo}
                            alt={event.team.name}
                            className="w-6 h-6 object-contain"
                          />
                          <span className="text-sm font-medium">{event.team.name}</span>
                        </div>
                      </div>
                    ))}
                    {events.length > 5 && (
                      <button
                        onClick={() => setActiveTab('events')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View all {events.length} events →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Events</h3>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="text-sm font-bold text-gray-700 w-16 text-center">
                        {event.time.elapsed}'
                        {event.time.extra && (
                          <div className="text-xs text-gray-500">+{event.time.extra}</div>
                        )}
                      </div>
                      <div className="text-2xl">{getEventIcon(event.type)}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{event.player.name}</div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{event.type}</span>
                          {event.detail && ` - ${event.detail}`}
                          {event.assist?.name && (
                            <div className="mt-1">
                              <span className="text-blue-600">Assist:</span> {event.assist.name}
                            </div>
                          )}
                          {event.comments && (
                            <div className="mt-1 text-gray-500 italic">{event.comments}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={event.team.logo}
                          alt={event.team.name}
                          className="w-8 h-8 object-contain"
                        />
                        <span className="font-medium text-right">{event.team.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No events recorded for this match yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Statistics</h3>
              {statistics.length > 0 ? (
                <div className="space-y-4">
                  {/* Get all unique stat types */}
                  {(() => {
                    const allStatTypes = new Set();
                    statistics.forEach(teamStats => {
                      teamStats.statistics.forEach(stat => {
                        allStatTypes.add(stat.type);
                      });
                    });
                    
                    return Array.from(allStatTypes).map(statType => {
                      const homeTeamStat = statistics[0]?.statistics.find(s => s.type === statType);
                      const awayTeamStat = statistics[1]?.statistics.find(s => s.type === statType);
                      
                      const homeValue = homeTeamStat ? formatStatValue(homeTeamStat.value) : '0';
                      const awayValue = awayTeamStat ? formatStatValue(awayTeamStat.value) : '0';
                      
                      // Calculate percentages for visual bars (only for numeric values)
                      let homePercentage = 50;
                      let awayPercentage = 50;
                      
                      if (statType !== "Ball Possession" && statType !== "Passes %") {
                        const homeNum = parseInt(homeValue) || 0;
                        const awayNum = parseInt(awayValue) || 0;
                        const total = homeNum + awayNum;
                        
                        if (total > 0) {
                          homePercentage = (homeNum / total) * 100;
                          awayPercentage = (awayNum / total) * 100;
                        }
                      } else if (statType === "Ball Possession") {
                        homePercentage = parseInt(homeValue.replace('%', '')) || 50;
                        awayPercentage = parseInt(awayValue.replace('%', '')) || 50;
                      }
                      
                      return (
                        <div key={statType} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-blue-600">{homeValue}</span>
                            <span className="text-sm font-medium text-gray-700">{statType}</span>
                            <span className="font-medium text-red-600">{awayValue}</span>
                          </div>
                          <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-500 transition-all duration-300"
                              style={{ width: `${homePercentage}%` }}
                            ></div>
                            <div 
                              className="bg-red-500 transition-all duration-300"
                              style={{ width: `${awayPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-500">
                            <span>{statistics[0]?.team.name}</span>
                            <span>{statistics[1]?.team.name}</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No statistics available for this match.
                </div>
              )}
            </div>
          )}

          {activeTab === 'lineups' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Team Lineups</h3>
              {lineups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lineups.map((teamLineup) => (
                    <div key={teamLineup.team.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={teamLineup.team.logo}
                          alt={teamLineup.team.name}
                          className="w-8 h-8 object-contain"
                        />
                        <h4 className="text-lg font-semibold">{teamLineup.team.name}</h4>
                        <span className="text-sm text-gray-600">({teamLineup.formation})</span>
                      </div>
                      
                      {/* Coach */}
                      {teamLineup.coach && (
                        <div className="mb-4 p-3 bg-white rounded">
                          <h5 className="font-medium text-sm text-gray-700 mb-2">Coach</h5>
                          <div className="flex items-center gap-2">
                            {teamLineup.coach.photo && (
                              <img
                                src={teamLineup.coach.photo}
                                alt={teamLineup.coach.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <span className="font-medium">{teamLineup.coach.name}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Starting XI */}
                      <div className="mb-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-3">Starting XI</h5>
                        <div className="space-y-2">
                          {teamLineup.startXI?.map((playerData) => (
                            <div key={playerData.player.id} className="flex items-center justify-between p-2 bg-white rounded">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                  {playerData.player.number}
                                </span>
                                <span className="font-medium">{playerData.player.name}</span>
                              </div>
                              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {playerData.player.pos}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Substitutes */}
                      {teamLineup.substitutes && teamLineup.substitutes.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-3">Substitutes</h5>
                          <div className="space-y-2">
                            {teamLineup.substitutes.map((playerData) => (
                              <div key={playerData.player.id} className="flex items-center justify-between p-2 bg-white rounded opacity-75">
                                <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 bg-gray-400 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {playerData.player.number}
                                  </span>
                                  <span className="font-medium">{playerData.player.name}</span>
                                </div>
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                  {playerData.player.pos}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Lineups not available for this match.
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictions' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Predictions</h3>
              {predictions.length > 0 ? (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold mb-4">Prediction Analysis</h4>
                      
                      {/* Predictions data structure varies, display what's available */}
                      <div className="space-y-3">
                        {prediction.predictions && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Predictions</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {Object.entries(prediction.predictions).map(([key, value]) => (
                                <div key={key} className="bg-white rounded p-3">
                                  <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                                  <div className="font-semibold">{value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {prediction.comparison && (
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Team Comparison</h5>
                            <div className="space-y-2">
                              {Object.entries(prediction.comparison).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                                  <span className="font-medium">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No predictions available for this match.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;