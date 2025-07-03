import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TopEmployers = () => {
  const fallbackLogo = "https://placehold.co/120x80";
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
            .filter(item => item.sectionData?.Company?.topemployer === true)
            .map(item => {
              const company = item.sectionData.Company;
              const logoUrl = company.logoImage && typeof company.logoImage === 'string' && company.logoImage.trim() !== ''
                ? company.logoImage
                : fallbackLogo;
              return {
                id: item._id,
                name: company.name || 'Unnamed',
                logo: logoUrl,
                location: company.organizationcity || 'Unknown Location',
                order: company.order || '9999'
              };
            });

          const uniqueCompanies = Array.from(
            new Map(companyList.map(company => [company.id, company])).values()
          );

          const sortedCompanies = uniqueCompanies.sort((a, b) => {
            const orderA = parseInt(a.order, 10);
            const orderB = parseInt(b.order, 10);
            if (orderA === orderB) {
              return a.name.localeCompare(b.name);
            }
            return orderA - orderB;
          });

          setEmployers(sortedCompanies);
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
    if (e.target.src !== fallbackLogo) {
      e.target.src = fallbackLogo;
    }
  };

  return (
    <section className="py-4">
      <div className="px-4 sm:px-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#050748] mb-2">Discover Leading Employers</h2>
            <p className="text-gray-600 text-base sm:text-lg">Kickstart Your Career with the Best in the Philippines</p>
          </div>
          <Link 
            to="/all-employers" 
            className="text-blue-600 md:text-[#6A6A8E] text-sm md:text-base font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {[...Array(4)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm border border-gray-300 min-h-[200px]"
              >
                <div className="w-28 h-16 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded mb-3" />
                <div className="h-7 w-20 bg-gray-200 animate-pulse rounded-full mt-auto" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="text-center text-red-600 text-sm sm:text-base py-4">{error}</div>}

        {!loading && !error && employers.length === 0 && (
          <div className="text-center text-gray-600 text-sm sm:text-base py-4">No employers found.</div>
        )}

        {!loading && !error && employers.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {employers.slice(0, 4).map((employer) => (
              <div
                key={employer.id}
                className="bg-white rounded-xl p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300 min-h-[200px]"
              >
                <div className="w-28 h-16 flex items-center justify-center mb-3">
                  <img
                    src={employer.logo}
                    alt={`${employer.name} logo`}
                    className="max-w-[120px] max-h-[80px] object-contain"
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 text-center line-clamp-2">{employer.name}</h3>
                <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-3">
                  <svg
                    className="w-3 sm:w-4 h-3 sm:h-4 mr-1"
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
                  <span className="line-clamp-1">{employer.location}</span>
                </div>
                <div className="mt-auto">
                  <Link
                    to={`/${encodeURIComponent(employer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}/${employer.id}`}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
                  >
                    Explore
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopEmployers;