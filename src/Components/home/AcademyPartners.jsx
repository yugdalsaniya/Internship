import React from 'react';

const AcademyPartners = () => {
  const partners = [
    {
      name: 'University of eastern pangasinan',
      tagline: 'Personalizing Experience with tech.',
      logo: 'https://via.placeholder.com/100x100?text=UEP',
    },
    {
      name: 'Urdaneta City University',
      tagline: 'Personalizing Experience with tech.',
      logo: 'https://via.placeholder.com/100x100?text=UCU',
    },
    {
      name: 'Pangasinan State University',
      tagline: 'Personalizing Experience with tech.',
      logo: 'https://via.placeholder.com/100x100?text=PSU',
    },
    {
      name: 'ilocos sur community college',
      tagline: 'Personalizing Experience with tech.',
      logo: 'https://via.placeholder.com/100x100?text=ISCC',
    },
  ];

  return (
    <section className="py-10">
      <div className="px-12">
        {/* Heading and View All Link */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-2">Our Academy Partners</h2>
            <p className="text-[#6A6A8E]">Elite Learning Partners</p>
          </div>
          <a href="#" className="text-[#6A6A8E] font-medium hover:underline">
            View all
          </a>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
            >
              {/* Logo Placeholder */}
              <img
                src={partner.logo}
                alt={`${partner.name} logo`}
                className="w-24 h-24 object-contain mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 text-center capitalize mb-2">
                {partner.name}
              </h3>
              <p className="text-gray-600 text-sm text-center mb-4">{partner.tagline}</p>
              <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Academy
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AcademyPartners;