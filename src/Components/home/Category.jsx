import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [internshipCounts, setInternshipCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      try {
        // Fetch categories
        const categoryData = await fetchSectionData({
          collectionName: 'category',
          limit: 20,
          cacheBust: new Date().getTime(),
        });
        console.log('Category API Response:', categoryData);
        setCategories(categoryData);

        // Fetch internship counts for each category
        const counts = {};
        for (const category of categoryData) {
          const countData = await fetchSectionData({
            collectionName: 'jobpost',
            query: {
              'sectionData.jobpost.type': 'Internship',
              'sectionData.jobpost.subtype': category._id,
            },
            limit: 0,
            projection: { _id: 1 },
          });
          counts[category._id] = countData.length;
          console.log('Internship Counts:', counts);
          setInternshipCounts(counts);
        }
      } catch (err) {
        setError('Failed to fetch categories or internship counts. Please try again.');
        console.error('Category API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndCounts();
  }, []);

  const filteredCategories = useMemo(() => {
    const uniqueCategories = [];
    const seenTitles = new Set();

    categories.forEach((category) => {
      const title = category.sectionData?.category?.titleofinternship;
      if (title && !seenTitles.has(title.toLowerCase())) {
        seenTitles.add(title.toLowerCase());
        uniqueCategories.push(category);
      }
    });

    return uniqueCategories
      .filter((category) => {
        const cat = category.sectionData?.category;
        return cat && cat.titleofinternship && cat.showinhomepage === true;
      })
      .map((category) => ({
        id: category._id,
        name: category.sectionData.category.titleofinternship.toUpperCase(),
        originalName: category.sectionData.category.titleofinternship,
        count: (internshipCounts[category._id] || 0) * 11, // Multiply count by 11
        logo: category.sectionData?.category?.logo && category.sectionData.category.logo.startsWith('http')
          ? category.sectionData.category.logo
          : '/assets/placeholder-logo.png',
      }));
  }, [categories, internshipCounts]);

  const handleCategoryClick = (category) => {
    const encodedCategoryName = encodeURIComponent(category.originalName);
    navigate(`/${encodedCategoryName}/internships/${category.id}`);
  };

  if (loading) return (
    <section className="bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] py-4">
      <div className="px-4 sm:px-12">
        <h2 className="text-center text-2xl sm:text-4xl font-bold text-[#050748] mb-2">
          Browse by Category
        </h2>
        <p className="text-center text-[#6A6A8E] text-base sm:text-xl mb-4">
          Explore Opportunities by Category
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(4)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[180px] sm:min-h-[250px] animate-pulse"
            >
              <div className="h-8 sm:h-10 w-8 sm:w-10 bg-gray-200 rounded-full mb-4 sm:mb-6" />
              <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded mb-4 sm:mb-6" />
              <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (error) return (
    <div className="px-4 sm:px-12 py-12 text-center text-base sm:text-lg text-red-600">
      {error}
    </div>
  );

  if (filteredCategories.length === 0) return (
    <div className="px-4 sm:px-12 py-12 text-center text-base sm:text-lg text-[#050748]">
      No categories found.
    </div>
  );

  return (
    <section className="bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4] py-4">
      <div className="px-4 sm:px-12">
        <h2 className="text-center text-2xl sm:text-4xl font-bold text-[#050748] mb-2 sm:mb-4">
          Browse by Category
        </h2>
        <p className="text-center text-[#6A6A8E] text-base sm:text-xl mb-4">
          Explore options by category
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md hover:shadow-lg focus:shadow-lg transition-shadow duration-300 cursor-pointer min-h-[180px] sm:min-h-[250px] active:bg-gray-100 touch-manipulation"
              tabIndex={0}
              onClick={() => handleCategoryClick(category)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCategoryClick(category);
                }
              }}
            >
              <img
                src={category.logo}
                alt={`${category.name} Logo`}
                className="h-8 sm:h-10 w-8 sm:w-10 mb-4 sm:mb-6 object-contain"
                loading="lazy"
              />
              <h3 className="text-[#050748] font-semibold text-lg sm:text-2xl mb-4 sm:mb-6 text-center line-clamp-2">
                {category.name}
              </h3>
              <span className="bg-gray-100 text-gray-700 text-sm sm:text-base font-medium px-4 sm:px-5 py-1.5 sm:py-2 rounded-full">
                {category.count} Internship{category.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;