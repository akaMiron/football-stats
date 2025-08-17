// components/ApiStatus.js
import React, { useState, useEffect } from 'react';
import { checkApiStatus, toggleMockMode, getMockMode } from '../config/api';

const ApiStatus = () => {
  const [status, setStatus] = useState<Boolean>(false);
  const [loading, setLoading] = useState(true);
  const [mockMode, setMockMode] = useState(getMockMode());

  useEffect(() => {
    fetchStatus();
    
    // Update mock mode state when it changes
    const handleStorageChange = () => {
      setMockMode(getMockMode());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchStatus = async () => {
    try {
      const apiStatus = await checkApiStatus();
      setStatus(apiStatus ?? false);
    } catch (error) {
      console.error('Failed to fetch API status:', error);
      setStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMockMode = () => {
    toggleMockMode();
    // Update local state immediately for better UX
    setMockMode(!mockMode);
  };

  if (loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm text-gray-800">API Status</h4>
          <button
            onClick={handleToggleMockMode}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              mockMode 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
            title={mockMode ? 'Switch to Live API' : 'Switch to Mock Mode'}
          >
            {mockMode ? '🧪 Mock' : '🌐 Live'}
          </button>
        </div>
        
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              mockMode ? 'bg-yellow-400' : status ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-gray-600">
              {mockMode ? 'Using mock data' : status ? 'API connected' : 'API disconnected'}
            </span>
          </div>
          
          {/* {!mockMode && status && (
            <>
              <p className="text-gray-600">Mode: {status.mode || 'production'}</p>
              <p className="text-gray-600">Server: {status.timestamp ? 'Online' : 'Offline'}</p>
            </>
          )} */}
          
          {mockMode && (
            <p className="text-yellow-700 bg-yellow-50 p-2 rounded text-xs mt-2">
              ⚡ Fast mock responses - no API limits
            </p>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Click toggle to switch modes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;