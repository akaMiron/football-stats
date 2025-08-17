import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold hover:text-blue-200">
            Football Stats
          </Link>
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/')}`}
            >
              Home
            </Link>
            <Link 
              to="/leagues" 
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/leagues')}`}
            >
              Leagues
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;