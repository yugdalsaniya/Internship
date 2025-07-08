import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSectionData, addGeneralData, uploadAndStoreFile } from '../../Utils/api';
import logo from '../../assets/Navbar/logo.png';

const PostInternshipForm = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isStudent = user.role === 'student' && user.userid;
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [location, setLocation] = useState('');
  const [existingResumeUrl, setExistingResumeUrl] = useState('');
  const [useExistingResume, setUseExistingResume] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    name: isStudent ? user.legalname || user.email : '',
    location: '',
    type: 'Full Time',
    salary: '',
    description: '',
    category: '',
    experienceLevel: '',
    deadline: '',
    selectedSkills: [],
    instructions: '',
    logo: null,
    duration: '',
    currentSkill: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Fetch existing resume and about from appuser collection
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!isStudent) return;
        const response = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: user.userid },
          projection: { 'sectionData.appuser.resume': 1, 'sectionData.appuser.about': 1 },
        });

        const userData = response[0];
        const resume = userData?.sectionData?.appuser?.resume || '';
        const about = userData?.sectionData?.appuser?.about || '';
        setExistingResumeUrl(resume);
        setFormData((prev) => ({ ...prev, description: about }));
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again.');
        setTimeout(() => setError(''), 5000);
      }
    };

    if (isStudent) {
      fetchUserData();
    }
  }, [isStudent, user.userid]);

  // Google Maps Autocomplete
  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }

        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Maps API'));
        document.head.appendChild(script);
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          console.error('Google Maps places library not loaded');
          return;
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ['(cities)'],
            fields: ['formatted_address', 'name'],
            componentRestrictions: { country: 'ph' },
          }
        );

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          const newLocation = place.formatted_address || place.name || '';
          setLocation(newLocation);
          setFormData((prev) => ({ ...prev, location: newLocation }));
        });
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err);
        setError('Google Maps API failed to load. Location suggestions unavailable.');
        setTimeout(() => setError(''), 5000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  // Fetch categories and skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryResponse = await fetchSectionData({
          collectionName: 'category',
          query: {},
          projection: { 'sectionData.category.titleofinternship': 1, '_id': 1 },
          limit: 0,
          skip: 0,
          order: -1,
          sortedBy: 'createdAt',
        });

        if (categoryResponse && Array.isArray(categoryResponse)) {
          const categoryData = categoryResponse
            .filter((item) => item.sectionData?.category?.titleofinternship && item._id)
            .map((item) => ({
              id: item._id,
              title: item.sectionData.category.titleofinternship,
            }));
          setCategories(categoryData);
        } else {
          throw new Error('Invalid category response format');
        }

        const skillsResponse = await fetchSectionData({
          collectionName: 'skills',
          query: {},
          projection: { 'sectionData.skills.name': 1, '_id': 1 },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: 'sectionData.skills.name',
        });

        if (skillsResponse && Array.isArray(skillsResponse)) {
          const skillsData = skillsResponse
            .filter((item) => item.sectionData?.skills?.name && item._id)
            .map((item) => ({
              value: item._id,
              label: item.sectionData.skills.name,
            }));
          setSkills(skillsData);
        } else {
          throw new Error('Invalid skills response format');
        }
      } catch (err) {
        console.error('Data Fetch Error:', err.message);
        setError('Failed to load industries or skills. Please try again.');
        setCategories([
          { id: 'default-commerce', title: 'Commerce' },
          { id: 'default-telecom', title: 'Telecommunications' },
          { id: 'default-tourism', title: 'Hotels & Tourism' },
          { id: 'default-education', title: 'Education' },
          { id: 'default-financial', title: 'Financial Services' },
        ]);
        setSkills([
          { value: 'default-dl', label: 'Deep Learning' },
          { value: 'default-sec', label: 'Securities' },
          { value: 'default-math', label: 'Mathematical Proficiency' },
          { value: 'default-tone', label: 'Tone of Voice' },
          { value: 'default-crm', label: 'CRM Proficiency' },
        ]);
      }
    };

    if (isStudent) {
      fetchData();
    }
  }, [isStudent]);

  // Redirect non-students
  useEffect(() => {
    if (!isStudent) {
      setError('Only students can submit internship preferences.');
      navigate('/');
    }
  }, [isStudent, navigate]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === 'salary') {
      if (/^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'location') {
      setLocation(value);
      setFormData({ ...formData, [name]: value });
    } else if (name === 'useExistingResume') {
      setUseExistingResume(checked);
      if (checked) {
        setFormData({ ...formData, logo: null });
      }
    } else {
      setFormData({ ...formData, [name]: files ? files[0] : value });
    }
  };

  const handleSkillChange = (selectedOptions) => {
    const selectedSkillIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    setFormData({ ...formData, selectedSkills: selectedSkillIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isStudent) {
      setError('Only students can submit internship preferences.');
      setLoading(false);
      return;
    }
    if (!formData.title.trim()) {
      setError('Internship title is required.');
      setLoading(false);
      return;
    }
    if (!formData.name.trim()) {
      setError('Your name is required.');
      setLoading(false);
      return;
    }
    if (!formData.location.trim()) {
      setError('Preferred location is required.');
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('About you section is required.');
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError('Category is required.');
      setLoading(false);
      return;
    }
    if (!formData.experienceLevel) {
      setError('Education level is required.');
      setLoading(false);
      return;
    }
    if (!formData.deadline) {
      setError('Start date is required.');
      setLoading(false);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (formData.deadline < today) {
      setError('Start date cannot be in the past.');
      setLoading(false);
      return;
    }
    if (!formData.duration) {
      setError('Availability duration is required.');
      setLoading(false);
      return;
    }
    if (!useExistingResume && formData.logo) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(formData.logo.type)) {
        setError('Resume must be a PDF, DOC, or DOCX file.');
        setLoading(false);
        return;
      }
      if (formData.logo.size > 5 * 1024 * 1024) {
        setError('Resume file size must be less than 5MB.');
        setLoading(false);
        return;
      }
    }

    try {
      let resumeUrl = useExistingResume ? existingResumeUrl : '';
      if (!useExistingResume && formData.logo) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'application',
          file: formData.logo,
          userId: user.userid,
        });
        resumeUrl = uploadResponse.filePath || '';
        if (!resumeUrl) {
          setError('Failed to upload resume. Please try again.');
          setLoading(false);
          return;
        }
      }

      const payload = {
        dbName: 'internph',
        collectionName: 'application',
        data: {
          sectionData: {
            application: {
              desiredinternshiptitle: formData.title.trim(),
              preferredlocation: formData.location.trim(),
              internshiptype: formData.type,
              expectedstipend: formData.salary.trim() ? `${formData.salary.trim()}/month` : '',
              industry: formData.category,
              currenteducationlevel: formData.experienceLevel,
              startdate: formData.deadline,
              availabilityduration: formData.duration,
              skills: formData.selectedSkills,
              additionalnotes: formData.instructions.trim(),
              uploadresume: resumeUrl,
              aboutyou: formData.description.trim(),
              student: user.userid,
            },
          },
          createdBy: user.userid,
          createdAt: new Date().toISOString(),
        },
      };

      const response = await addGeneralData(payload);
      if (response.success) {
        toast.success('Submitted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
        });
        setTimeout(() => navigate('/requested-internships'), 3000);
      } else {
        setError(response.message || 'Failed to submit internship preference.');
        toast.error(response.message || 'Failed to submit internship preference.', {
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
      const errorMessage = err.message || 'Failed to submit. Please try again.';
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

  const getSkillName = (skillId) => {
    const skill = skills.find((s) => s.value === skillId);
    return skill ? skill.label : 'Unknown';
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
          
          <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
            Student Internship Form
          </h2>
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {loading && <p className="text-blue-500 text-sm mb-4 text-center">Loading...</p>}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Desired Internship Title <span className="text-red-500">*</span>
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
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Juan Dela Cruz"
                  required
                  disabled={isStudent}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={handleChange}
                  ref={locationInputRef}
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
                  name="type"
                  value={formData.type}
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
                  Expected Stipend (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5000"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 text-sm">
                    /month
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Industry</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Current Education Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Level</option>
                  <option value="Senior High School (Grade 11/12)">Senior High School (Grade 11/12)</option>
                  <option value="Freshman (1st Year College)">Freshman (1st Year College)</option>
                  <option value="Sophomore (2nd Year College)">Sophomore (2nd Year College)</option>
                  <option value="Junior (3rd Year College)">Junior (3rd Year College)</option>
                  <option value="Senior (4th Year College)">Senior (4th Year College)</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Availability Duration <span className="text-red-500">*</span>
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Duration</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Skills (Optional)
                </label>
                <Select
                  isMulti
                  options={skills}
                  value={skills.filter((skill) => formData.selectedSkills.includes(skill.value))}
                  onChange={handleSkillChange}
                  className="w-full text-sm"
                  placeholder="Search and select skills..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      padding: '2px',
                      borderRadius: '0.5rem',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected ? '#3b82f6' : isFocused ? '#e5e7eb' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      cursor: 'pointer',
                    }),
                  }}
                />
                {formData.selectedSkills.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.selectedSkills.map((skillId) => (
                      <div
                        key={skillId}
                        className="flex items-center bg-gray-100 px-2 py-1 rounded-full text-sm text-gray-700"
                      >
                        {getSkillName(skillId)}
                        <button
                          type="button"
                          onClick={() =>
                            handleSkillChange(
                              skills.filter(
                                (s) => formData.selectedSkills.includes(s.value) && s.value !== skillId
                              )
                            )
                          }
                          className="ml-1 text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="e.g., Available for remote only..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Resume (Optional)
                </label>
                {existingResumeUrl && (
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="useExistingResume"
                      checked={useExistingResume}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                      id="useExistingResume"
                    />
                    <label htmlFor="useExistingResume" className="text-sm text-gray-700">
                      Use my previously uploaded resume
                    </label>
                  </div>
                )}
                {!useExistingResume && (
                  <div>
                    <label
                      htmlFor="resume-upload"
                      className="flex flex-col items-center justify-center border border-dashed border-gray-400 bg-gray-50 p-4 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-all"
                    >
                      <span className="text-blue-600 font-medium text-sm">Click to Upload file</span>
                      <span className="text-xs text-gray-500">
                        Maximum file size is 5 MB{' '}
                        <span className="text-red-500">(File type: pdf, doc, docx)</span>
                      </span>
                      <input
                        id="resume-upload"
                        type="file"
                        name="logo"
                        accept=".pdf,.doc,.docx"
                        onChange={handleChange}
                        className="hidden"
                      />
                    </label>
                    {formData.logo && (
                      <p className="mt-2 text-sm text-gray-600">Selected: {formData.logo.name}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  About You <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Tell us about your goals, background, and why you want an internship..."
                  required
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
                disabled={!isStudent || loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/internship')}
                className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
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

export default PostInternshipForm;