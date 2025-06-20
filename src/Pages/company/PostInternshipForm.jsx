import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addGeneralData, uploadAndStoreFile, fetchSectionData, mUpdate } from '../../Utils/api';
import logo from '../../assets/Navbar/logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PostInternshipForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    time: 'Full Time',
    salary: '',
    description: '',
    subtype: '', // Stores category _id
    experiencelevel: '',
    applicationdeadline: '',
    internshipduration: '',
    skillsrequired: '',
    applicationinstructions: '',
    logo: null,
    keyResponsibilities: [],
    professionalSkills: [],
    degree: [],
  });
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const degreeOptions = [
    'B.Tech',
    'B.Sc',
    'B.Com',
    'BBA',
    'MBA',
    'M.Tech',
    'M.Sc',
    'Ph.D',
  ];

  const experienceLevelOptions = [
    'No-experience',
    'Fresher',
    'Intermediate',
    'Expert',
  ];

  useEffect(() => {
    if (user.role !== 'company' || !user.companyId) {
      navigate('/login');
    }
  }, [user.role, user.companyId, navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const response = await fetchSectionData({
          collectionName: 'category',
          query: {},
          projection: {
            '_id': 1,
            'sectionData.category.titleofinternship': 1,
          },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: 'sectionData.category.titleofinternship',
        });

        if (Array.isArray(response) && response.length > 0) {
          setCategoryData(
            response
              .map((item) => ({
                _id: item._id,
                titleofinternship: item.sectionData.category.titleofinternship,
              }))
              .sort((a, b) => a.titleofinternship.localeCompare(b.titleofinternship))
          );
        } else {
          toast.error('No categories found in the database.', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
          });
          setCategoryData([]);
        }
      } catch (err) {
        console.error('Category Fetch Error:', err);
        toast.error('Failed to fetch categories. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
        setCategoryData([]);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    console.log(`Input Change: ${name} = ${value}`); // Debug log
    if (name === 'degree') {
      let updatedDegrees = [...formData.degree];
      if (checked) {
        updatedDegrees.push(value);
      } else {
        updatedDegrees = updatedDegrees.filter((deg) => deg !== value);
      }
      setFormData({
        ...formData,
        degree: updatedDegrees,
      });
    } else {
      setFormData({
        ...formData,
        [name]: files ? files[0] : value,
      });
    }
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData({
        ...formData,
        keyResponsibilities: [...formData.keyResponsibilities, { text: newResponsibility.trim() }],
      });
      setNewResponsibility('');
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        professionalSkills: [...formData.professionalSkills, { text: newSkill.trim() }],
      });
      setNewSkill('');
    }
  };

  const removeResponsibility = (index) => {
    setFormData({
      ...formData,
      keyResponsibilities: formData.keyResponsibilities.filter((_, i) => i !== index),
    });
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      professionalSkills: formData.professionalSkills.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Form Data on Submit:', formData); // Debug log

    // Validation
    if (!user.companyId) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Company ID is missing. Please log in again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      navigate('/login');
      return;
    }
    if (!formData.title.trim()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Internship title is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.company.trim()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Company name is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Location is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Description is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Category is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    // Validate subtype (category _id)
    const isValidSubtype = categoryData.some(
      (category) => category._id === formData.subtype
    );
    if (!isValidSubtype) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Invalid category selected. Please choose a valid category.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.experiencelevel) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Experience level is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    // Validate experience level
    if (!experienceLevelOptions.includes(formData.experiencelevel)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Invalid experience level selected.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.applicationdeadline) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Application deadline is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (!formData.internshipduration.trim()) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('Internship duration is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (formData.keyResponsibilities.length === 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('At least one key responsibility is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (formData.professionalSkills.length === 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('At least one professional skill is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }
    if (formData.degree.length === 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error('At least one degree is required.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      setLoading(false);
      return;
    }

    try {
      let logoUrl = '';
      if (formData.logo) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'jobpost',
          file: formData.logo,
          userId: user.companyId,
        });
        console.log('Full Upload Response:', uploadResponse);
        logoUrl = uploadResponse?.filePath;
        if (!logoUrl) {
          throw new Error('Failed to retrieve logo URL from upload response.');
        }
        console.log('Logo URL:', logoUrl);
      }

      console.log('Category Data:', categoryData);
      console.log('Selected Subtype (Category ID):', formData.subtype);
      console.log('Selected Experience Level:', formData.experiencelevel);

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
            keyResponsibilities: formData.keyResponsibilities,
            professionalSkills: formData.professionalSkills,
            degree: formData.degree,
          },
        },
        createdBy: user.companyId,
        companyId: user.companyId,
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
      console.log('Job Post Data:', jobpostData);
      const response = await addGeneralData({
        dbName: 'internph',
        collectionName: 'jobpost',
        data: jobpostData,
      });
      console.log('Add General Data Response:', response);

      if (response.success) {
        // Update the numberofinternships in the category collection
        try {
          // Fetch the current category document
          const categoryResponse = await fetchSectionData({
            collectionName: 'category',
            query: {
              '_id': formData.subtype,
            },
            projection: { 'sectionData.category.numberofinternships': 1 },
            limit: 1,
          });

          if (categoryResponse.length === 0) {
            throw new Error(`Category with ID '${formData.subtype}' not found in the database.`);
          }

          const currentCount = parseInt(categoryResponse[0].sectionData.category.numberofinternships, 10) || 0;
          const newCount = currentCount + 1;

          // Update the category with the new count
          await mUpdate({
            appName: 'app8657281202648',
            collectionName: 'category',
            query: {
              '_id': formData.subtype,
            },
            update: {
              $set: { 'sectionData.category.numberofinternships': newCount.toString() },
            },
            options: {
              upsert: false,
            },
          });
          console.log(`Updated numberofinternships for category ID '${formData.subtype}' to ${newCount}`);
        } catch (updateError) {
          console.error('Error updating numberofinternships:', updateError);
          toast.error('Internship posted, but failed to update category count.', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: 'light',
          });
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
        toast.success('Internship posted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          onClose: () => navigate('/'),
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        toast.error(response.message || 'Failed to post internship.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
      }
    } catch (err) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error(err.message || 'Failed to post internship. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      console.error('Post Internship Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== 'company' || !user.companyId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Post Internship Form
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="e.g., Inturnshp Philippines"
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
                className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="e.g., ₱10,000/month"
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
                disabled={categoryLoading || categoryData.length === 0}
              >
                <option value="" disabled>
                  {categoryLoading ? 'Loading categories...' : categoryData.length === 0 ? 'No categories available' : 'Select Category'}
                </option>
                {categoryData.map((category, index) => (
                  <option key={index} value={category._id}>
                    {category.titleofinternship.charAt(0).toUpperCase() + category.titleofinternship.slice(1).toLowerCase()}
                  </option>
                ))}
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
                <option value="" disabled>
                  Select Experience Level
                </option>
                {experienceLevelOptions.map((level, index) => (
                  <option key={index} value={level}>
                    {level.replace('-', ' ').charAt(0).toUpperCase() + level.replace('-', ' ').slice(1).toLowerCase()}
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
                Degrees <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {degreeOptions.map((degree) => (
                  <label key={degree} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="degree"
                      value={degree}
                      checked={formData.degree.includes(degree)}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{degree}</span>
                  </label>
                ))}
              </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Responsibilities <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Conduct user research..."
              />
              <button
                type="button"
                onClick={addResponsibility}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            {formData.keyResponsibilities.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                {formData.keyResponsibilities.map((responsibility, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {responsibility.text}
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Professional Skills <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Proficient in Figma..."
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            {formData.professionalSkills.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                {formData.professionalSkills.map((skill, index) => (
                  <li key={index} className="flex justify-between items-center">
                    {skill.text}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                rows="3"
                placeholder="e.g., Submit a resume and cover letter via email..."
              />
            </div>
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
              rows="4"
              placeholder="Describe the internship role, responsibilities, and requirements..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || categoryLoading || categoryData.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Internship'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-internship')}
              className="flex-1 border border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-100"
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