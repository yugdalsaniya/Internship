import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [internshipDropdownOpen, setInternshipDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const role = user.role || '';
  const userDropdownRef = useRef(null);
  const internshipDropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const toggleInternshipDropdown = () => {
    setInternshipDropdownOpen(!internshipDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUserDropdownOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth >= 640) {
        if (userDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
          setUserDropdownOpen(false);
        }
        if (internshipDropdownOpen && internshipDropdownRef.current && !internshipDropdownRef.current.contains(event.target)) {
          setInternshipDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen, internshipDropdownOpen]);

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
      {
        label: 'Internships',
        isDropdown: true,
        dropdownItems: [
          { to: '/post-internship', label: 'Post Internship' },
          { to: '/manage-internships', label: 'Manage Internships' },
        ],
      },
      { to: '/interns', label: 'Interns' },
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
    <nav className="bg-white shadow-md py-2 px-5 sm:px-12">
      <div className="flex items-center justify-between mx-auto h-12">
        <div className="flex items-center ml-0 sm:ml-4">
          <Link to="/">
            <img
              src={logo}
              alt="Internship-OJT Logo"
              className="h-16 w-auto"
            />
          </Link>
        </div>

        <div className="hidden md:flex space-x-8 items-center">
          {links.map((link) => (
            <div key={link.label} className="relative flex items-center">
              {link.isDropdown ? (
                <>
                  <div
                    onClick={toggleInternshipDropdown}
                    className="text-gray-800 hover:text-blue-600 text-sm font-medium cursor-pointer leading-5"
                  >
                    {link.label}
                  </div>
                  {internshipDropdownOpen && (
                    <div
                      ref={internshipDropdownRef}
                      className="absolute left-0 top-full w-44 bg-white border rounded-md shadow-lg py-2 z-10"
                    >
                      {link.dropdownItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          onClick={() => setInternshipDropdownOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={link.to}
                  className="text-gray-800 hover:text-blue-600 text-sm font-medium leading-5"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 mr-0">
          {user.email ? (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium"
              >
                {user.legalname?.[0]?.toUpperCase() || 'U'}
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border rounded-md shadow-lg py-2 z-10">
                  <div className="px-4 py-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-800">{user.legalname}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link
                    to="/editprofile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="block px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
                  >
                    Edit Profile
                  </Link>
                  {role === 'student' && (
                    <>
                      <Link
                        to="/my-applications"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
                      >
                        My Applications
                      </Link>
                      <Link
                        to="/requested-internships"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs sm:text-sm text-gray-800 hover:bg-gray-100"
                      >
                        Requested Internships
                      </Link>
                    </>
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
                className="text-gray-800 text-sm font-medium hover:text-blue-600 flex items-center h-10 leading-5"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 flex items-center h-10 leading-5"
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
            <div key={link.label}>
              {link.isDropdown ? (
                <>
                  <div
                    onClick={toggleInternshipDropdown}
                    className="text-gray-800 hover:text-blue-600 text-sm font-medium w-full text-center py-2 cursor-pointer leading-5"
                  >
                    {link.label}
                  </div>
                  {internshipDropdownOpen && (
                    <div className="w-full flex flex-col">
                      {link.dropdownItems.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="text-gray-800 hover:text-blue-600 text-sm font-medium py-2 text-center leading-5"
                          onClick={() => {
                            setIsOpen(false);
                            setInternshipDropdownOpen(false);
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={link.to}
                  className="text-gray-800 hover:text-blue-600 text-sm font-medium w-full text-center py-2 leading-5"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          {!user.email && (
            <>
              <Link
                to="/login"
                className="text-gray-800 text-sm font-medium hover:text-blue-600 w-full text-center py-2 leading-5"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800 w-full text-center leading-5"
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