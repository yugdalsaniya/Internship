import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';

const PostInternshipForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    location: '',
    type: 'Full Time',
    salary: '',
    description: '',
    category: '',
    experienceLevel: '',
    deadline: '',
    skills: '',
    instructions: '',
    logo: null,
    duration: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

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

    if (!formData.title.trim()) return setError('Internship title is required.');
    if (!formData.name.trim()) return setError('Your name is required.');
    if (!formData.location.trim()) return setError('Preferred location is required.');
    if (!formData.description.trim()) return setError('About you section is required.');
    if (!formData.category) return setError('Category is required.');
    if (!formData.experienceLevel) return setError('Education level is required.');
    if (!formData.deadline) return setError('Deadline is required.');
    if (!formData.duration.trim()) return setError('Availability duration is required.');

    try {
      console.log('Student Internship Request:', formData);
      alert('Internship preference submitted successfully!');
      navigate('/post-internship');
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans flex items-center justify-center px-4 py-8">
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
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., ₱5,000/month"
            />
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
              <option value="Commerce">Commerce</option>
              <option value="Telecommunications">Telecommunications</option>
              <option value="Hotels & Tourism">Hotels & Tourism</option>
              <option value="Education">Education</option>
              <option value="Financial Services">Financial Services</option>
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
              <option value="No-experience">High School Graduate</option>
              <option value="Fresher">College Freshman</option>
              <option value="Intermediate">College Sophomore/Junior</option>
              <option value="Expert">College Senior</option>
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
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., JavaScript, Canva, Communication"
            />
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
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => navigate('/post-internship')}
              className="flex-1 border border-gray-400 text-gray-700 py-3 rounded-lg text-base font-bold hover:bg-gray-100"
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
