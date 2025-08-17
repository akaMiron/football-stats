require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log('🧪 Running in DEBUG mode with mock data');

// Mock data for testing
const mockLeagues = {
  response: [
    {
      league: {
        id: 39,
        name: "Premier League",
        type: "League",
        logo: "https://media.api-sports.io/football/leagues/39.png"
      },
      country: {
        name: "England",
        code: "GB",
        flag: "https://media.api-sports.io/flags/gb.svg"
      },
      seasons: [
        {
          year: 2023,
          start: "2023-08-12",
          end: "2024-05-19",
          current: true
        }
      ]
    },
    {
      league: {
        id: 140,
        name: "La Liga",
        type: "League",
        logo: "https://media.api-sports.io/football/leagues/140.png"
      },
      country: {
        name: "Spain",
        code: "ES",
        flag: "https://media.api-sports.io/flags/es.svg"
      },
      seasons: [
        {
          year: 2023,
          start: "2023-08-12",
          end: "2024-05-19",
          current: true
        }
      ]
    },
    {
      league: {
        id: 135,
        name: "Serie A",
        type: "League",
        logo: "https://media.api-sports.io/football/leagues/135.png"
      },
      country: {
        name: "Italy",
        code: "IT",
        flag: "https://media.api-sports.io/flags/it.svg"
      },
      seasons: [
        {
          year: 2023,
          start: "2023-08-12",
          end: "2024-05-19",
          current: true
        }
      ]
    }
  ]
};

const mockFixtures = {
  response: [
    {
      fixture: {
        id: 12345,
        referee: "Michael Oliver",
        date: "2024-01-15T17:30:00+00:00",
        status: { short: "FT", long: "Match Finished" },
        venue: { name: "Emirates Stadium", city: "London" }
      },
      teams: {
        home: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
        away: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" }
      },
      goals: { home: 2, away: 1 },
      score: {
        halftime: { home: 1, away: 0 },
        fulltime: { home: 2, away: 1 }
      },
      league: { 
        id: 39,
        name: "Premier League", 
        round: "Regular Season - 21",
        logo: "https://media.api-sports.io/football/leagues/39.png"
      }
    },
    {
      fixture: {
        id: 12346,
        referee: "Anthony Taylor",
        date: "2024-01-20T15:00:00+00:00",
        status: { short: "FT", long: "Match Finished" },
        venue: { name: "Old Trafford", city: "Manchester" }
      },
      teams: {
        home: { id: 33, name: "Manchester United", logo: "https://media.api-sports.io/football/teams/33.png" },
        away: { id: 40, name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" }
      },
      goals: { home: 1, away: 3 },
      score: {
        halftime: { home: 0, away: 2 },
        fulltime: { home: 1, away: 3 }
      },
      league: { 
        id: 39,
        name: "Premier League", 
        round: "Regular Season - 22",
        logo: "https://media.api-sports.io/football/leagues/39.png"
      }
    }
  ]
};

const mockMatchStatistics = {
  response: [
    {
      team: {
        id: 42,
        name: "Arsenal",
        logo: "https://media.api-sports.io/football/teams/42.png"
      },
      statistics: [
        { type: "Shots on Goal", value: 6 },
        { type: "Shots off Goal", value: 4 },
        { type: "Total Shots", value: 10 },
        { type: "Ball Possession", value: "48%" },
        { type: "Total passes", value: 412 },
        { type: "Passes accurate", value: 357 },
        { type: "Passes %", value: "87%" },
        { type: "Fouls", value: 12 },
        { type: "Corner Kicks", value: 6 },
        { type: "Offsides", value: 3 }
      ]
    },
    {
      team: {
        id: 50,
        name: "Manchester City",
        logo: "https://media.api-sports.io/football/teams/50.png"
      },
      statistics: [
        { type: "Shots on Goal", value: 4 },
        { type: "Shots off Goal", value: 4 },
        { type: "Total Shots", value: 8 },
        { type: "Ball Possession", value: "52%" },
        { type: "Total passes", value: 578 },
        { type: "Passes accurate", value: 523 },
        { type: "Passes %", value: "90%" },
        { type: "Fouls", value: 8 },
        { type: "Corner Kicks", value: 3 },
        { type: "Offsides", value: 1 }
      ]
    }
  ]
};

const mockMatchEvents = {
  response: [
    {
      time: { elapsed: 12, extra: null },
      team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      player: { id: 882, name: "Gabriel Jesus" },
      assist: { id: 897, name: "Martin Ødegaard" },
      type: "Goal",
      detail: "Normal Goal"
    },
    {
      time: { elapsed: 34, extra: null },
      team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      player: { id: 896, name: "Thomas Partey" },
      assist: { id: null, name: null },
      type: "Card",
      detail: "Yellow Card"
    },
    {
      time: { elapsed: 67, extra: null },
      team: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
      player: { id: 635, name: "Erling Haaland" },
      assist: { id: 629, name: "Kevin De Bruyne" },
      type: "Goal",
      detail: "Normal Goal"
    },
    {
      time: { elapsed: 78, extra: null },
      team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      player: { id: 897, name: "Martin Ødegaard" },
      assist: { id: 882, name: "Gabriel Jesus" },
      type: "Goal",
      detail: "Normal Goal"
    }
  ]
};

const mockLineups = {
  response: [
    {
      team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
      formation: "4-3-3",
      startXI: [
        { player: { id: 882, name: "Gabriel Jesus", number: 9, pos: "F" } },
        { player: { id: 897, name: "Martin Ødegaard", number: 8, pos: "M" } },
        { player: { id: 896, name: "Thomas Partey", number: 5, pos: "M" } },
        { player: { id: 885, name: "Gabriel Magalhães", number: 6, pos: "D" } },
        { player: { id: 889, name: "Aaron Ramsdale", number: 1, pos: "G" } }
      ],
      substitutes: [
        { player: { id: 903, name: "Eddie Nketiah", number: 14, pos: "F" } },
        { player: { id: 901, name: "Emile Smith Rowe", number: 10, pos: "M" } }
      ],
      coach: { id: 793, name: "Mikel Arteta" }
    },
    {
      team: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
      formation: "4-3-3",
      startXI: [
        { player: { id: 635, name: "Erling Haaland", number: 9, pos: "F" } },
        { player: { id: 629, name: "Kevin De Bruyne", number: 17, pos: "M" } },
        { player: { id: 627, name: "Bernardo Silva", number: 20, pos: "M" } },
        { player: { id: 631, name: "Ruben Dias", number: 3, pos: "D" } },
        { player: { id: 632, name: "Ederson", number: 31, pos: "G" } }
      ],
      substitutes: [
        { player: { id: 633, name: "Riyad Mahrez", number: 26, pos: "F" } },
        { player: { id: 634, name: "Phil Foden", number: 47, pos: "M" } }
      ],
      coach: { id: 794, name: "Pep Guardiola" }
    }
  ]
};

const mockTeams = {
  42: {
    response: [{
      team: {
        id: 42,
        name: "Arsenal",
        code: "ARS",
        country: "England",
        founded: 1886,
        national: false,
        logo: "https://media.api-sports.io/football/teams/42.png"
      },
      venue: {
        id: 494,
        name: "Emirates Stadium",
        address: "Queensland Road",
        city: "London",
        capacity: 60383,
        surface: "grass",
        image: "https://media.api-sports.io/football/venues/494.png"
      }
    }]
  },
  50: {
    response: [{
      team: {
        id: 50,
        name: "Manchester City",
        code: "MCI",
        country: "England",
        founded: 1880,
        national: false,
        logo: "https://media.api-sports.io/football/teams/50.png"
      },
      venue: {
        id: 555,
        name: "Etihad Stadium",
        address: "Etihad Campus",
        city: "Manchester",
        capacity: 55097,
        surface: "grass",
        image: "https://media.api-sports.io/football/venues/555.png"
      }
    }]
  }
};

const mockTeamStatistics = {
  response: {
    league: {
      id: 39,
      name: "Premier League",
      country: "England",
      logo: "https://media.api-sports.io/football/leagues/39.png",
      flag: "https://media.api-sports.io/flags/gb.svg",
      season: 2023
    },
    team: {
      id: 42,
      name: "Arsenal",
      logo: "https://media.api-sports.io/football/teams/42.png"
    },
    fixtures: {
      played: { home: 19, away: 19, total: 38 },
      wins: { home: 16, away: 12, total: 28 },
      draws: { home: 2, away: 4, total: 6 },
      loses: { home: 1, away: 3, total: 4 }
    },
    goals: {
      for: {
        total: { home: 51, away: 40, total: 91 },
        average: { home: "2.7", away: "2.1", total: "2.4" }
      },
      against: {
        total: { home: 18, away: 28, total: 46 },
        average: { home: "0.9", away: "1.5", total: "1.2" }
      }
    },
    clean_sheet: { home: 12, away: 8, total: 20 },
    failed_to_score: { home: 3, away: 5, total: 8 },
    penalty: {
      scored: { total: 8, percentage: "89%" },
      missed: { total: 1, percentage: "11%" },
      total: 9
    },
    cards: {
      yellow: {
        "0-15": { total: 5, percentage: "8%" },
        "16-30": { total: 8, percentage: "13%" },
        "31-45": { total: 12, percentage: "19%" },
        "46-60": { total: 15, percentage: "24%" },
        "61-75": { total: 12, percentage: "19%" },
        "76-90": { total: 11, percentage: "17%" }
      },
      red: {
        "0-15": { total: 0, percentage: "0%" },
        "16-30": { total: 1, percentage: "50%" },
        "31-45": { total: 0, percentage: "0%" },
        "46-60": { total: 1, percentage: "50%" },
        "61-75": { total: 0, percentage: "0%" },
        "76-90": { total: 0, percentage: "0%" }
      }
    }
  }
};

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Debug mode working!',
    timestamp: new Date().toISOString(),
    mode: 'debug'
  });
});

app.get('/api/leagues', (req, res) => {
  console.log('🔄 Returning mock leagues data');
  res.json(mockLeagues);
});

app.get('/api/fixtures', (req, res) => {
  console.log('🔄 Returning mock fixtures data');
  res.json(mockFixtures);
});

app.get('/api/standings', (req, res) => {
  console.log('🔄 Returning mock standings data');
  res.json({
    response: [{
      league: {
        id: 39,
        name: "Premier League",
        country: "England",
        logo: "https://media.api-sports.io/football/leagues/39.png",
        season: 2023,
        standings: [[
          {
            rank: 1,
            team: { id: 42, name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" },
            points: 84,
            goalsDiff: 45,
            all: { played: 38, win: 26, draw: 6, lose: 6, goals: { for: 91, against: 46 } }
          },
          {
            rank: 2,
            team: { id: 50, name: "Manchester City", logo: "https://media.api-sports.io/football/teams/50.png" },
            points: 89,
            goalsDiff: 61,
            all: { played: 38, win: 28, draw: 5, lose: 5, goals: { for: 99, against: 38 } }
          }
        ]]
      }
    }]
  });
});

// Specific fixture endpoints
app.get('/api/fixtures/:id', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock fixture data for ID:', id);
  
  // Return the first fixture from our mock data
  res.json({
    response: [mockFixtures.response[0]]
  });
});

app.get('/api/fixtures/:id/statistics', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock statistics for fixture:', id);
  res.json(mockMatchStatistics);
});

app.get('/api/fixtures/:id/events', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock events for fixture:', id);
  res.json(mockMatchEvents);
});

app.get('/api/fixtures/:id/lineups', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock lineups for fixture:', id);
  res.json(mockLineups);
});

// Team endpoints
app.get('/api/teams/:id', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock team data for ID:', id);
  
  // Return mock team data - default to Arsenal if ID not found
  const teamData = mockTeams[id] || mockTeams[42];
  res.json(teamData);
});

app.get('/api/teams/:id/statistics', (req, res) => {
  const { id } = req.params;
  console.log('🔄 Returning mock team statistics for ID:', id);
  res.json(mockTeamStatistics);
});

app.listen(PORT, () => {
  console.log(`🧪 Debug server running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Available endpoints:`);
  console.log(`   GET /api/leagues`);
  console.log(`   GET /api/fixtures`);
  console.log(`   GET /api/fixtures/:id`);
  console.log(`   GET /api/fixtures/:id/statistics`);
  console.log(`   GET /api/fixtures/:id/events`);
  console.log(`   GET /api/fixtures/:id/lineups`);
  console.log(`   GET /api/teams/:id`);
  console.log(`   GET /api/teams/:id/statistics`);
});