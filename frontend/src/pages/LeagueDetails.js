import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const LeagueDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const season = searchParams.get('season') || new Date().getFullYear();
  
  const [standings, setStandings] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('standings');

  useEffect(() => {
    fetchLeagueData();
  }, [id, season]);

  const fetchLeagueData = async () => {
    try {
      const [standingsResponse, fixturesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/standings?league=${id}&season=${season}`),
        axios.get(`${API_BASE_URL}/api/fixtures?league=${id}&season=${season}&last=20`)
      ]);
      
      setStandings(standingsResponse.data.response[0]);
      setFixtures(fixturesResponse.data.response);
    } catch (error) {
      console.error('Error fetching league data:', error);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getMatchStatus = (fixture) => {
    if (fixture.fixture.status.short === 'FT') return 'FT';
    if (fixture.fixture.status.short === 'LIVE') return 'LIVE';
    if (fixture.fixture.status.short === 'NS') return formatDate(fixture.fixture.date);
    return fixture.fixture.status.short;
  };

  return (
    <div>
      {standings && (
        <div className="mb-8">
          <div className="flex items-center mb-6">
            {standings.league.logo && (
              <img 
                src={standings.league.logo} 
                alt={standings.league.name}
                className="w-16 h-16 mr-4"
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

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'standings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Standings
              </button>
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'fixtures'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Matches
              </button>
            </nav>
          </div>
        </div>
      )}

      {activeTab === 'standings' && standings && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                {standings.league.standings[0]?.map((team) => (
                  <tr key={team.team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {team.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/team/${team.team.id}?league=${id}&season=${season}`}
                        className="flex items-center hover:text-blue-600"
                      >
                        {team.team.logo && (
                          <img 
                            src={team.team.logo} 
                            alt={team.team.name}
                            className="w-6 h-6 mr-3"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {team.goalsDiff > 0 ? '+' : ''}{team.goalsDiff}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fixtures' && (
        <div className="space-y-4">
          {fixtures.map((fixture) => (
            <Link
              key={fixture.fixture.id}
              to={`/match/${fixture.fixture.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {fixture.teams.home.logo && (
                      <img 
                        src={fixture.teams.home.logo} 
                        alt={fixture.teams.home.name}
                        className="w-8 h-8"
                      />
                    )}
                    <span className="font-medium">{fixture.teams.home.name}</span>
                  </div>
                  
                  <div className="text-center">
                    {fixture.fixture.status.short === 'FT' ? (
                      <div className="text-lg font-bold">
                        {fixture.goals.home} - {fixture.goals.away}
                      </div>
                    ) : (
                      <div className="text-gray-500">vs</div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fixture.teams.away.logo && (
                      <img 
                        src={fixture.teams.away.logo} 
                        alt={fixture.teams.away.name}
                        className="w-8 h-8"
                      />
                    )}
                    <span className="font-medium">{fixture.teams.away.name}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">{getMatchStatus(fixture)}</div>
                  <div className="text-xs text-gray-400">
                    Round {fixture.league.round?.replace(/^[^0-9]*/, '') || 'N/A'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueDetails;