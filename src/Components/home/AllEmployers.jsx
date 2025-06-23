import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllEmployers = () => {
  const fallbackLogo = '/assets/employers/fallback.png';
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        setLoading(true);
        const response = await axios.post('https://crmapi.conscor.com/api/general/mfind', {
          dbName: 'internph',
          collectionName: 'company',
          limit: 0
        });

        if (response.data.success && Array.isArray(response.data.data)) {
          const companyList = response.data.data
            .filter(item => item.sectionData?.Company?.homepageCheckbox === true)
            .map(item => {
              const company = item.sectionData.Company;
              return {
                name: company.name || 'Unnamed',
                logo: company.logoImage || fallbackLogo
              };
            });

          setEmployers(companyList);
        } else {
          setError('No valid employer data found.');
        }
      } catch (error) {
        setError('Error fetching employers. Please try again later.');
        console.error('Error fetching employers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployers();
  }, []);

  const handleImageError = (e) => {
    e.target.src = fallbackLogo;
  };

  return (
    <section className="py-8">
      <div className="px-12">
        <h2 className="text-3xl font-bold text-[#050748] mb-8">All Employers</h2>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm border border-gray-300 min-h-[200px]"
              >
                <div className="w-36 h-24 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600">{error}</div>}

        {!loading && !error && employers.length === 0 && (
          <div className="text-center text-gray-600">No employers found.</div>
        )}

        {!loading && !error && employers.length > 0 && (
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
        )}
      </div>
    </section>
  );
};

export default AllEmployers;