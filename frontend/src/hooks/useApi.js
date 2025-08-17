// hooks/useApi.js
import { useState, useEffect, useCallback } from 'react';
import { apiService, getMockMode } from '../config/api';

export const useApi = (apiMethod, params = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (typeof apiMethod === 'string') {
        // Handle string-based API methods
        result = await apiService[apiMethod](params);
      } else if (typeof apiMethod === 'function') {
        // Handle function-based API calls
        result = await apiMethod(params);
      } else {
        throw new Error('Invalid API method provided');
      }
      
      setData(result);
    } catch (err) {
      setError(err);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiMethod, JSON.stringify(params), ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    isMockMode: getMockMode()
  };
};

// Simplified hooks that all use the same fixtures endpoint
export const useLeagues = (params = {}) => {
  return useApi('getLeagues', params);
};

// Main fixtures hook - handles all fixture requests
export const useFixtures = (params = {}) => {
  return useApi('getFixtures', params, [JSON.stringify(params)]);
};

// Live fixtures - just uses the main fixtures hook with live=all
export const useLiveFixtures = (params = {}) => {
  return useFixtures({ ...params, live: 'all' });
};

// Fixtures by date - uses the main fixtures hook with date parameter
export const useFixturesByDate = (date, params = {}) => {
  return useFixtures({ ...params, date });
};

// Fixtures by league - uses the main fixtures hook with league parameter
export const useFixturesByLeague = (league, season, params = {}) => {
  return useFixtures({ ...params, league, season });
};

export const useStandings = (params = {}) => {
  return useApi('getStandings', params, [JSON.stringify(params)]);
};

export const useFixtureDetails = (fixtureId) => {
  return useApi(() => apiService.getFixtureDetails(fixtureId), fixtureId, [fixtureId]);
};

export const useFixtureStatistics = (fixtureId) => {
  return useApi(() => apiService.getFixtureStatistics(fixtureId), fixtureId, [fixtureId]);
};

export const useFixtureEvents = (fixtureId) => {
  return useApi(() => apiService.getFixtureEvents(fixtureId), fixtureId, [fixtureId]);
};

export const useFixtureLineups = (fixtureId) => {
  console.log('Fetching lineups for fixture:', fixtureId);
  return useApi(() => apiService.getFixtureLineups(fixtureId), fixtureId, [fixtureId]);
};

export const useFixtureH2H = (h2h) => {
  return useApi(() => apiService.getFixtureH2H(h2h), h2h, [h2h]);
};

export const useFixturePredictions = (fixtureId) => {
  return useApi(() => apiService.getFixturePredictions(fixtureId), fixtureId, [fixtureId]);
};

export const useTeam = (teamId) => {
  return useApi(() => apiService.getTeam(teamId), teamId, [teamId]);
};

export const useTeamStatistics = (teamId, league, season) => {
  return useApi(() => apiService.getTeamStatistics(teamId, league, season), { teamId, league, season }, [teamId, league, season]);
};

export const useTopScorers = (league, season) => {
  return useApi(() => apiService.getTopScorers(league, season), { league, season }, [league, season]);
};

export const useTopAssists = (league, season) => {
  return useApi(() => apiService.getTopAssists(league, season), { league, season }, [league, season]);
};

export const usePlayerStatistics = (playerId, season) => {
  return useApi(() => apiService.getPlayerStatistics(playerId, season), { playerId, season }, [playerId, season]);
};

export const useInjuries = (params = {}) => {
  return useApi('getInjuries', params, [JSON.stringify(params)]);
};

// Enhanced match data hook for comprehensive match details
export const useMatchData = (fixtureId) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!fixtureId) return;

    try {
      setLoading(true);
      setError(null);
      
      const results = {};
      
      // Execute all API calls in parallel for comprehensive match data
      const apiCalls = [
        { key: 'fixture', call: () => apiService.getFixtureDetails(fixtureId) },
        { key: 'statistics', call: () => apiService.getFixtureStatistics(fixtureId) },
        { key: 'events', call: () => apiService.getFixtureEvents(fixtureId) },
        { key: 'lineups', call: () => apiService.getFixtureLineups(fixtureId) },
        { key: 'predictions', call: () => apiService.getFixturePredictions(fixtureId) },
      ];

      const promises = apiCalls.map(async ({ key, call }) => {
        try {
          const result = await call();
          return [key, result];
        } catch (err) {
          console.error(`Error fetching ${key}:`, err);
          return [key, null];
        }
      });
      
      const resolvedResults = await Promise.all(promises);
      
      resolvedResults.forEach(([key, result]) => {
        results[key] = result;
      });
      
      // If we have fixture data, also fetch team statistics
      if (results.fixture?.response?.[0]) {
        const fixture = results.fixture.response[0];
        const homeTeamId = fixture.teams.home.id;
        const awayTeamId = fixture.teams.away.id;
        const leagueId = fixture.league.id;
        const season = fixture.league.season;

        try {
          const [homeStats, awayStats] = await Promise.all([
            apiService.getTeamStatistics(homeTeamId, leagueId, season),
            apiService.getTeamStatistics(awayTeamId, leagueId, season),
          ]);
          
          results.teamStatistics = {
            home: homeStats,
            away: awayStats,
          };
        } catch (err) {
          console.error('Error fetching team statistics:', err);
          results.teamStatistics = { home: null, away: null };
        }
      }
      
      setData(results);
    } catch (err) {
      setError(err);
      console.error('Match Data Error:', err);
    } finally {
      setLoading(false);
    }
  }, [fixtureId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    isMockMode: getMockMode()
  };
};

// Custom hook for multiple API calls
export const useMultipleApi = (apiCalls) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = {};
      
      // Execute all API calls in parallel
      const promises = Object.entries(apiCalls).map(async ([key, { method, params }]) => {
        try {
          let result;
          if (typeof method === 'string') {
            result = await apiService[method](params);
          } else if (typeof method === 'function') {
            result = await method(params);
          }
          return [key, result];
        } catch (err) {
          console.error(`Error in ${key}:`, err);
          return [key, null];
        }
      });
      
      const resolvedResults = await Promise.all(promises);
      
      resolvedResults.forEach(([key, result]) => {
        results[key] = result;
      });
      
      setData(results);
    } catch (err) {
      setError(err);
      console.error('Multiple API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(apiCalls)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
    isMockMode: getMockMode()
  };
};

export default useApi;