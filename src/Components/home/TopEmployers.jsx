import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TopEmployers = () => {
  const fallbackLogo = "https://placehold.co/150x100";
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
              // Ensure logo is a valid string, otherwise use fallback
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

          // Remove duplicates by ID
          const uniqueCompanies = Array.from(
            new Map(companyList.map(company => [company.id, company])).values()
          );

          // Sort by order field, with fallback to name if order is the same
          const sortedCompanies = uniqueCompanies.sort((a, b) => {
            const orderA = parseInt(a.order, 10);
            const orderB = parseInt(b.order, 10);
            if (orderA === orderB) {
              return a.name.localeCompare(b.name); // Secondary sort by name
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
      e.target.src = fallbackLogo; // Set fallback only if not already set
    }
  };

  return (
    <section className="py-4">
      <div className="px-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#050748] mb-4">Top Employer</h2>
            <p className="text-[#6A6A8E]">Join with the Best</p>
          </div>
          <Link 
            to="/all-employers" 
            className="text-[#6A6A8E] font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
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
            {employers.slice(0, 4).map((employer) => (
              <div
                key={employer.id}
                className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300"
              >
                <div className="w-36 h-24 flex items-center justify-center mb-4">
                  <img
                    src={employer.logo}
                    alt={`${employer.name} logo`}
                    className="max-w-[150px] max-h-[150px] object-contain"
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{employer.name}</h3>
                <div className="flex items-center text-sm text-gray-600 mb-4">
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
                  <span>{employer.location}</span>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/${encodeURIComponent(employer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}/${employer.id}`}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
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