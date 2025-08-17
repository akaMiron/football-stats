// config/api.js
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL ||
      "https://football-stats-5c2o.onrender.com"
    : "http://localhost:5000";

// Dynamic mock mode check
export const getMockMode = () => localStorage.getItem("mock_mode") === "true";

export const toggleMockMode = () => {
  const newMode = !getMockMode();
  localStorage.setItem("mock_mode", newMode.toString());
  window.location.reload();
};

export const checkApiStatus = async () => {
  try {
    const { status } = await fetch(`${API_BASE_URL}/api/status`);
    console.log("API Status:", status);
    return status === 200;
  } catch (error) {
    console.error("Failed to check API status:", error);
    return null;
  }
};

// API Service functions - Updated to match backend exactly
export const apiService = {
  // Generic fetch function
  async fetchData(endpoint, params = {}) {
    const mockMode = getMockMode();

    if (mockMode) {
      console.log("🧪 Using mock data for:", endpoint);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
      return { response: [] }; // Default empty response for mock mode
    }

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}${endpoint}${
        queryString ? "?" + queryString : ""
      }`;

      console.log("🌐 Fetching from API:", url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // API methods that match the backend exactly
  async getLeagues(params = {}) {
    return this.fetchData("/api/leagues", params);
  },

  // Main fixtures endpoint - handles all fixture requests
  async getFixtures(params = {}) {
    return this.fetchData("/api/fixtures", params);
  },

  async getStandings(params = {}) {
    return this.fetchData("/api/standings", params);
  },

  // Fixture-specific endpoints
  async getFixtureDetails(id) {
    return this.fetchData("/api/fixtures", { id });
  },

  async getFixtureStatistics(id) {
    return this.fetchData("/api/fixtures/statistics", { fixture: id });
  },

  async getFixtureEvents(id) {
    return this.fetchData("/api/fixtures/events", { fixture: id });
  },

  async getFixtureLineups(id) {
    return this.fetchData("/api/fixtures/lineups", { fixture: id });
  },

  async getFixtureH2H(h2h) {
    return this.fetchData("/api/fixtures/headtohead", { h2h });
  },

  async getFixturePredictions(id) {
    return this.fetchData("/api/predictions", { fixture: id });
  },

  // Team endpoints
  async getTeam(id) {
    return this.fetchData("/api/teams", { id });
  },

  async getTeamStatistics(team, league, season) {
    return this.fetchData("/api/teams/statistics", { team, league, season });
  },

  // Player endpoints
  async getPlayers(params = {}) {
    return this.fetchData("/api/players", params);
  },

  async getPlayerStatistics(id, season) {
    return this.fetchData("/api/players", { id, season });
  },

  async getTopScorers(league, season) {
    return this.fetchData("/api/players/topscorers", { league, season });
  },

  async getTopAssists(league, season) {
    return this.fetchData("/api/players/topassists", { league, season });
  },

  // Other endpoints
  async getInjuries(params = {}) {
    return this.fetchData("/api/injuries", params);
  },

  async getCoaches(params = {}) {
    return this.fetchData("/api/coachs", params);
  },

  async getVenues(params = {}) {
    return this.fetchData("/api/venues", params);
  },

  async getCountries(params = {}) {
    return this.fetchData("/api/countries", params);
  },

  async getTimezones() {
    return this.fetchData("/api/timezone");
  },

  // Convenience methods for common use cases
  async getLiveFixtures(params = {}) {
    return this.getFixtures({ ...params, live: 'all' });
  },

  async getFixturesByDate(date, params = {}) {
    return this.getFixtures({ ...params, date });
  },

  async getFixturesByLeague(league, season, params = {}) {
    return this.getFixtures({ ...params, league, season });
  },

  // Health check
  async getStatus() {
    return this.fetchData("/api/status");
  }
};

export default API_BASE_URL;