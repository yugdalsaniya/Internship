import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSectionData, addGeneralData, uploadAndStoreFile } from '../../Utils/api';
import logo from '../../assets/Navbar/logo.png';

const PostInternshipForm = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isStudent = user.role === 'student' && user.userid;
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    name: isStudent ? user.legalname || user.email : '',
    location: '',
    type: 'Full Time',
    salary: '', // Only numeric value
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
            .filter(item => item.sectionData?.category?.titleofinternship && item._id)
            .map(item => ({
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
            .filter(item => item.sectionData?.skills?.name && item._id)
            .map(item => ({
              id: item._id,
              name: item.sectionData.skills.name,
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
          { id: 'default-dl', name: 'Deep Learning' },
          { id: 'default-sec', name: 'Securities' },
          { id: 'default-math', name: 'Mathematical Proficiency' },
          { id: 'default-tone', name: 'Tone of Voice' },
          { id: 'default-crm', name: 'CRM Proficiency' },
        ]);
      }
    };

    if (isStudent) {
      fetchData();
    }
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent) {
      setError('Only students can submit internship preferences.');
      navigate('/');
    }
  }, [isStudent, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'salary') {
      // Allow only numeric input
      if (/^\d*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: files ? files[0] : value,
      });
    }
  };

  const handleAddSkill = () => {
    if (formData.currentSkill && !formData.selectedSkills.includes(formData.currentSkill)) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, formData.currentSkill],
        currentSkill: '',
      });
    }
  };

  const handleRemoveSkill = (skillId) => {
    setFormData({
      ...formData,
      selectedSkills: formData.selectedSkills.filter(id => id !== skillId),
    });
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
      setError('Deadline is required.');
      setLoading(false);
      return;
    }
    if (!formData.duration.trim()) {
      setError('Availability duration is required.');
      setLoading(false);
      return;
    }
    if (formData.logo) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
      let resumeUrl = '';
      if (formData.logo) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'application',
          file: formData.logo,
          userId: user.userid,
        });
        console.log('Upload Response:', uploadResponse);
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
              expectedstipend: formData.salary.trim() ? `${formData.salary.trim()}/month` : '', // Append /month
              industry: formData.category,
              currenteducationlevel: formData.experienceLevel,
              startdate: formData.deadline,
              availabilityduration: formData.duration.trim(),
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

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      const response = await addGeneralData(payload);
      if (response.success) {
        alert('Internship preference submitted successfully!');
        navigate('/requested-internships');
      } else {
        setError(response.message || 'Failed to submit internship preference.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit. Please try again.';
      setError(errorMessage);
      console.error('Submission Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillName = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center mb-6">
          <img src={logo} alt="Logo" className="w-10 h-10 mr-2" />
          <div>
            <h1 className="text-2xl font-bold text-[#050748] tracking-wide">INTERNSHIP–OJT</h1>
            <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
            <p className="text-base text-black font-bold text-center">WORK24 PHILIPPINES</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[#050748] mb-4 text-center">
          Student Internship Form
        </h2>
        {error && <p className="text-red-500 text-base mb-4 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Desired Internship Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineering Intern"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Juan Dela Cruz"
              required
              disabled={isStudent}
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Preferred Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manila, Philippines"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Internship Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-base font-medium text-gray-700">
              Expected Stipend (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-20 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5000"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                /month
              </span>
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Industry <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-base font-medium text-gray-700">
              Current Education Level <span className="text-red-500">*</span>
            </label>
            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-base font-medium text-gray-700">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Availability Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3 months"
              required
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Skills (Optional)
            </label>
            <div className="flex items-center gap-2">
              <select
                name="currentSkill"
                value={formData.currentSkill}
                onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-base hover:bg-blue-600"
                disabled={!formData.currentSkill}
              >
                Add
              </button>
            </div>
            {formData.selectedSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.selectedSkills.map((skillId) => (
                  <div
                    key={skillId}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {getSkillName(skillId)}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skillId)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Additional Notes (Optional)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="e.g., Available for remote only..."
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              Upload Resume (Optional)
            </label>
            <input
              type="file"
              name="logo"
              accept=".pdf,.doc,.docx"
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700">
              About You <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="5"
              placeholder="Tell us about your goals, background, and why you want an internship..."
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg text-base font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
              disabled={!isStudent || loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-internship')}
              className="flex-1 border border-gray-400 text-gray-700 py-3 rounded-lg text-base font-bold hover:bg-gray-100"
              disabled={loading}
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