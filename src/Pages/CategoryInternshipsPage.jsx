import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BsBookmarkPlus } from 'react-icons/bs';
import { fetchSectionData } from '../Utils/api';
import { formatDistanceToNow } from 'date-fns';
import { generateInternshipSlug } from '../Utils/slugify';

export default function CategoryInternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('latest');
  const internshipsPerPage = 5;
  const { categoryname, id } = useParams();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(categoryname);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        // Fetch category to verify _id and get title
        const categoryData = await fetchSectionData({
          collectionName: 'category',
          query: { '_id': id },
          limit: 1,
        });
        console.log('Category Data:', categoryData);

        if (categoryData.length === 0) {
          setError('Category not found');
          setLoading(false);
          return;
        }

        const category = categoryData[0];
        const categoryTitle = category.sectionData?.category?.titleofinternship;
        if (!categoryTitle || categoryTitle.toLowerCase() !== decodedCategory.toLowerCase()) {
          setError('Category name does not match ID');
          setLoading(false);
          return;
        }
        setCategoryName(categoryTitle.toUpperCase());

        // Fetch internships
        const data = await fetchSectionData({
          collectionName: 'jobpost',
          limit: 20,
          query: {
            'sectionData.jobpost.type': 'Internship',
            'sectionData.jobpost.subtype': id,
          },
          order: -1,
          sortedBy: 'createdAt',
        });
        console.log('Internships Data:', data);
        setInternships(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch internships. Please try again.');
        console.error('CategoryInternshipsPage API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [decodedCategory, id]);

  const filteredInternships = useMemo(() => {
    if (!Array.isArray(internships)) {
      console.warn('Internships is not an array:', internships);
      return [];
    }

    return internships
      .filter((job) => {
        const isInternship = job.sectionData?.jobpost?.type === 'Internship';
        const matchesCategory = job.sectionData?.jobpost?.subtype === id;
        if (!isInternship || !matchesCategory) {
          console.log('Filtered out job:', job._id, { isInternship, matchesCategory });
        }
        return isInternship && matchesCategory;
      })
      .map((job) => {
        let relativeTime = 'Just now';
        try {
          const parsedDate = new Date(job.createdAt);
          if (isNaN(parsedDate.getTime())) {
            throw new Error('Invalid date');
          }
          relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
            .replace('about ', '')
            .replace('hours', 'hrs')
            .replace('minutes', 'min');
        } catch (err) {
          console.error('Error parsing date for job', job._id, err);
        }

        const salaryValue = job.sectionData?.jobpost?.salary && !isNaN(parseFloat(job.sectionData.jobpost.salary))
          ? parseFloat(job.sectionData.jobpost.salary)
          : 0;

        return {
          id: job._id,
          role: job.sectionData?.jobpost?.title || 'Unknown Role',
          company: job.sectionData?.jobpost?.company || 'Unknown Company',
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || 'Unknown',
          salary: job.sectionData?.jobpost?.salary || 'Not specified',
          location: (job.sectionData?.jobpost?.location || 'Unknown').toUpperCase(),
          logo: job.sectionData?.jobpost?.logo && job.sectionData.jobpost.logo.startsWith('http')
            ? job.sectionData.jobpost.logo
            : '/assets/placeholder-logo.png',
          createdAt: job.createdAt,
          salaryValue,
        };
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'latest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'salary-desc':
            return b.salaryValue - a.salaryValue;
          case 'salary-asc':
            return a.salaryValue - b.salaryValue;
          case 'title-asc':
            return a.role.localeCompare(b.role);
          default:
            return 0;
        }
      });
  }, [internships, sortOption, id]);

  const totalPages = Math.ceil(filteredInternships.length / internshipsPerPage);
  const paginatedInternships = filteredInternships.slice(
    (currentPage - 1) * internshipsPerPage,
    currentPage * internshipsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = (internship) => {
    const slug = generateInternshipSlug(
      internship.role,
      internship.location,
      internship.company,
      internship.id
    );
    navigate(`/internshipdetail/${slug}`);
  };

  if (loading) return (
    <div className="px-4 md:px-12 py-8 bg-[#fafafa]">
      <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-4">
        Loading...
      </h2>
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="flex flex-col bg-white rounded-lg shadow-md p-4 animate-pulse"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 w-20 bg-gray-200 rounded-full" />
              <div className="h-6 w-6 bg-gray-200 rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1 flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-32 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (error) return <div className="px-4 md:px-12 py-8 bg-[#fafafa]">{error}</div>;
  if (filteredInternships.length === 0)
    return <div className="px-4 md:px-12 py-8 bg-[#fafafa]">No internships found for {categoryName || 'this category'}.</div>;

  return (
    <div className="px-4 md:px-12 py-8 bg-[#fafafa]">
      <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-4">
        {categoryName} Internships
      </h2>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-600">
          Showing {(currentPage - 1) * internshipsPerPage + 1} -{' '}
          {Math.min(currentPage * internshipsPerPage, filteredInternships.length)} of{' '}
          {filteredInternships.length} results
        </p>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="p-2 border text-sm rounded-lg"
        >
          <option value="latest">Sort by latest</option>
          <option value="salary-desc">Sort by salary (high to low)</option>
          <option value="salary-asc">Sort by salary (low to high)</option>
          <option value="title-asc">Sort by title (A-Z)</option>
        </select>
      </div>
      <div className="space-y-4">
        {paginatedInternships.map((internship) => (
          <div
            key={internship.id}
            className="flex flex-col bg-white rounded-lg shadow-md p-4 cursor-pointer"
            tabIndex={0}
            onClick={() => handleViewDetails(internship)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleViewDetails(internship);
              }
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {internship.time}
              </span>
              <BsBookmarkPlus className="h-6 w-6" aria-label="Bookmark Internship" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <img
                    src={internship.logo}
                    alt={`${internship.company} Logo`}
                    className="w-10 h-10 rounded-full object-contain"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-black">{internship.role}</h3>
                    <p className="text-sm text-gray-500">{internship.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center space-x-2 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
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
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {internship.type}
                  </span>
                  <span className="flex items-center">
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.657 0 3 .895 3 2s-1.343 2-3 2m0 0c-1.657 0-3 .895-3 2s1.343 2 3 2m-6 0V6m12 12V6"
                      />
                    </svg>
                    {internship.salary}
                  </span>
                  <span className="flex items-center">
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
                        strokeWidth="3"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M15 11a18 0"
                        stroke="none"
                      />
                    </svg>
                    {internship.location}
                  </span>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(internship);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700"
                >
                  Internship Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <span className="text-base">←</span>
              <span className="font-medium">Previous</span>
            </button>
          </div>
          <div className="flex gap-4 justify-center">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <span className="font-medium">Next</span>
              <span className="text-base">→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};