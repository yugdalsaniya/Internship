import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import { formatDistanceToNow, parse } from 'date-fns';
import logo from '../../assets/Navbar/logo.png';
import backgroundImg from '../../assets/Hero/banner.jpg';

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const internshipsPerPage = 6;
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Redirect if not a company user
  if (user.role !== 'company') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'jobpost',
          query: { 'sectionData.jobpost.type': 'Internship', companyId: user.companyId },
          limit: 100,
          order: -1,
          sortedBy: 'createdDate',
        });
        setInternships(data);
      } catch (err) {
        setError('Error fetching internships');
        console.error('ManageInternships API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [user.companyId]);

  const formattedInternships = useMemo(() => {
    return internships
      .filter((job) => job.sectionData?.jobpost?.type === 'Internship')
      .map((job) => {
        let relativeTime = 'Just now';
        let parsedDate;
        try {
          parsedDate = parse(job.createdDate, 'dd/MM/yyyy, h:mm:ss a', new Date());
          relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
            .replace('about ', '')
            .replace('hours', 'hrs')
            .replace('minutes', 'min');
        } catch (err) {
          console.error('Error parsing date for job', job._id, err);
        }

        return {
          id: job._id,
          title: job.sectionData?.jobpost?.title || 'Unknown Role',
          company: job.sectionData?.jobpost?.company || 'Unknown Company',
          time: relativeTime,
          type: job.sectionData?.jobpost?.time || 'Unknown',
          salary: job.sectionData?.jobpost?.salary
            ? `${job.sectionData.jobpost.salary}`
            : 'Not specified',
          location: (job.sectionData?.jobpost?.location || 'Unknown').toUpperCase(),
          logo: job.sectionData?.jobpost?.logo || 'https://placehold.co/40x40',
          subtype: job.sectionData?.jobpost?.subtype || 'Unknown',
          experiencelevel: job.sectionData?.jobpost?.experiencelevel || 'Unknown',
          applicationdeadline: job.sectionData?.jobpost?.applicationdeadline || 'N/A',
          internshipduration: job.sectionData?.jobpost?.internshipduration || 'N/A',
          skillsrequired: job.sectionData?.jobpost?.skillsrequired || 'None',
          applicationinstructions: job.sectionData?.jobpost?.applicationinstructions || 'None',
          description: job.sectionData?.jobpost?.description || 'No description',
          createdDate: parsedDate,
        };
      })
      .sort((a, b) => b.createdDate - a.createdDate);
  }, [internships]);

  const totalPages = Math.ceil(formattedInternships.length / internshipsPerPage);
  const paginatedInternships = formattedInternships.slice(
    (currentPage - 1) * internshipsPerPage,
    currentPage * internshipsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4">{error}</div>;
  if (formattedInternships.length === 0)
    return (
      <div className="mx-12 py-4 text-center">
        No internships posted yet.{' '}
        <button
          onClick={() => navigate('/post-internship')}
          className="text-blue-600 underline"
        >
          Post an internship
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4">
         
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Manage Your Internships
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            View and manage all internships posted by your company.
          </p>
          <button
            onClick={() => navigate('/post-internship')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Post New Internship
          </button>
        </div>
      </div>

      {/* Internships List */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6">
            Your Posted Internships
          </h2>
          <div className="space-y-4">
            {paginatedInternships.map((internship) => (
              <div
                key={internship.id}
                className="flex flex-col bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {internship.time}
                  </span>
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
                        <h3 className="text-lg font-bold text-[#050748]">
                          {internship.title}
                        </h3>
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
                        {internship.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/internship/${internship.id}/candidates`)}
                      className="bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-green-600 hover:to-teal-700"
                    >
                      Candidates
                    </button>
                    <button
                      onClick={() => navigate(`/internshipdetail/${internship.id}`)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-4 justify-center w-full">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${
                    currentPage === index + 1
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'border border-gray-400 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="ml-auto">
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                <span className="font-semibold">Next</span>
                <span className="text-base">❯</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInternships;