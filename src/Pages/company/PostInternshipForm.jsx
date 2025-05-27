import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';
import { addGeneralData, uploadAndStoreFile } from '../../Utils/api';

const PostInternshipForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    time: 'Full Time',
    salary: '',
    description: '',
    subtype: '',
    experiencelevel: '',
    applicationdeadline: '',
    internshipduration: '',
    skillsrequired: '',
    applicationinstructions: '',
    logo: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Redirect if not a company user
  useEffect(() => {
    if (user.role !== 'company') {
      navigate('/');
    }
  }, [user.role, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      setError('Internship title is required.');
      setLoading(false);
      return;
    }
    if (!formData.company.trim()) {
      setError('Company name is required.');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required.');
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      setError('Category is required.');
      setLoading(false);
      return;
    }
    if (!formData.experiencelevel) {
      setError('Experience level is required.');
      setLoading(false);
      return;
    }
    if (!formData.applicationdeadline) {
      setError('Application deadline is required.');
      setLoading(false);
      return;
    }
    if (!formData.internshipduration.trim()) {
      setError('Internship duration is required.');
      setLoading(false);
      return;
    }

    try {
      // Handle logo upload
      let logoUrl = '';
      if (formData.logo) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'jobpost',
          file: formData.logo,
          userId: user.roleId,
        });
        console.log('Full Upload Response:', uploadResponse); // Debug log
        logoUrl = uploadResponse?.filePath;
        if (!logoUrl) {
          throw new Error('Failed to retrieve logo URL from upload response.');
        }
        console.log('Logo URL:', logoUrl);
      }

      // Prepare jobpost data
      const jobpostData = {
        sectionData: {
          jobpost: {
            title: formData.title,
            company: formData.company,
            type: 'Internship',
            time: formData.time,
            location: formData.location,
            salary: formData.salary || 'Not specified',
            subtype: formData.subtype,
            experiencelevel: formData.experiencelevel,
            applicationdeadline: formData.applicationdeadline,
            internshipduration: formData.internshipduration,
            skillsrequired: formData.skillsrequired || '',
            applicationinstructions: formData.applicationinstructions || '',
            description: formData.description,
            logo: logoUrl || undefined,
          },
        },
        createdBy: user.roleId,
        companyId: user.roleId, // Adjust if companyId is different
        createdDate: new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      };

      // Call addGeneralData API
      const response = await addGeneralData({
        dbName: 'internph',
        collectionName: 'jobpost',
        data: jobpostData,
      });

      if (response.success) {
        alert('Internship posted successfully!');
        navigate('/manage-internships');
      } else {
        setError(response.message || 'Failed to post internship.');
      }
    } catch (err) {
      setError(err.message || 'Failed to post internship. Please try again.');
      console.error('Post Internship Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render only if user is a company
  if (user.role !== 'company') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center mb-6">
          <img src={logo} alt="Logo" className="w-10 h-10 mr-2" />
          <div>
            <h1 className="text-2xl font-bold text-[#050748] tracking-wide">
              INTERNSHIP–OJT
            </h1>
            <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
            <p className="text-sm text-black font-bold text-center">WORK24 PHILIPPINES</p>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Post Internship Form
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Internship Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineering Intern"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., WORK24 Philippines"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manila, Philippines"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Internship Type <span className="text-red-500">*</span>
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Freelance">Freelance</option>
              <option value="Seasonal">Seasonal</option>
              <option value="Fixed-Price">Fixed-Price</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Salary (Optional)
            </label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ₹10,000/month"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="subtype"
              value={formData.subtype}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Category</option>
              <option value="Commerce">Commerce</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Hotels & Tourism">Hotels & Tourism</option>
              <option value="Education">Education</option>
              <option value="Financial Services">Financial Services</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <select
              name="experiencelevel"
              value={formData.experiencelevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Experience Level</option>
              <option value="No-experience">No Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="applicationdeadline"
              value={formData.applicationdeadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Internship Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="internshipduration"
              value={formData.internshipduration}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3 months"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Skills Required (Optional)
            </label>
            <input
              type="text"
              name="skillsrequired"
              value={formData.skillsrequired}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JavaScript, Python, Communication"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Instructions (Optional)
            </label>
            <textarea
              name="applicationinstructions"
              value={formData.applicationinstructions}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="e.g., Submit a resume and cover letter via email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Company Logo (Optional)
            </label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              placeholder="Describe the internship role, responsibilities, and requirements..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Internship'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-internship')}
              className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternshipForm;