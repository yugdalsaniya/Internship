import React, { useState } from 'react';
import logo from '../../assets/Navbar/logo.png'; 
import { Link } from "react-router-dom"; // Import Link from react-router-dom


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md py-4 px-12">
      <div className="flex items-center justify-between">
        {/* Left Side: Logo and Text */}
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

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Home
          </Link>
          <Link to="/internship" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Internships
          </Link>
          <Link to="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            About Us
          </Link>
          <Link to="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Contact Us
          </Link>
        </div>

        {/* Right Side: Buttons and Hamburger (Mobile) */}
        <div className="flex items-center space-x-4 mr-4">
          {/* Desktop Buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="text-gray-800 text-sm font-medium hover:text-blue-600">
              Login
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800">
              Register
            </button>
          </div>

          {/* Hamburger Icon (Mobile) */}
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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center space-y-4 mt-4 pb-4">
          <a href="/" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Home
          </a>
          <a href="/internship" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Internships
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            About Us
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-600 text-sm font-medium">
            Contact Us
          </a>
          <button className="text-gray-800 text-sm font-medium hover:text-blue-600">
            Login
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-blue-800">
            Register
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;