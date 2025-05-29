import React from 'react';

const TopEmployers = () => {
  const fallbackLogo = '/assets/employers/fallback.png'; // Adjust path if in public
  const employers = [
    { name: 'Accenture', logo: 'https://picsum.photos/150/100?random=1' },
    { name: 'GCash', logo: 'https://picsum.photos/150/100?random=2' },
    { name: 'Kyndryl', logo: 'https://picsum.photos/150/100?random=3' },
    { name: 'Aboitiz Power', logo: 'https://picsum.photos/150/100?random=4' },
  ];

  const handleImageError = (e) => {
    e.target.src = fallbackLogo; // Use local fallback or URL
  };

  return (
    <section className="py-10">
      <div className="px-12">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-[#050748] mb-2">Top Employer</h2>
        <p className="text-[#6A6A8E] mb-8">Join with the Best</p>

        {/* Employers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {employers.map((employer, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300"
            >
              {/* Logo */}
              <img
                src={employer.logo}
                alt={`${employer.name} logo`}
                className="w-36 h-24 object-contain mb-4"
                onError={handleImageError}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{employer.name}</h3>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Add Review
                </button>
                <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopEmployers;
