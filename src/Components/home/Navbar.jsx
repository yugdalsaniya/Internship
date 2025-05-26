import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setDropdownOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md py-4 px-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center ml-4">
          <img
            src={logo}
            alt="Internship-OJT Logo"
            className="h-8 w-8 mr-2"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-semibold text-[#050748] underline">
              INTERNSHIP-OJT
            </h1>
            <p className="text-xs text-black font-bold uppercase mx-1">
              WORK24 PHILIPPINES
            </p>
          </div>
        </div>

        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Home
          </Link>
          <Link to="/internship" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Internships
          </Link>
          <Link to="/about" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Contact Us
          </Link>
        </div>

        <div className="flex items-center space-x-4 mr-4">
          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium"
              >
                {user.legalname[0]?.toUpperCase() || 'U'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-2 z-10">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-800">{user.legalname}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                   <Link
    to="/editprofile"
    onClick={() => setDropdownOpen(false)}
    className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
  >
    Edit Profile
  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-800 text-sm font-medium hover:text-blue-600 flex items-center h-10"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 flex items-center h-10"
              >
                Register
              </Link>
            </div>
          )}

          <button
            className="md:hidden text-gray-800 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4 pb-4">
          <Link to="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Home
          </Link>
          <Link to="/internship" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Internships
          </Link>
          <Link to="/about" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Contact Us
          </Link>
          {user ? (
            <>
              <div className="text-sm text-gray-800 font-medium">{user.legalname}</div>
              <button
                onClick={handleLogout}
                className="text-gray-800 text-sm font-medium hover:text-blue-600 w-full text-center py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-800 text-sm font-medium hover:text-blue-600 w-full text-center py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 w-full text-center"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;