import React, { useEffect, useState, useMemo } from 'react';
import { fetchSectionData } from '../../Utils/api';

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
          query: { 'sectionData.Company.logoImage': { $ne: '' } },
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
        const logo = company.sectionData?.Company?.logoImage;
        return logo && logo !== '' && logo.startsWith('http');
      })
      .map((company) => ({
        ...company,
        logoSrc: company.sectionData.Company.logoImage,
        companyName: company.sectionData.Company.companyName || 'Company'
      }));
  }, [companies]);

  if (loading) return <div className="flex justify-center items-center h-32">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-32 text-red-500">{error}</div>;
  if (filteredCompanies.length === 0) return <div className="flex justify-center items-center h-32">No companies found.</div>;

  return (
    <div className="w-full bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`relative ${filteredCompanies.length > 5 ? 'overflow-x-auto' : 'overflow-x-visible'}`}>
          {/* Container that centers when few logos, left-aligns when many */}
          <div className={`
            flex 
            ${filteredCompanies.length > 5 ? 'justify-start' : 'justify-center'}
            w-full
            scroll-smooth 
            pb-4 
            [&::-webkit-scrollbar]:hidden 
            [-ms-overflow-style:none] 
            [scrollbar-width:none]
          `}>
            <div className="flex space-x-8 md:space-x-16 px-4">
              {filteredCompanies.map((company) => (
                <div 
                  key={company._id}
                  className="flex flex-col items-center justify-center flex-shrink-0 w-32 h-20"
                >
                  <img
                    src={company.logoSrc}
                    alt={`${company.companyName} Logo`}
                    className="max-h-12 w-auto object-contain transition-all duration-300 hover:scale-105"
                    style={{ maxWidth: '100px' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCompany;