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
    <div className="px-12">
      {/* Heading */}
      <h2 className="text-3xl font-bold text-[#050748] ">Featured Interns</h2>
      <p className="text-[#6A6A8E] mb-6">Hire Top talent</p>

      {/* Interns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-3">
        {interns.map((intern, index) => (
          <div
            key={index}
            className="bg-white rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
          >
            {/* Profile Picture */}
            <img
              src={intern.image}
              alt={`${intern.name}'s profile`}
              className="w-24 h-24 rounded-full mb-4 object-cover"
            />
            <h3 className="text-lg font-semibold text-gray-900">{intern.name}</h3>
            <p className="text-gray-600 text-sm">{intern.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedInterns;