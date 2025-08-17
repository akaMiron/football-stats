import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const MatchDetails = () => {
  const { id } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [events, setEvents] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('MatchDetails component mounted, ID:', id);
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching match details for ID:', id);
      
      const [matchResponse, statsResponse, eventsResponse, lineupsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/fixtures/${id}`),
        axios.get(`${API_BASE_URL}/api/fixtures/${id}/statistics`),
        axios.get(`${API_BASE_URL}/api/fixtures/${id}/events`),
        axios.get(`${API_BASE_URL}/api/fixtures/${id}/lineups`)
      ]);
      
      console.log('✅ Raw match response:', matchResponse.data);
      console.log('✅ Raw stats response:', statsResponse.data);
      
      // Безпечне витягування даних
      const responseData = matchResponse?.data?.response;
      const matchInfo = Array.isArray(responseData) ? responseData[0] : responseData;
      
      console.log('✅ Extracted match info:', matchInfo);
      
      if (!matchInfo) {
        throw new Error('No match data found in response');
      }
      
      setMatchData(matchInfo);
      setStatistics(statsResponse?.data?.response || []);
      setEvents(eventsResponse?.data?.response || []);
      setLineups(lineupsResponse?.data?.response || []);
      
      console.log('✅ All data set successfully');
    } catch (error) {
      console.error('❌ Error fetching match details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Early returns with proper checks
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <div className="ml-4">
          <p>Loading match details...</p>
          <p className="text-sm text-gray-500">ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700 text-lg mb-4">❌ Error loading match</p>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">Match ID: {id}</p>
          <button 
            onClick={fetchMatchDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-yellow-700 text-lg mb-4">⚠️ No match data</p>
          <p className="text-yellow-600 mb-4">Match with ID {id} not found</p>
          <Link 
            to="/leagues"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
          >
            ← Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  // Максимально безпечне витягування всіх даних
  const safeGet = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Безпечні змінні
  const homeTeam = {
    id: safeGet(matchData, 'teams.home.id', 0),
    name: safeGet(matchData, 'teams.home.name', 'Home Team'),
    logo: safeGet(matchData, 'teams.home.logo', '')
  };

  const awayTeam = {
    id: safeGet(matchData, 'teams.away.id', 0),
    name: safeGet(matchData, 'teams.away.name', 'Away Team'),
    logo: safeGet(matchData, 'teams.away.logo', '')
  };

  const fixture = {
    id: safeGet(matchData, 'fixture.id', id),
    date: safeGet(matchData, 'fixture.date', ''),
    referee: safeGet(matchData, 'fixture.referee', 'N/A'),
    venue: {
      name: safeGet(matchData, 'fixture.venue.name', 'Unknown Venue'),
      city: safeGet(matchData, 'fixture.venue.city', 'Unknown City')
    },
    status: {
      short: safeGet(matchData, 'fixture.status.short', 'NS'),
      long: safeGet(matchData, 'fixture.status.long', 'Not Started')
    }
  };

  const goals = {
    home: safeGet(matchData, 'goals.home', 0),
    away: safeGet(matchData, 'goals.away', 0)
  };

  const score = {
    halftime: {
      home: safeGet(matchData, 'score.halftime.home', null),
      away: safeGet(matchData, 'score.halftime.away', null)
    },
    extratime: {
      home: safeGet(matchData, 'score.extratime.home', null),
      away: safeGet(matchData, 'score.extratime.away', null)
    },
    penalty: {
      home: safeGet(matchData, 'score.penalty.home', null),
      away: safeGet(matchData, 'score.penalty.away', null)
    }
  };

  const league = {
    id: safeGet(matchData, 'league.id', 0),
    name: safeGet(matchData, 'league.name', 'Unknown League'),
    round: safeGet(matchData, 'league.round', 'Round N/A'),
    season: safeGet(matchData, 'league.season', new Date().getFullYear()),
    logo: safeGet(matchData, 'league.logo', '')
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatisticValue = (stats, type, teamType) => {
    try {
      if (!Array.isArray(stats) || stats.length === 0) return 'N/A';
      
      const teamName = teamType === 'home' ? homeTeam.name : awayTeam.name;
      const teamStats = stats.find(s => safeGet(s, 'team.name') === teamName);
      
      if (!teamStats || !Array.isArray(teamStats.statistics)) return 'N/A';
      
      const stat = teamStats.statistics.find(s => s.type === type);
      return stat ? (stat.value || '0') : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  const StatisticBar = ({ label, homeValue, awayValue }) => {
    const home = parseInt(homeValue) || 0;
    const away = parseInt(awayValue) || 0;
    const total = home + away;
    const homePercentage = total > 0 ? (home / total) * 100 : 50;
    const awayPercentage = total > 0 ? (away / total) * 100 : 50;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{homeValue}</span>
          <span className="text-sm text-gray-600">{label}</span>
          <span className="text-sm font-medium">{awayValue}</span>
        </div>
        <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="bg-blue-500" 
            style={{ width: `${homePercentage}%` }}
          ></div>
          <div 
            className="bg-red-500" 
            style={{ width: `${awayPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  console.log('🎯 Rendering MatchDetails with data:', {
    homeTeam: homeTeam.name,
    awayTeam: awayTeam.name,
    fixture: fixture.status.long,
    goals: `${goals.home}-${goals.away}`
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-2">
            {league.name} - {league.round}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {formatDate(fixture.date)}
          </p>
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            fixture.status.short === 'FT' ? 'bg-green-100 text-green-800' :
            fixture.status.short === 'LIVE' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {fixture.status.long}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-8 mb-8">
          <Link 
            to={`/team/${homeTeam.id}`}
            className="flex flex-col items-center space-y-2 hover:text-blue-600"
          >
            {homeTeam.logo && (
              <img 
                src={homeTeam.logo} 
                alt={homeTeam.name}
                className="w-20 h-20"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span className="text-lg font-medium text-center">
              {homeTeam.name}
            </span>
          </Link>
          
          <div className="text-center">
            {fixture.status.short === 'FT' || fixture.status.short === 'LIVE' ? (
              <div className="text-4xl font-bold text-gray-900">
                {goals.home} - {goals.away}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-500">
                VS
              </div>
            )}
            {score.halftime.home !== null && score.halftime.away !== null && (
              <div className="text-sm text-gray-500 mt-2">
                HT: {score.halftime.home} - {score.halftime.away}
              </div>
            )}
          </div>
          
          <Link 
            to={`/team/${awayTeam.id}`}
            className="flex flex-col items-center space-y-2 hover:text-blue-600"
          >
            {awayTeam.logo && (
              <img 
                src={awayTeam.logo} 
                alt={awayTeam.name}
                className="w-20 h-20"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <span className="text-lg font-medium text-center">
              {awayTeam.name}
            </span>
          </Link>
        </div>

        <div className="text-center text-gray-600">
          <p>📍 {fixture.venue.name}, {fixture.venue.city}</p>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          {statistics.length > 0 && (
            <button
              onClick={() => setActiveTab('statistics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistics
            </button>
          )}
          {events.length > 0 && (
            <button
              onClick={() => setActiveTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Events
            </button>
          )}
          {lineups.length > 0 && (
            <button
              onClick={() => setActiveTab('lineups')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lineups'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Line-ups
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Match Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Status</span>
                <span className="font-medium">{fixture.status.long}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Referee</span>
                <span className="font-medium">{fixture.referee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>League</span>
                <span className="font-medium">{league.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Season</span>
                <span className="font-medium">{league.season}</span>
              </div>
            </div>
          </div>

          {fixture.status.short === 'FT' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Score Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Full Time</span>
                  <span className="font-medium">
                    {goals.home} - {goals.away}
                  </span>
                </div>
                {score.halftime.home !== null && (
                  <div className="flex justify-between items-center">
                    <span>Half Time</span>
                    <span className="font-medium">
                      {score.halftime.home} - {score.halftime.away}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'statistics' && statistics.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-6">Match Statistics</h3>
          <div className="space-y-6">
            <StatisticBar 
              label="Ball Possession"
              homeValue={getStatisticValue(statistics, 'Ball Possession', 'home')}
              awayValue={getStatisticValue(statistics, 'Ball Possession', 'away')}
            />
            <StatisticBar 
              label="Total Shots"
              homeValue={getStatisticValue(statistics, 'Total Shots', 'home')}
              awayValue={getStatisticValue(statistics, 'Total Shots', 'away')}
            />
            <StatisticBar 
              label="Shots on Goal"
              homeValue={getStatisticValue(statistics, 'Shots on Goal', 'home')}
              awayValue={getStatisticValue(statistics, 'Shots on Goal', 'away')}
            />
            <StatisticBar 
              label="Total passes"
              homeValue={getStatisticValue(statistics, 'Total passes', 'home')}
              awayValue={getStatisticValue(statistics, 'Total passes', 'away')}
            />
            <StatisticBar 
              label="Passes accurate"
              homeValue={getStatisticValue(statistics, 'Passes accurate', 'home')}
              awayValue={getStatisticValue(statistics, 'Passes accurate', 'away')}
            />
            <StatisticBar 
              label="Fouls"
              homeValue={getStatisticValue(statistics, 'Fouls', 'home')}
              awayValue={getStatisticValue(statistics, 'Fouls', 'away')}
            />
          </div>
        </div>
      )}

      {activeTab === 'events' && events.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-6">Match Events</h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {safeGet(event, 'time.elapsed', '?')}'
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{safeGet(event, 'type', 'Event')}</p>
                    <p className="text-sm text-gray-600">
                      {safeGet(event, 'player.name', 'Unknown Player')}
                      {safeGet(event, 'assist.name') && ` (Assist: ${event.assist.name})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {safeGet(event, 'team.logo') && (
                    <img 
                      src={event.team.logo} 
                      alt={safeGet(event, 'team.name', 'Team')}
                      className="w-6 h-6"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <span className="text-sm font-medium">
                    {safeGet(event, 'team.name', 'Unknown Team')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'lineups' && lineups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lineups.map((lineup, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                {safeGet(lineup, 'team.logo') && (
                  <img 
                    src={lineup.team.logo} 
                    alt={safeGet(lineup, 'team.name', 'Team')}
                    className="w-6 h-6 mr-2"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                {safeGet(lineup, 'team.name', 'Unknown Team')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Formation: {safeGet(lineup, 'formation', 'N/A')}
              </p>
              
              <div className="mb-6">
                <h4 className="font-medium mb-3">Starting XI</h4>
                <div className="space-y-2">
                  {(lineup.startXI || []).map((player, playerIndex) => (
                    <div key={playerIndex} className="flex justify-between items-center text-sm">
                      <span>{safeGet(player, 'player.name', 'Unknown Player')}</span>
                      <span className="text-gray-500">
                        #{safeGet(player, 'player.number', '?')} - {safeGet(player, 'player.pos', '?')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Substitutes</h4>
                <div className="space-y-2">
                  {(lineup.substitutes || []).map((player, playerIndex) => (
                    <div key={playerIndex} className="flex justify-between items-center text-sm">
                      <span>{safeGet(player, 'player.name', 'Unknown Player')}</span>
                      <span className="text-gray-500">
                        #{safeGet(player, 'player.number', '?')} - {safeGet(player, 'player.pos', '?')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchDetails;