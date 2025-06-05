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
        console.log('FeaturedCompany API Response:', data);
        setCompanies(data);
      } catch (err) {
        setError('Error fetching company data');
getitem: console.error('FeaturedCompany API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    getCompanies();
  }, []);

  // Memoize companies with valid logo sources
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((company) => {
        const logo = company.sectionData?.Company?.logoImage;
        return logo && logo !== '' && logo.startsWith('http');
      })
      .map((company) => ({
        ...company,
        logoSrc: company.sectionData.Company.logoImage || 'https://placehold.co/150x150',
      }));
  }, [companies]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (filteredCompanies.length === 0) return <div>No companies with valid logos found.</div>;

  return (
    <div className="flex flex-wrap justify-center items-center mx-6 py-10 bg-white space-x-4 sm:space-x-24">
      {filteredCompanies.map((company) => (
        <img
          key={company._id}
          src={company.logoSrc}
          alt={`${company.sectionData.Company.companyName} Logo`}
          className="h-6 sm:h-8 md:h-10 object-contain"
        />
      ))}
    </div>
  );
};

export default FeaturedCompany;