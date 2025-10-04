import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { addGeneralData, fetchSectionData, mUpdate } from '../../Utils/api';

const PostMentorshipForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [formData, setFormData] = useState({
    title: '',
    mentorName: user.legalname || 'Not available',
    email: user.email || 'Not available',
    focusArea: '',
    description: '',
    applicationDeadline: '',
    mentorshipDuration: '',
    sessionDetails: '',
    location: 'Online (Platform)', // Static field for online mentorship
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const focusAreaOptions = [
    { value: 'software', label: 'Software Development' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'design', label: 'Design' },
  ];

  const sessionDetailsOptions = [
    { value: 'weekly-1hr', label: 'Weekly, 1-hour sessions' },
    { value: 'biweekly-1hr', label: 'Biweekly, 1-hour sessions' },
    { value: 'weekly-2hr', label: 'Weekly, 2-hour sessions' },
    { value: 'biweekly-2hr', label: 'Biweekly, 2-hour sessions' },
    { value: 'flexible', label: 'Flexible, to be agreed with mentee' },
  ];

  // Validate user data on mount
  useEffect(() => {
    if (!user.userid || user.role !== 'mentor') {
      setError('Please log in as a mentor to access this form.');
      console.error('Invalid user data in localStorage', { user });
      navigate('/signin');
    } else {
      setFormData((prev) => ({
        ...prev,
        mentorName: user.legalname || 'Not available',
        email: user.email || 'Not available',
      }));
      setError('');
    }
  }, [user.userid, user.role, user.legalname, user.email, navigate]);

  // Fetch mentorship data if in edit mode
  useEffect(() => {
    const fetchMentorshipData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'mentorship',
          query: { _id: id, createdBy: user.userid },
          projection: { sectionData: 1, createdBy: 1 },
        });

        if (data && data.length > 0) {
          const mentorship = data[0].sectionData.mentorship;
          setFormData({
            title: mentorship.title || '',
            mentorName: mentorship.mentor_name || user.legalname || 'Not available',
            email: mentorship.email || user.email || 'Not available',
            focusArea: mentorship.focus_area || '',
            description: mentorship.description || '',
            applicationDeadline: mentorship.deadline ? mentorship.deadline.split('T')[0] : '',
            mentorshipDuration: mentorship.duration ? String(mentorship.duration) : '',
            sessionDetails: mentorship.session_details || '',
            location: mentorship.location || 'Online (Platform)',
          });
        } else {
          setError('Mentorship program not found or you do not have permission to edit it.');
          toast.error('Mentorship program not found.', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
          });
        }
      } catch (err) {
        setError('Failed to load mentorship data. Please try again.');
        console.error('Fetch Mentorship Error:', err);
        toast.error('Failed to load mentorship data.', {
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

    if (id && user.userid) {
      fetchMentorshipData();
    }
  }, [id, user.userid, user.legalname, user.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user.userid || user.role !== 'mentor') {
      setError('Cannot submit without valid mentor login. Please log in.');
      setLoading(false);
      navigate('/signin');
      return;
    }

    // Validate form fields
    if (!formData.title.trim()) {
      setError('Program title is required.');
      setLoading(false);
      return;
    }
    if (!formData.focusArea) {
      setError('Focus area is required.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required.');
      setLoading(false);
      return;
    }
    if (!formData.applicationDeadline) {
      setError('Application deadline is required.');
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.applicationDeadline < today) {
      setError('Application deadline cannot be in the past.');
      setLoading(false);
      return;
    }
    if (!formData.mentorshipDuration.trim() || !/^\d+$/.test(formData.mentorshipDuration)) {
      setError('Mentorship duration must be a valid number of months.');
      setLoading(false);
      return;
    }
    if (!formData.sessionDetails) {
      setError('Session details are required.');
      setLoading(false);
      return;
    }

    // Format data for backend
    const mentorshipData = {
      title: formData.title.trim(),
      mentor_name: formData.mentorName.trim(),
      email: formData.email.trim(),
      focus_area: formData.focusArea,
      deadline: new Date(formData.applicationDeadline).toISOString(), // Convert to ISO date
      duration: parseInt(formData.mentorshipDuration, 10), // Convert to number
      session_details: formData.sessionDetails,
      description: formData.description.trim(),
      location: formData.location,
    };

    // Log payload for debugging

    try {
      let response;
      if (isEdit) {
        // Update existing mentorship (using structure from EditInternship.jsx reference)
        const payload = {
          appName: 'app8657281202648', // Matched from working EditInternship mUpdate call
          collectionName: 'mentorship',
          query: { _id: id, createdBy: user.userid },
          update: {
            $set: {
              'sectionData.mentorship': mentorshipData,
              editedAt: new Date().toISOString(),
            },
          },
          options: { upsert: false }, // Added from reference
        };
        response = await mUpdate(payload);
      } else {
        // Add new mentorship (keeping original as it likely works for create)
        const payload = {
          dbName: 'internph',
          collectionName: 'mentorship',
          data: {
            sectionData: {
              mentorship: mentorshipData,
            },
            createdBy: user.userid,
            createdDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            editedAt: new Date().toISOString(),
          },
        };
        response = await addGeneralData(payload);
      }

      if (response.success) {
        toast.success(`Mentorship program ${isEdit ? 'updated' : 'submitted'} successfully!`, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
        setTimeout(() => navigate('/manage-mentorship'), 3000);
      } else {
        setError(response.message || `Failed to ${isEdit ? 'update' : 'submit'} mentorship program.`);
        toast.error(response.message || `Failed to ${isEdit ? 'update' : 'submit'} mentorship program.`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      }
    } catch (err) {
      const errorMessage = err.message || `Failed to ${isEdit ? 'update' : 'submit'}. Please try again.`;
      setError(errorMessage);
      console.error('Submission Error:', err);
      toast.error(errorMessage, {
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

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
            {isEdit ? 'Edit Mentorship Program' : 'Post Mentorship Program'}
          </h2>
          {error && (
            <div className="text-center text-sm text-red-500 mb-4">
              {error} <Link to="/signin" className="underline text-blue-500 hover:text-blue-700">Log in here</Link>.
            </div>
          )}
          {loading && <p className="text-blue-500 text-sm mb-4 text-center">{isEdit ? 'Loading mentorship data...' : 'Submitting...'}</p>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Program Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Career Development Mentorship"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mentor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mentorName"
                  value={formData.mentorName}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                  disabled
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                  disabled
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Focus Area <span className="text-red-500">*</span>
                </label>
                <select
                  name="focusArea"
                  value={formData.focusArea}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Focus Area
                  </option>
                  {focusAreaOptions.map((area) => (
                    <option key={area.value} value={area.value}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mentorship Duration (Months) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="mentorshipDuration"
                    value={formData.mentorshipDuration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    / months
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Details <span className="text-red-500">*</span>
                </label>
                <select
                  name="sessionDetails"
                  value={formData.sessionDetails}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select Session Frequency and Duration
                  </option>
                  {sessionDetailsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Describe the mentorship program..."
                  required
                />
              </div>
              <input
                type="hidden"
                name="location"
                value={formData.location}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!user.userid || user.role !== 'mentor' || loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : isEdit ? 'Update Mentorship Program' : 'Submit Mentorship Program'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/manage-mentorship')}
                className="flex-1 border border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PostMentorshipForm;