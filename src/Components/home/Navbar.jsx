import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const role = user.role || '';

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

  // Define navigation links based on role
  const navLinks = {
    student: [
      { to: '/', label: 'Home' },
      { to: '/internship', label: 'Internships' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
    ],
    company: [
      { to: '/', label: 'Home' },
      { to: '/post-internship', label: 'Post Internship' },
      { to: '/manage-internships', label: 'Manage Internships' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
    ],
    academy: [
      { to: '/', label: 'Home' },
      { to: '/courses', label: 'Courses' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
    ],
    recruiter: [
      { to: '/', label: 'Home' },
      { to: '/internship-listings', label: 'Internship Listings' },
      { to: '/candidates', label: 'Candidates' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
    ],
    mentor: [
      { to: '/', label: 'Home' },
      { to: '/mentorship-programs', label: 'Mentorship Programs' },
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact Us' },
    ],
  };

  // Fallback links for unauthenticated users or unknown roles
  const defaultLinks = [
    { to: '/', label: 'Home' },
    { to: '/internship', label: 'Internships' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
  ];

  const links = navLinks[role] || defaultLinks;

  return (
    <nav className="bg-white shadow-md py-4 px-5 sm:px-12">
      <div className="flex items-center justify-between mx-auto">
        <div className="flex items-center ml-0 sm:ml-4">
          <img
            src={logo}
            alt="Internship-OJT Logo"
            className="h-7 sm:h-8 w-7 sm:w-8 mr-2"
          />
          <div className="flex flex-col items-center">
            <h1 className="text-base sm:text-lg font-semibold text-[#050748] underline">
              INTERNSHIP-OJT
            </h1>
            <p className="text-[10px] sm:text-xs text-black font-bold uppercase mx-0 sm:mx-1">
              WORK24 PHILIPPINES
            </p>
          </div>
        </div>

        <div className="hidden md:flex space-x-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-800 hover:text-blue-600 text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 mr-0 sm:mr-4">
          {user.email ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium"
              >
                {user.legalname?.[0]?.toUpperCase() || 'U'}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border rounded-md shadow-lg py-2 z-10">
                  <div className="px-4 py-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-800">{user.legalname}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/editprofile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>
                  {role === 'student' && (
                    <Link
                      to="/my-applications"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
                    >
                      My Applications
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
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
        <div className="md:hidden flex flex-col items-center space-y-3 mt-3 pb-3 w-full">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-800 hover:text-blue-600 text-sm font-medium w-full text-center py-2"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user.email ? (
            <>
              <div className="text-sm text-gray-800 font-medium w-full text-center">{user.legalname}</div>
              <Link
                to="/editprofile"
                className="text-gray-800 hover:text-blue-600 text-sm font-medium w-full text-center py-2"
                onClick={() => setIsOpen(false)}
              >
                Edit Profile
              </Link>
              {role === 'student' && (
                <Link
                  to="/my-applications"
                  className="text-gray-800 hover:text-blue-600 text-sm font-medium w-full text-center py-2"
                  onClick={() => setIsOpen(false)}
                >
                  My Applications
                </Link>
              )}
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
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 w-full text-center"
                onClick={() => setIsOpen(false)}
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