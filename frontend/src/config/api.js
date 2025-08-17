const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://your-backend-url.onrender.com'
  : 'http://localhost:5000';

// Mock mode for development when API limit exceeded
export const MOCK_MODE = localStorage.getItem('mock_mode') === 'true';

export const toggleMockMode = () => {
  const newMode = !MOCK_MODE;
  localStorage.setItem('mock_mode', newMode.toString());
  window.location.reload();
};

export const checkApiStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check API status:', error);
    return null;
  }
};

export default API_BASE_URL;