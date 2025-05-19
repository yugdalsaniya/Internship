import React from 'react';
import banner from '../../assets/Hero/banner.jpg'; // Adjust the path as necessary

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center py-12 px-12"
      style={{
        backgroundImage: `url(${banner})`, // Background image
      }}
    >
      {/* Pseudo-element for gradient and opacity */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9DCDF] to-[#B5D9D3] opacity-90 bg-blend-overlay" />
      
      <div className="relative flex flex-col items-center text-center">
        {/* Heading */}
        <h1 className="text-3xl  md:text-4xl font-bold text-[#050748]   mb-3">

          Top Internships and OJT Programs in the Philippines for Career Launch
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg text-[#45457D] mb-6">
          Connecting Talent with Opportunity: Your Gateway to Career Success
        </p>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center w-full max-w-3xl p-3 space-y-3 md:space-y-0 md:space-x-3">
          <input
            type="text"
            placeholder="Internship Title or Company"
            className="flex-1 border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            className="flex-1 border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Select Location</option>
            {/* Add more options as needed */}
          </select>
          <select
            className="flex-1 border border-gray-300 rounded-md p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Select Category</option>
            {/* Add more options as needed */}
          </select>
          <button className="bg-blue-600 text-white rounded-md py-2 px-4 text-xs hover:bg-blue-700">
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-row flex-wrap justify-center gap-8 mt-8">
          {/* Internship Stat */}
          <div className="flex flex-row items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white-600 bg-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-gray-800">25,850</p>
              <p className="text-xs text-gray-600">Internships</p>
            </div>
          </div>

          {/* Candidates Stat */}
          <div className="flex flex-row items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-gray-800">10,250</p>
              <p className="text-xs text-gray-600">Candidates</p>
            </div>
          </div>

          {/* Companies Stat */}
          <div className="flex flex-row items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012 2h2a2 2 0 012 2v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-gray-800">18,400</p>
              <p className="text-xs text-gray-600">Companies</p>
            </div>
          </div>

          {/* Academy Stat */}
          <div className="flex flex-row items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m-2-4h14a2 2 0 012 2v2H3v-2a2 2 0 012-2z"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-semibold text-gray-800">2,500</p>
              <p className="text-xs text-gray-600">Academy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;