import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import { slugify } from '../../Utils/slugify';

const FeaturedCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCompanies = async () => {
      try {
        const data = await fetchSectionData({
          collectionName: 'company',
          limit: 50,
          query: {},
        });
        setCompanies(data);
      } catch (err) {
        setError('Error fetching company data');
        console.error('FeaturedCompany API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    getCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const homepageCheckbox = company.sectionData?.Company?.homepageCheckbox;
        return homepageCheckbox === true;
      })
      .filter((company) => {
        const logo = company.sectionData?.Company?.logoImage;
        return logo && logo !== '' && logo.startsWith('http');
      })
      .map((company) => ({
        ...company,
        logoSrc: company.sectionData.Company.logoImage || 'https://placehold.co/150x150',
        slug: slugify(company.sectionData.Company.name || 'company'),
      }));
  }, [companies]);

  if (loading) return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-3 px-2 sm:gap-4 sm:pb-4 sm:px-8 md:px-12 sm:space-x-8 md:space-x-12 scrollbar">
            {[...Array(5)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="flex-shrink-0 w-[150px] sm:w-[calc(20%-32px)] md:w-[calc(20%-48px)] border border-gray-200 rounded-xl flex items-center justify-center p-4 bg-white shadow-sm"
              >
                <div className="h-8 w-[100px] sm:h-10 sm:w-[120px] bg-gray-200 animate-pulse rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return <div className="py-6 sm:py-10 text-center text-red-500 text-sm sm:text-base">{error}</div>;
  if (filteredCompanies.length === 0) return <div className="py-6 sm:py-10 text-center text-sm sm:text-base">No companies with valid logos found.</div>;

  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-3 px-2 sm:gap-4 sm:pb-4 sm:px-8 md:px-12 sm:space-x-8 md:space-x-12 snap-x snap-mandatory scrollbar">
            {filteredCompanies.map((company) => (
              <Link
                to={`/${company.slug}/${company._id}`}
                key={company._id}
                className="flex-shrink-0 w-[150px] sm:w-[calc(20%-32px)] md:w-[calc(20%-48px)] border border-gray-200 rounded-xl flex items-center justify-center p-4 bg-white snap-center hover:shadow-lg active:shadow-md transition-all hover:scale-105 active:scale-100"
              >
                <img
                  src={company.logoSrc}
                  alt={`${company.sectionData.Company.companyName} Logo`}
                  className="h-8 sm:h-10 max-w-[100px] sm:max-w-[120px] object-contain"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar::-webkit-scrollbar {
          height: 4px;
          display: none;
        }
        .scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 8px;
        }
        .scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 8px;
        }
        .scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @media (min-width: 640px) {
          .scrollbar::-webkit-scrollbar {
            height: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedCompany;