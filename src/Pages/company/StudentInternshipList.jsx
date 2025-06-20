import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData, addGeneralData } from '../../Utils/api';
import { formatDistanceToNow, format } from 'date-fns';
import { FaBriefcase } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentInternshipList = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isCompany = user.role === 'company' && user.userid;

  useEffect(() => {
    const fetchInternships = async () => {
      if (!isCompany) {
        setError('Only companies can view student internship preferences.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch student internship applications
        const internshipData = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'application',
          query: {},
          projection: {
            'sectionData.application': 1,
            createdAt: 1,
            _id: 1,
            createdBy: 1,
          },
        });

        // Fetch skills to map skill IDs to names
        const skillsResponse = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'skills',
          query: {},
          projection: { 'sectionData.skills.name': 1, '_id': 1 },
        });

        const skillsMap = skillsResponse.reduce((map, skill) => {
          map[skill._id] = skill.sectionData.skills.name;
          return map;
        }, {});

        // Load shortlist statuses from localStorage
        const storedStatuses = JSON.parse(localStorage.getItem('shortlistStatuses') || '{}');

        // Format internship data
        const formattedInternships = internshipData.map((internship) => {
          const app = internship.sectionData.application;
          return {
            id: internship._id,
            title: app.desiredinternshiptitle || 'Unknown Role',
            location: app.preferredlocation || 'Not specified',
            type: app.internshiptype || 'Not specified',
            stipend: app.expectedstipend || 'Not specified',
            industry: app.industry || 'Not specified',
            educationLevel: app.currenteducationlevel || 'Not specified',
            startDate: app.startdate
              ? format(new Date(app.startdate), 'MMM dd, yyyy')
              : 'Not specified',
            duration: app.availabilityduration || 'Not specified',
            skills: Array.isArray(app.skills)
              ? app.skills.map((skillId) => skillsMap[skillId] || 'Unknown').join(', ')
              : 'None',
            about: app.aboutyou || 'No description provided',
            resume: app.uploadresume || '',
            postedAt: internship.createdAt
              ? formatDistanceToNow(new Date(internship.createdAt), { addSuffix: true })
                  .replace('about ', '')
                  .replace('hours', 'hrs')
                  .replace('minutes', 'min')
              : 'Just now',
            registeredOn: internship.createdAt
              ? format(new Date(internship.createdAt), 'MMM dd, yyyy, hh:mm a')
              : 'Unknown',
            studentId: internship.createdBy,
            status: storedStatuses[internship._id]?.status || 'Pending',
            feedback: storedStatuses[internship._id]?.feedback || '',
          };
        });

        setInternships(formattedInternships);
      } catch (err) {
        setError('Failed to fetch internship preferences. Please try again.');
        console.error('StudentInternshipList API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [isCompany]);

  const handleShortlist = async (internshipId, studentId) => {
    if (!isCompany) {
      toast.error('Only companies can shortlist candidates.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return;
    }

    try {
      // Update localStorage
      const storedStatuses = JSON.parse(localStorage.getItem('shortlistStatuses') || '{}');
      storedStatuses[internshipId] = { status: 'Shortlisted', feedback: '' };
      localStorage.setItem('shortlistStatuses', JSON.stringify(storedStatuses));

      // Update state
      setInternships((prev) =>
        prev.map((internship) =>
          internship.id === internshipId
            ? { ...internship, status: 'Shortlisted', feedback: '' }
            : internship
        )
      );

      // Optionally, save shortlist status to backend
      await addGeneralData({
        dbName: 'internph',
        collectionName: 'shortlist',
        data: {
          sectionData: {
            shortlist: {
              internshipId,
              studentId,
              companyId: user.userid,
              status: 'Shortlisted',
              createdAt: new Date().toISOString(),
            },
          },
          createdBy: user.userid,
          createdAt: new Date().toISOString(),
        },
      });

      toast.success('Candidate shortlisted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Shortlist Error:', err);
      toast.error('Failed to shortlist candidate. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isCompany) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-500">Only companies can view student internship preferences.</p>
      </div>
    );
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-10">Loading...</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-10">{error}</div>;

  return (
    <>
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Student Internship Preferences</h1>
        {internships.length === 0 ? (
          <p className="text-gray-600">No student internship preferences found.</p>
        ) : (
          <div className="space-y-4">
            {internships.map((internship) => (
              <div
                key={internship.id}
                className="border p-4 rounded-lg shadow-sm flex justify-between items-center bg-white"
              >
                <div className="flex flex-col justify-between w-full pr-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{internship.postedAt}</div>
                    <h4 className="font-semibold text-lg">{internship.title}</h4>
                    <div className="text-gray-500 text-sm">{internship.location}</div>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <FaBriefcase /> Type: {internship.type}
                      </div>
                      <div>Stipend: {internship.stipend}</div>
                      <div>Industry: {internship.industry}</div>
                      <div>Education: {internship.educationLevel}</div>
                      <div>Start Date: {internship.startDate}</div>
                      <div>Duration: {internship.duration}</div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Skills: {internship.skills}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      About: {internship.about.slice(0, 100)}
                      {internship.about.length > 100 && '...'}
                    </div>
                    {internship.resume && (
                      <div className="text-sm text-blue-500 mt-1">
                        <a href={internship.resume} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      Posted On: {internship.registeredOn}
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(internship.status)}`}>
                      Status: {internship.status}
                    </span>
                    {internship.feedback && (
                      <div className="text-sm text-gray-500 mt-1">
                        Feedback: {internship.feedback}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShortlist(internship.id, internship.studentId)}
                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-md whitespace-nowrap"
                    disabled={internship.status === 'Shortlisted'}
                  >
                    {internship.status === 'Shortlisted' ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentInternshipList;