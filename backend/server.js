require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

const apiHeaders = {
  'X-RapidAPI-Key': FOOTBALL_API_KEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
};

// Helper function to handle API requests with error handling
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    console.log(`Making API request to: ${url}`);
    
    const response = await axios.get(url, {
      headers: apiHeaders,
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.message);
    throw error;
  }
};

// Leagues endpoint
app.get('/api/leagues', async (req, res) => {
  try {
    const { country, season, current, search, type } = req.query;
    const params = {};
    
    if (country) params.country = country;
    if (season) params.season = season;
    if (current) params.current = current;
    if (search) params.search = search;
    if (type) params.type = type;

    const data = await makeApiRequest('/leagues', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch leagues',
      message: error.message 
    });
  }
});

// Enhanced fixtures endpoint with all parameters
app.get('/api/fixtures', async (req, res) => {
  try {
    const { 
      id, league, season, team, last, next, from, to, date, 
      live, status, round, timezone, venue
    } = req.query;
    
    const params = {};
    
    // Add all possible parameters
    if (id) params.id = id;
    if (league) params.league = league;
    if (season) params.season = season;
    if (team) params.team = team;
    if (last) params.last = last;
    if (next) params.next = next;
    if (from) params.from = from;
    if (to) params.to = to;
    if (date) params.date = date;
    if (live) params.live = live;
    if (status) params.status = status;
    if (round) params.round = round;
    if (timezone) params.timezone = timezone;
    if (venue) params.venue = venue;

    const data = await makeApiRequest('/fixtures', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch fixtures',
      message: error.message 
    });
  }
});

// Fixture statistics endpoint
app.get('/api/fixtures/statistics', async (req, res) => {
  try {
    const { fixture } = req.query;
    
    if (!fixture) {
      return res.status(400).json({ error: 'Fixture ID is required' });
    }

    const data = await makeApiRequest('/fixtures/statistics', { fixture });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch fixture statistics',
      message: error.message 
    });
  }
});

// Fixture events endpoint
app.get('/api/fixtures/events', async (req, res) => {
  try {
    const { fixture } = req.query;
    
    if (!fixture) {
      return res.status(400).json({ error: 'Fixture ID is required' });
    }

    const data = await makeApiRequest('/fixtures/events', { fixture });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch fixture events',
      message: error.message 
    });
  }
});

// Fixture lineups endpoint
app.get('/api/fixtures/lineups', async (req, res) => {
  try {
    const { fixture } = req.query;
    
    if (!fixture) {
      return res.status(400).json({ error: 'Fixture ID is required' });
    }

    const data = await makeApiRequest('/fixtures/lineups', { fixture });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch fixture lineups',
      message: error.message 
    });
  }
});

// Head to head endpoint
app.get('/api/fixtures/headtohead', async (req, res) => {
  try {
    const { h2h } = req.query;
    
    if (!h2h) {
      return res.status(400).json({ error: 'H2H teams parameter is required (format: team1-team2)' });
    }

    const data = await makeApiRequest('/fixtures/headtohead', { h2h });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch head to head data',
      message: error.message 
    });
  }
});

// Standings endpoint
app.get('/api/standings', async (req, res) => {
  try {
    const { league, season, team } = req.query;
    const params = {};
    
    if (league) params.league = league;
    if (season) params.season = season;
    if (team) params.team = team;

    const data = await makeApiRequest('/standings', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch standings',
      message: error.message 
    });
  }
});

// Teams endpoint
app.get('/api/teams', async (req, res) => {
  try {
    const { id, name, league, season, country, code, venue, search } = req.query;
    const params = {};
    
    if (id) params.id = id;
    if (name) params.name = name;
    if (league) params.league = league;
    if (season) params.season = season;
    if (country) params.country = country;
    if (code) params.code = code;
    if (venue) params.venue = venue;
    if (search) params.search = search;

    const data = await makeApiRequest('/teams', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch teams',
      message: error.message 
    });
  }
});

// Team statistics endpoint
app.get('/api/teams/statistics', async (req, res) => {
  try {
    const { team, league, season, date } = req.query;
    
    if (!team || !league || !season) {
      return res.status(400).json({ 
        error: 'Team, league, and season parameters are required' 
      });
    }

    const params = { team, league, season };
    if (date) params.date = date;

    const data = await makeApiRequest('/teams/statistics', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch team statistics',
      message: error.message 
    });
  }
});

// Players endpoint
app.get('/api/players', async (req, res) => {
  try {
    const { id, team, league, season, search, page } = req.query;
    const params = {};
    
    if (id) params.id = id;
    if (team) params.team = team;
    if (league) params.league = league;
    if (season) params.season = season;
    if (search) params.search = search;
    if (page) params.page = page;

    const data = await makeApiRequest('/players', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch players',
      message: error.message 
    });
  }
});

// Top scorers endpoint
app.get('/api/players/topscorers', async (req, res) => {
  try {
    const { league, season } = req.query;
    
    if (!league || !season) {
      return res.status(400).json({ 
        error: 'League and season parameters are required' 
      });
    }

    const data = await makeApiRequest('/players/topscorers', { league, season });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch top scorers',
      message: error.message 
    });
  }
});

// Top assists endpoint
app.get('/api/players/topassists', async (req, res) => {
  try {
    const { league, season } = req.query;
    
    if (!league || !season) {
      return res.status(400).json({ 
        error: 'League and season parameters are required' 
      });
    }

    const data = await makeApiRequest('/players/topassists', { league, season });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch top assists',
      message: error.message 
    });
  }
});

// Predictions endpoint
app.get('/api/predictions', async (req, res) => {
  try {
    const { fixture } = req.query;
    
    if (!fixture) {
      return res.status(400).json({ error: 'Fixture ID is required' });
    }

    const data = await makeApiRequest('/predictions', { fixture });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch predictions',
      message: error.message 
    });
  }
});

// Injuries endpoint
app.get('/api/injuries', async (req, res) => {
  try {
    const { league, season, team, player, date, timezone } = req.query;
    const params = {};
    
    if (league) params.league = league;
    if (season) params.season = season;
    if (team) params.team = team;
    if (player) params.player = player;
    if (date) params.date = date;
    if (timezone) params.timezone = timezone;

    const data = await makeApiRequest('/injuries', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch injuries',
      message: error.message 
    });
  }
});

// Coaches endpoint
app.get('/api/coachs', async (req, res) => {
  try {
    const { id, team, search } = req.query;
    const params = {};
    
    if (id) params.id = id;
    if (team) params.team = team;
    if (search) params.search = search;

    const data = await makeApiRequest('/coachs', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch coaches',
      message: error.message 
    });
  }
});

// Venues endpoint
app.get('/api/venues', async (req, res) => {
  try {
    const { id, name, city, country, search } = req.query;
    const params = {};
    
    if (id) params.id = id;
    if (name) params.name = name;
    if (city) params.city = city;
    if (country) params.country = country;
    if (search) params.search = search;

    const data = await makeApiRequest('/venues', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch venues',
      message: error.message 
    });
  }
});

// Countries endpoint
app.get('/api/countries', async (req, res) => {
  try {
    const { name, code, search } = req.query;
    const params = {};
    
    if (name) params.name = name;
    if (code) params.code = code;
    if (search) params.search = search;

    const data = await makeApiRequest('/countries', params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch countries',
      message: error.message 
    });
  }
});

// Timezone endpoint
app.get('/api/timezone', async (req, res) => {
  try {
    const data = await makeApiRequest('/timezone');
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch timezone',
      message: error.message 
    });
  }
});

// Status endpoint for health checks
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    apiKey: FOOTBALL_API_KEY ? 'Configured' : 'Missing'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${FOOTBALL_API_KEY ? 'Yes' : 'No'}`);
});