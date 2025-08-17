import React, { useState, useEffect } from 'react';
import { checkApiStatus, toggleMockMode, MOCK_MODE } from '../config/api';

const ApiStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const apiStatus = await checkApiStatus();
    setStatus(apiStatus);
    setLoading(false);
  };

  if (loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">API Status</h4>
          <button
            onClick={toggleMockMode}
            className={`px-2 py-1 text-xs rounded ${
              MOCK_MODE 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {MOCK_MODE ? 'Mock Mode' : 'Live API'}
          </button>
        </div>
        
        {status && (
          <div className="text-xs text-gray-600">
            <p>Requests: {status.requestCount}/{status.maxRequests}</p>
            <p>Remaining: {status.requestsRemaining}</p>
            <p>Cache: {status.cacheSize} items</p>
            {status.requestsRemaining < 10 && (
              <p className="text-red-600 font-medium">⚠️ Low quota remaining</p>
            )}
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500">
          Reset: Tomorrow 03:00
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;