import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const TeamDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const league = searchParams.get('league');
  const season = searchParams.get('season') || new Date().getFullYear();
  
  const [team, setTeam] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, [id, league, season]);

  const fetchTeamData = async () => {
    try {
      const promises = [
        axios.get(`${API_BASE_URL}/api/teams/${id}`),
        axios.get(`${API_BASE_URL}/api/fixtures?team=${id}&last=10`)
      ];

      if (league) {
        promises.push(axios.get(`${API_BASE_URL}/api/teams/${id}/statistics?league=${league}&season=${season}`));
      }

      const responses = await Promise.all(promises);
      
      setTeam(responses[0].data.response[0]);
      setFixtures(responses[1].data.response);
      
      if (responses[2]) {
        setStatistics(responses[2].data.response);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Team not found</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
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
      case 'W': return 'bg-green-100 text-green-800';
      case 'L': return 'bg-red-100 text-red-800';
      case 'D': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center mb-6">
          {team.team.logo && (
            <img 
              src={team.team.logo} 
              alt={team.team.name}
              className="w-24 h-24 mr-6"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {team.team.name}
            </h1>
            <p className="text-gray-600 mb-1">{team.team.country}</p>
            <p className="text-sm text-gray-500">Founded: {team.team.founded}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Club Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Code:</span> {team.team.code}</p>
              <p><span className="font-medium">National:</span> {team.team.national ? 'Yes' : 'No'}</p>
              {team.venue && (
                <>
                  <p><span className="font-medium">Venue:</span> {team.venue.name}</p>
                  <p><span className="font-medium">Capacity:</span> {team.venue.capacity?.toLocaleString()}</p>
                  <p><span className="font-medium">City:</span> {team.venue.city}</p>
                </>
              )}
            </div>
          </div>

          {statistics && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Season Statistics</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">League:</span> {statistics.league.name}</p>
                <p><span className="font-medium">Season:</span> {statistics.league.season}</p>
                <p><span className="font-medium">Matches Played:</span> {statistics.fixtures.played.total}</p>
                <p><span className="font-medium">Wins:</span> {statistics.fixtures.wins.total}</p>
                <p><span className="font-medium">Draws:</span> {statistics.fixtures.draws.total}</p>
                <p><span className="font-medium">Losses:</span> {statistics.fixtures.loses.total}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-3">Recent Form</h3>
            {fixtures.length > 0 && (
              <div className="flex space-x-1">
                {fixtures.slice(0, 5).map((fixture, index) => {
                  const result = getMatchResult(fixture, id);
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        result ? getResultColor(result) : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {result || '?'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Goals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Goals For:</span>
                <span className="font-medium">{statistics.goals.for.total.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Goals Against:</span>
                <span className="font-medium">{statistics.goals.against.total.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Goal Difference:</span>
                <span className={`font-medium ${
                  (statistics.goals.for.total.total - statistics.goals.against.total.total) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {statistics.goals.for.total.total - statistics.goals.against.total.total > 0 ? '+' : ''}
                  {statistics.goals.for.total.total - statistics.goals.against.total.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Goals Per Game:</span>
                <span className="font-medium">
                  {(statistics.goals.for.total.total / statistics.fixtures.played.total).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Performance</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-medium">
                  {((statistics.fixtures.wins.total / statistics.fixtures.played.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clean Sheets:</span>
                <span className="font-medium">{statistics.clean_sheet.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed to Score:</span>
                <span className="font-medium">{statistics.failed_to_score.total}</span>
              </div>
              <div className="flex justify-between">
                <span>Penalty Success:</span>
                <span className="font-medium">
                  {statistics.penalty.scored.total}/{statistics.penalty.total}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Cards & Discipline</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Yellow Cards:</span>
                <span className="font-medium">{statistics.cards.yellow['0-15'].total + statistics.cards.yellow['16-30'].total + statistics.cards.yellow['31-45'].total + statistics.cards.yellow['46-60'].total + statistics.cards.yellow['61-75'].total + statistics.cards.yellow['76-90'].total}</span>
              </div>
              <div className="flex justify-between">
                <span>Red Cards:</span>
                <span className="font-medium">{statistics.cards.red['0-15'].total + statistics.cards.red['16-30'].total + statistics.cards.red['31-45'].total + statistics.cards.red['46-60'].total + statistics.cards.red['61-75'].total + statistics.cards.red['76-90'].total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {fixtures.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Matches</h3>
          <div className="space-y-4">
            {fixtures.map((fixture) => {
              const result = getMatchResult(fixture, id);
              const isHome = fixture.teams.home.id === parseInt(id);
              const opponent = isHome ? fixture.teams.away : fixture.teams.home;
              
              return (
                <Link
                  key={fixture.fixture.id}
                  to={`/match/${fixture.fixture.id}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        {formatDate(fixture.fixture.date)}
                      </div>
                      
                      {result && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getResultColor(result)}`}>
                          {result}
                        </span>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{isHome ? 'vs' : '@'}</span>
                        {opponent.logo && (
                          <img 
                            src={opponent.logo} 
                            alt={opponent.name}
                            className="w-6 h-6"
                          />
                        )}
                        <span className="font-medium">{opponent.name}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {fixture.fixture.status.short === 'FT' ? (
                        <div className="font-medium">
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
    </div>
  );
};

export default TeamDetails;