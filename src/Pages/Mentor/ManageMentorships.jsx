import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/Navbar/logo.png';

const ManageMentorships = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not a mentor user
  useEffect(() => {
    if (user.role !== 'mentor') {
      navigate('/');
    }
  }, [user.role, navigate]);

  // Fetch all mentorship programs
  const fetchAllMentorships = async () => {
    try {
      const data = await fetchSectionData({
        dbName: 'internph',
        collectionName: 'mentorship',
        query: { createdBy: user.userid },
        projection: { sectionData: 1, createdBy: 1, createdDate: 1 },
        limit: 0, // No limit to fetch all records
        order: -1,
        sortedBy: 'createdDate',
      });

      if (data && Array.isArray(data)) {
        const formattedMentorships = data
          .map((post) => {
            let relativeTime = 'Just now';
            let parsedDate;
            try {
              parsedDate = parseISO(post.createdDate);
              relativeTime = formatDistanceToNow(parsedDate, { addSuffix: true })
                .replace('about ', '')
                .replace('hours', 'hrs')
                .replace('minutes', 'min');
            } catch (err) {
              console.error('Error parsing date for post', post._id, err);
            }

            const mentorshipData = post.sectionData?.mentorship || {};
            return {
              id: post._id,
              title: mentorshipData.title || 'Unknown Program',
              mentor: mentorshipData.mentor_name || user.legalname || 'Unknown Mentor',
              focusArea: mentorshipData.focus_area || 'Not specified',
              sessionDetails: mentorshipData.session_details || 'Not specified',
              duration: mentorshipData.duration ? `${mentorshipData.duration} months` : 'Not specified',
              deadline: mentorshipData.deadline ? new Date(mentorshipData.deadline).toLocaleDateString() : 'Not specified',
              location: mentorshipData.location || 'Online',
              posted: relativeTime,
              createdDate: parsedDate,
            };
          })
          .sort((a, b) => b.createdDate - a.createdDate);

        setMentorships(formattedMentorships);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      setError('Error fetching mentorship programs');
      console.error('ManageMentorships API Error:', err);
      toast.error('Error fetching mentorship programs', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch mentorships on mount
  useEffect(() => {
    if (user.userid) {
      fetchAllMentorships();
    }
  }, [user.userid]);

  if (user.role !== 'mentor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#050748]">
              All Your Mentorship Programs
            </h1>
            <button
              onClick={() => navigate('/mentorship-programs')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Back to Mentorships
            </button>
          </div>
          {loading ? (
            <p className="text-center text-base text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-base text-red-500">{error}</p>
          ) : mentorships.length === 0 ? (
            <p className="text-center text-base text-gray-600">
              No mentorship programs posted yet. Start by posting your first program!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentorships.map((mentorship) => (
                <div
                  key={mentorship.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl max-w-sm mx-auto"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2"></div>
                  <div className="p-6 relative">
                    <button
                      onClick={() => navigate(`/post-mentorship-form/${mentorship.id}`)}
                      className="absolute top-4 right-4 text-gray-600 hover:text-blue-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <div className="flex items-center mb-4">
                      <img
                        src={logo}
                        alt="Mentorship Logo"
                        className="w-10 h-10 rounded-full object-contain border border-gray-200 mr-3"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-[#050748] truncate">{mentorship.title}</h3>
                        <p className="text-sm text-gray-500">by {mentorship.mentor}</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span><strong>Focus:</strong> {mentorship.focusArea}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span><strong>Deadline:</strong> {mentorship.deadline}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
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
                        <span><strong>Duration:</strong> {mentorship.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
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
                        <span><strong>Location:</strong> {mentorship.location}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        <span><strong>Sessions:</strong> {mentorship.sessionDetails}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center gap-5">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                        Posted {mentorship.posted}
                      </span>
                      <button
                        onClick={() => navigate(`/mentorship-candidates/${mentorship.id}`)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-2 px-4 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
                      >
                        Candidates
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMentorships;