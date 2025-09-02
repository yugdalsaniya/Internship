import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { fetchSectionData } from '../../Utils/api';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [internshipCounts, setInternshipCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false); // Track fetching state
  const navigate = useNavigate();
  // Local cache to store counts within session
  const [cachedCounts, setCachedCounts] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('internshipCounts') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      if (isFetching) {
        console.log('Fetch skipped: already fetching');
        return;
      }
      setIsFetching(true);
      try {
        // Fetch categories
        const categoryData = await fetchSectionData({
          collectionName: 'category',
          limit: 8,
          cacheBust: new Date().getTime(),
        });
        console.log('Category API Response:', categoryData);
        setCategories(categoryData || []);

        // Fetch only missing counts
        const missingCategoryIds = (categoryData || [])
          .filter(category => !(category._id in cachedCounts))
          .map(category => category._id);

        if (missingCategoryIds.length > 0) {
          console.log('Fetching counts for categories:', missingCategoryIds);
          const countPromises = missingCategoryIds.map(categoryId =>
            fetchSectionData({
              collectionName: 'jobpost',
              query: {
                'sectionData.jobpost.type': 'Internship',
                'sectionData.jobpost.subtype': categoryId,
              },
              limit: 0,
              projection: { _id: 1 },
            }).then(countData => ({ id: categoryId, count: countData.length }))
          );

          const countResults = await Promise.all(countPromises);
          const newCounts = countResults.reduce((acc, { id, count }) => {
            acc[id] = count;
            return acc;
          }, { ...cachedCounts });

          setInternshipCounts(newCounts);
          // Cache counts in sessionStorage
          try {
            sessionStorage.setItem('internshipCounts', JSON.stringify(newCounts));
          } catch (err) {
            console.error('Failed to cache counts:', err);
          }
        } else {
          console.log('Using cached counts:', cachedCounts);
          setInternshipCounts(cachedCounts);
        }
      } catch (err) {
        setError('Failed to fetch categories or internship counts. Please try again.');
        console.error('Category API Error:', err);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    };

    fetchCategoriesAndCounts();
  }, []);

  const filteredCategories = useMemo(() => {
    const seenTitles = new Set();
    const filtered = (categories || [])
      .filter(category => {
        const title = category.sectionData?.category?.titleofinternship;
        const showInHomepage = category.sectionData?.category?.showinhomepage === true;
        const isUnique = title && !seenTitles.has(title.toLowerCase());
        console.log('Category Filter:', {
          id: category._id,
          title,
          showInHomepage,
          isUnique,
        });
        return title && isUnique && showInHomepage && (seenTitles.add(title.toLowerCase()), true);
      })
      .map(category => ({
        id: category._id,
        name: category.sectionData.category.titleofinternship.toUpperCase(),
        originalName: category.sectionData.category.titleofinternship,
        count: (internshipCounts[category._id] || 0) * 11,
        logo: category.sectionData?.category?.logo?.startsWith('http')
          ? category.sectionData.category.logo
          : '/assets/placeholder-logo.png',
      }));
    console.log('Filtered Categories:', filtered);
    return filtered;
  }, [categories, internshipCounts]);

  const handleCategoryClick = useMemo(
    () =>
      debounce((category) => {
        const encodedCategoryName = encodeURIComponent(category.originalName);
        navigate(`/${encodedCategoryName}/internships/${category.id}`);
      }, 300),
    [navigate]
  );

  useEffect(() => () => handleCategoryClick.cancel(), [handleCategoryClick]);

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
          <div className="bg-white rounded-tl-none rounded-br-none rounded-tr-3xl rounded-bl-3xl p-4 sm:p-8 flex flex-col items-center border border-gray-200 shadow-md min-h-[180px] sm:min-h-[250px] animate-pulse">
            <div className="h-8 sm:h-10 w-8 sm:w-10 bg-gray-200 rounded-full mb-4 sm:mb-6" />
            <div className="h-5 sm:h-6 w-3/4 bg-gray-200 rounded mb-4 sm:mb-6" />
            <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded-full" />
          </div>
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
      No categories available at the moment. Please check back later.
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

export default React.memo(Category);