import React from 'react';

const FeaturedInterns = () => {
  const interns = [
    { name: 'Abadiano', role: 'Intern Graphic Designer' },
    { name: 'Nathaniel', role: 'Intern UI/UX Designer' },
    { name: 'Angelo', role: 'Intern HR Recruiter' },
    { name: 'Joshua', role: 'Intern Python Developer' },
  ];

  return (
    <section className="py-10">
      <div className="px-12">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-[#050748] mb-2">Featured Interns</h2>
        <p className="text-[#6A6A8E] mb-8">Hire Top talent</p>

        {/* Interns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {interns.map((intern, index) => (
            <div
              key={index}
              className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
            >
              {/* Circular Placeholder for Profile Picture */}
              <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900">{intern.name}</h3>
              <p className="text-gray-600 text-sm">{intern.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInterns;