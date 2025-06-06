import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TopEmployers = () => {
  const fallbackLogo = '/assets/employers/fallback.png';
  const [employers, setEmployers] = useState([]);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await axios.post('https://crmapi.conscor.com/api/general/mfind', {
          dbName: 'internph',
          collectionName: 'company',
          limit: 0
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          const companyList = response.data.data
            .filter(item => item.sectionData?.Company?.homepageCheckbox === true) // ✅ Check homepageCheckbox
            .map(item => {
              const company = item.sectionData.Company;
              return {
                name: company.name || 'Unnamed',
                logo: company.logoImage || fallbackLogo
              };
            });

          setEmployers(companyList);
        }
      } catch (error) {
        console.error('Error fetching employers:', error);
      }
    };

    fetchEmployers();
  }, []);

  const handleImageError = (e) => {
    e.target.src = fallbackLogo;
  };

  return (
    <section className="py-10">
      <div className="px-12">
        <h2 className="text-3xl font-bold text-[#050748] mb-2">Top Employer</h2>
        <p className="text-[#6A6A8E] mb-8">Join with the Best</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {employers.map((employer, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300"
            >
              <img
                src={employer.logo}
                alt={`${employer.name} logo`}
                className="w-36 h-24 object-contain mb-4"
                onError={handleImageError}
              />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{employer.name}</h3>
              <div className="flex space-x-3">
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap">
                  Explore
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
