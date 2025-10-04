import React from 'react';
import inturn1 from '../../assets/Featured/featured1.png';
import inturn2 from '../../assets/Featured/featured2.png';
import inturn3 from '../../assets/Featured/featured3.png';
import inturn4 from '../../assets/Featured/featured4.png';

const FeaturedInterns = () => {
  const interns = [
    { name: 'Abadiano', role: 'Intern Graphic Designer', image: inturn1 },
    { name: 'Nathaniel', role: 'Intern UI/UX Designer', image: inturn2 },
    { name: 'Angelo', role: 'Intern HR Recruiter', image: inturn3 },
    { name: 'Joshua', role: 'Intern Python Developer', image: inturn4 },
  ];

  return (
    <div className="px-4 sm:px-12 mt-4 sm:mt-6 mb-8 sm:mb-12">
      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-bold text-[#050748] mb-2 sm:mb-3">
        Featured Interns
      </h2>
      <p className="text-gray-600 text-base  sm:text-lg mb-4 sm:mb-6">
        Hire Top talent
      </p>

      {/* Interns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-3">
        {interns.map((intern, index) => (
          <div
            key={index}
            className="bg-white rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 cursor-pointer min-h-[200px] sm:min-h-[250px] active:bg-gray-100 touch-manipulation"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
              }
            }}
          >
            {/* Profile Picture */}
            <img
              src={intern.image}
              alt={`${intern.name}'s profile`}
              className="w-20 sm:w-24 h-20 sm:h-24 rounded-full mb-3 sm:mb-4 object-cover"
              loading="lazy"
            />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center line-clamp-1">
              {intern.name}
            </h3>
            <p className="text-gray-600 text-sm sm:text-sm text-center line-clamp-2">
              {intern.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedInterns;