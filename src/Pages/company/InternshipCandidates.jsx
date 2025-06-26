import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchSectionData } from '../../Utils/api';
import logo from '../../assets/Navbar/logo.png';
import backgroundImg from '../../assets/Hero/banner.jpg';

const InternshipCandidates = () => {
  const { id } = useParams(); // jobId
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseMap, setCourseMap] = useState({});
  const [filters, setFilters] = useState({ status: 'All' });
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Redirect if not a company user
  if (user.role !== 'company') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
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
        const map = courses.reduce((acc, course) => ({ ...acc, [course.id]: course.name }), {});
        setCourseMap(map);

        // Fetch applications
        const applications = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'applications',
          query: { jobId: id },
          projection: { userId: 1, resume: 1, _id: 1 },
        });

        if (applications.length === 0) {
          setCandidates([]);
          setLoading(false);
          return;
        }

        // Fetch user details
        const userIds = applications.map((app) => app.userId).filter(Boolean);
        const users = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'appuser',
          query: { _id: { $in: userIds } },
          projection: { sectionData: 1 },
        });

        const userMap = users.reduce((map, user) => {
          map[user._id] = user.sectionData.appuser;
          return map;
        }, {});

        // Load statuses from localStorage
        const storedStatuses = JSON.parse(localStorage.getItem('applicationStatuses') || '{}');

        // Format candidates
        const formattedCandidates = applications.map((app) => ({
          id: app._id,
          userId: app.userId,
          name: userMap[app.userId]?.legalname || 'Unknown',
          email: userMap[app.userId]?.email || 'N/A',
          mobile: userMap[app.userId]?.mobile || 'N/A',
          course: map[userMap[app.userId]?.course] || userMap[app.userId]?.course || 'N/A',
          specialization: userMap[app.userId]?.coursespecialization || 'N/A',
          resume: app.resume || userMap[app.userId]?.resume || '',
          status: storedStatuses[app._id]?.status || 'Applied',
          feedback: storedStatuses[app._id]?.feedback || '',
        }));

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

  const updateStatus = (applicationId, newStatus, feedback = '') => {
    try {
      // Update local state
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidate.id === applicationId
            ? { ...candidate, status: newStatus, feedback }
            : candidate
        )
      );

      // Update localStorage
      const storedStatuses = JSON.parse(localStorage.getItem('applicationStatuses') || '{}');
      storedStatuses[applicationId] = { status: newStatus, feedback };
      localStorage.setItem('applicationStatuses', JSON.stringify(storedStatuses));
    } catch (err) {
      console.error('Status Update Error:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  const filteredCandidates = candidates.filter((candidate) =>
    filters.status === 'All' ? true : candidate.status === filters.status
  );

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
          <div className="flex items-center mb-3">
                      <img
                        src={logo}
                        alt="Internship-OJT Logo"
                        className="h-16 w-auto mr-2"
                      />
                    </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#050748] mb-2">
            Internship Candidates
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-md mx-auto mb-6">
            Manage candidates who applied for this internship.
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
          <div className="mb-6">
            <label className="text-sm font-medium mr-2">Filter by Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="p-2 border rounded-md"
            >
              <option value="All">All</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Interview">Interview</option>
            </select>
          </div>
          {filteredCandidates.length === 0 ? (
            <p className="text-center text-gray-600">No candidates match the selected filter.</p>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
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
                        <span className="font-medium">Specialization:</span> {candidate.specialization}
                      </p>
                      {candidate.resume && (
                        <a
                          href={candidate.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium py-1 px-3 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          View Resume
                        </a>
                      )}
                      {candidate.feedback && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Feedback:</span> {candidate.feedback}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <select
                        value={candidate.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          const feedback = newStatus === 'Rejected' ? prompt('Enter rejection feedback (optional):') || '' : '';
                          updateStatus(candidate.id, newStatus, feedback);
                        }}
                        className="p-2 border rounded-md"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Interview">Interview</option>
                      </select>
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

export default InternshipCandidates;