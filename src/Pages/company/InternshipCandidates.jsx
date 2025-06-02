import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import logo from '../../assets/Navbar/logo.png';
import backgroundImg from '../../assets/Hero/banner.jpg';

const InternshipCandidates = () => {
  const { id } = useParams(); // Get internship ID from URL
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseMap, setCourseMap] = useState({});
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Redirect if not a company user
  if (user.role !== 'company') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data for mapping
        const courseResponse = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'course',
          query: {},
          projection: { sectionData: 1, _id: 1 },
        });

        const courses = courseResponse.map((item) => ({
          id: item._id,
          name: item.sectionData.course.name,
        }));

        const map = {};
        courses.forEach((course) => {
          map[course.id] = course.name;
        });
        setCourseMap(map);

        // Fetch applications
        console.log('Fetching applications for jobId:', id);
        const applications = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'applications',
          query: { jobId: id },
          projection: { userId: 1 },
        });
        console.log('Applications found:', applications);

        if (applications.length === 0) {
          console.log('No applications found for jobId:', id);
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Extract userIds
        const userIds = applications.map((app) => app.userId).filter(Boolean);
        console.log('User IDs:', userIds);

        if (userIds.length === 0) {
          console.log('No valid userIds found');
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Fetch user details
        const users = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'appuser',
          query: { _id: { $in: userIds } },
          projection: { sectionData: 1 },
        });
        console.log('Users found:', users);

        // Format candidates
        const formattedCandidates = users.map((user) => {
          const userData = user.sectionData.appuser;
          return {
            id: user._id,
            name: userData.legalname || 'Unknown',
            email: userData.email || 'N/A',
            mobile: userData.mobile || 'N/A',
            course: map[userData.course] || userData.course || 'N/A',
            specialization: userData.coursespecialization || 'N/A',
            resume: userData.resume || null,
          };
        });

        setCandidates(formattedCandidates);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) return <div className="mx-12 py-4">Loading...</div>;
  if (error) return <div className="mx-12 py-4 text-red-600">{error}</div>;

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
          <div className="flex justify-center items-center mb-4">
            <img src={logo} alt="Logo" className="w-10 h-10 mr-2" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#050748] tracking-wide">
                INTERNSHIP–OJT
              </h1>
              <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
              <p className="text-sm text-black font-bold">WORK24 PHILIPPINES</p>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Internship Candidates
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            View all candidates who applied for this internship.
          </p>
          <button
            onClick={() => navigate('/manage-internships')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm md:text-base font-medium py-2 px-6 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Back to Internships
          </button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="px-4 md:px-12 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[#050748] mb-6">
            Applied Candidates
          </h2>
          {candidates.length === 0 ? (
            <p className="text-center text-gray-600">No candidates have applied yet.</p>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-[#050748]">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {candidate.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Mobile:</span> {candidate.mobile}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Course:</span> {candidate.course}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Specialization:</span>{' '}
                    {candidate.specialization}
                  </p>
                  {candidate.resume && (
                    <p className="text-sm">
                      <a
                        href={candidate.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternshipCandidates;