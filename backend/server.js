// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
// const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3';

// const apiHeaders = {
//   'X-RapidAPI-Key': FOOTBALL_API_KEY,
//   'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
// };

// app.get(`${API_BASE_URL}/api/leagues`, async (req, res) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/leagues`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch leagues' });
//   }
// });

// app.get(`${API_BASE_URL}/api/fixtures', async (req, res) => {
//   try {
//     const { league, season, team, last } = req.query;
//     const params = new URLSearchParams();
    
//     if (league) params.append('league', league);
//     if (season) params.append('season', season);
//     if (team) params.append('team', team);
//     if (last) params.append('last', last);

//     const response = await axios.get(`${BASE_URL}/fixtures?${params.toString()}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch fixtures' });
//   }
// });

// app.get(`${API_BASE_URL}/api/standings', async (req, res) => {
//   try {
//     const { league, season } = req.query;
//     const params = new URLSearchParams();
    
//     if (league) params.append('league', league);
//     if (season) params.append('season', season);

//     const response = await axios.get(`${BASE_URL}/standings?${params.toString()}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch standings' });
//   }
// });

// app.get(`${API_BASE_URL}/api/teams/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/teams?id=${id}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch team data' });
//   }
// });

// app.get(`${API_BASE_URL}/api/teams/:id/statistics', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { league, season } = req.query;
//     const params = new URLSearchParams();
    
//     params.append('team', id);
//     if (league) params.append('league', league);
//     if (season) params.append('season', season);

//     const response = await axios.get(`${BASE_URL}/teams/statistics?${params.toString()}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch team statistics' });
//   }
// });

// app.get(`${API_BASE_URL}/api/fixtures/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/fixtures?id=${id}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch fixture details' });
//   }
// });

// app.get(`${API_BASE_URL}/api/fixtures/:id/statistics', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/fixtures/statistics?fixture=${id}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch match statistics' });
//   }
// });

// app.get(`${API_BASE_URL}/api/fixtures/:id/events', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/fixtures/events?fixture=${id}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch match events' });
//   }
// });

// app.get(`${API_BASE_URL}/api/fixtures/:id/lineups', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/fixtures/lineups?fixture=${id}`, {
//       headers: apiHeaders
//     });
//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch match lineups' });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });