import React, { useState, useEffect } from 'react';
import { fetchSectionData } from './../../Utils/api'; // Adjust the import path based on your project structure

const TopAcademy= () => {
  const fallbackLogo = '/assets/partners/fallback.png'; // Adjust path if in public
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'institute',
          query: { 'sectionData.institute.showinhomepage': true }, // Fetch only institutes shown on homepage
          projection: {
            'sectionData.institute.institutionname': 1,
            'sectionData.institute.institutiontagline': 1,
            'sectionData.institute.image': 1,
            _id: 0,
          },
        });

        // Map API response to match the component's expected structure
        const mappedData = data.map((item) => ({
          name: item.sectionData.institute.institutionname,
          tagline: item.sectionData.institute.institutiontagline,
          logo: item.sectionData.institute.image, // Placeholder logo
        }));

        setPartners(mappedData);
      } catch (err) {
        setError('Failed to load partners. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleImageError = (e) => {
    e.target.src = fallbackLogo; // Use local fallback or URL
  };

  return (
    <section className="py-4">
      <div className="px-12">
        {/* Heading and View All Link */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-4">Top Academy</h2>
            <p className="text-[#6A6A8E]">Elite Learning Partners</p>
          </div>
          <a href="#" className="text-[#6A6A8E] font-medium hover:underline">
            View all
          </a>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-600">Loading partners...</div>
        )}

        {/* Error State */}
        {error && <div className="text-center text-red-600">{error}</div>}

        {/* Partners Grid */}
        {!loading && !error && partners.length === 0 && (
          <div className="text-center text-gray-600">No partners found.</div>
        )}
        {!loading && !error && partners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white rounded-tl-none rounded-br-none rounded-tr-xl rounded-bl-xl p-6 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 outline-none cursor-pointer min-h-[250px]"
              >
                {/* Logo */}
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="w-24 h-24 object-contain mb-4"
                  onError={handleImageError}
                />
                <h3 className="text-lg font-semibold text-gray-900 text-center capitalize mb-2">
                  {partner.name}
                </h3>
                <p className="text-gray-600 text-sm text-center mb-4">{partner.tagline}</p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap">
                  View Academy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopAcademy;