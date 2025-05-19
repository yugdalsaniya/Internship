import React from 'react';
import { BsBookmarkPlus } from 'react-icons/bs'; // Using Bootstrap Icons for BookmarkPlus


// Sample data for internships (can be replaced with dynamic data later)
const internships = [
  {
    id: 1,
    role: 'MARKETING',
    company: 'Alicargo Logistics Limited',
    time: '10 min ago',
    type: 'Full time',
    salary: '₹25,000 - ₹30,000',
    location: 'AHMEDABAD',
  },
  {
    id: 2,
    role: 'UI/UX DESIGNER',
    company: 'WebFinix Enterprises',
    time: '10 min ago',
    type: 'Full time',
    salary: '₹25,000 - ₹30,000',
    location: 'AHMEDABAD',
  },
  {
    id: 3,
    role: 'GRAPHIC DESIGNER',
    company: 'Flipspaces co Limited',
    time: '10 min ago',
    type: 'Full time',
    salary: '₹25,000 - ₹30,000',
    location: 'AHMEDABAD',
  },
  {
    id: 4,
    role: 'MARKETING',
    company: 'Alicargo Logistics Limited',
    time: '10 min ago',
    type: 'Full time',
    salary: '₹25,000 - ₹30,000',
    location: 'AHMEDABAD',
  },
];

const RecentInternships = () => {
  return (
    <div className="mx-12 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#050748]">
            Recent Internships
          </h2>
          <p className="text-xs sm:text-sm text-[#6A6A8E] uppercase">
            NEW OPPORTUNITIES, JUST POSTED!
          </p>
        </div>
        <a
          href="#"
          className="text-[#6A6A8E] text-xs sm:text-sm md:text-base font-medium hover:underline"
        >
          View all
        </a>
      </div>

      {/* Internship Cards */}
      <div className="space-y-3 sm:space-y-4">
        {internships.map((internship) => (
          <div
            key={internship.id}
            className="flex flex-col bg-white rounded-lg shadow-md p-4"
          >
            {/* Top Row: Time Capsule and Logo */}
            <div className="flex justify-between items-center mb-2">
              {/* Time Capsule */}
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {internship.time}
              </span>

              {/* Logo (replacing three-dot icon) */}
              <BsBookmarkPlus className="h-6 w-6" aria-label="Bookmark Plus Icon" />
            </div>

            {/* Main Content */}
            <div className="flex justify-between items-center">
              {/* Left Side */}
              <div className="flex-1">
                {/* Logo and Title */}
                <div className="flex items-center space-x-3 sm:space-x-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {internship.role.charAt(0)}
                    </span>
                  </div>

                  {/* Title and Company */}
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {internship.role}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {internship.company}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-wrap items-center space-x-2 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {internship.type}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.657 0 3 .895 3 2s-1.343 2-3 2m0 0c-1.657 0-3 .895-3 2s1.343 2 3 2m-6 0V6m12 12V6"
                      />
                    </svg>
                    {internship.salary}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {internship.location}
                  </span>
                </div>
              </div>

              {/* Right Side: Internship Details Button */}
              <div className="flex items-end">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700">
                  Internship Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentInternships;