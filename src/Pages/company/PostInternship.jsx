import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import { formatDistanceToNow, parse } from 'date-fns';
import logo from '../../assets/Navbar/logo.png';
import backgroundImg from '../../assets/Hero/banner.jpg';

const PostInternship = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not a company user
  if (user.role !== 'company') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchRecentInternships = async () => {
      try {
        const data = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'jobpost',
          query: { 'sectionData.jobpost.type': 'Internship', companyId: user.companyId }, // Use companyId
          limit: 100,
          order: -1,
          sortedBy: 'createdDate',
        });

        const formattedInternships = data
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
              company: job.sectionData?.jobpost?.company || user.legalname || 'Your Company',
              location: (job.sectionData?.jobpost?.location || 'Unknown').toUpperCase(),
              type: job.sectionData?.jobpost?.time || 'Unknown',
              salary: job.sectionData?.jobpost?.salary
                ? `${job.sectionData.jobpost.salary}`
                : 'Not specified',
              posted: relativeTime,
              logo: job.sectionData?.jobpost?.logo || 'https://placehold.co/40x40',
              createdDate: parsedDate,
            };
          })
          .sort((a, b) => b.createdDate - a.createdDate)
          .slice(0, 2);

        setRecentInternships(formattedInternships);
      } catch (err) {
        setError('Error fetching recent internships');
        console.error('PostInternship API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentInternships();
  }, [user.companyId, user.legalname]); // Update dependency to user.companyId

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96 flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(249, 220, 223, 0.8), rgba(181, 217, 211, 0.8)), url(${backgroundImg})`,
        }}
      >
        <div className="text-center px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Post an Internship
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            Connect with top talent and build your team with Inturnshp Philippines.
          </p>
          <button
            onClick={() => navigate('/post-internship/form')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Post Internship
          </button>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6 text-center">
            Why Post Internships with Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Access Top Talent',
                description: 'Reach thousands of motivated students eager to kickstart their careers.',
              },
              {
                title: 'Build Your Brand',
                description: 'Showcase your company to the next generation of professionals.',
              },
              {
                title: 'Flexible Hiring',
                description: 'Post internships tailored to your needs, from part-time to full-time.',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 text-center"
              >
                <h3 className="text-lg font-semibold text-[#050748] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Internships Section */}
      <div className="px-4 md:px-12 py-8 bg-gradient-to-b from-[#FFFCF2] to-[#FEEFF4]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6 text-center">
            Your Recent Internships
          </h2>
          {loading ? (
            <p className="text-center text-sm text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-sm text-gray-600">{error}</p>
          ) : recentInternships.length === 0 ? (
            <p className="text-center text-sm text-gray-600">
              No internships posted yet. Start by posting your first internship!
            </p>
          ) : (
            <div className="space-y-4">
              {recentInternships.map((internship) => (
                <div
                  key={internship.id}
                  className="flex flex-col bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {internship.posted}
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
                    <button
                      onClick={() => navigate(`/internshipdetail/${internship.id}`)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 md:px-12 py-8 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-4">
            Ready to Find More Talent?
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Explore our platform features or contact our support team to learn more
            about how Inturnshp Philippines can help your company grow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/features')}
              className="border border-gray-400 text-gray-700 text-sm font-medium py-2 px-6 rounded-full hover:bg-gray-100"
            >
              Explore Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInternship;