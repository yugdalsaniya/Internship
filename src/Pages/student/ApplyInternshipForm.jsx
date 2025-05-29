import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Navbar/logo.png';

import { FaMale, FaFemale } from 'react-icons/fa';
import { MdTransgender, MdOutlineWc } from 'react-icons/md';
import { PiGenderIntersexBold } from 'react-icons/pi';
import { TbGenderBigender } from 'react-icons/tb';
import { BsEyeSlash } from 'react-icons/bs';

const genderOptions = [
  { label: 'Female', icon: <FaFemale size={20} /> },
  { label: 'Male', icon: <FaMale size={20} /> },
  { label: 'Transgender', icon: <MdTransgender size={20} /> },
  { label: 'Intersex', icon: <PiGenderIntersexBold size={20} /> },
  { label: 'Non-binary', icon: <TbGenderBigender size={20} /> },
  { label: 'Prefer not to say', icon: <BsEyeSlash size={20} /> },
  { label: 'Others', icon: <MdOutlineWc size={20} /> }
];

const typeOptions = ['College Students', 'Professional', 'Others', 'Fresher'];
const yearOptions = ['2020', '2021', '2022', '2023', '2024'];
const differentlyAbledOptions = ['No', 'Yes'];

const courseOptions = ['B.Tech', 'B.Sc', 'BCA', 'MBA', 'M.Tech'];
const specializationOptions = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Technology'];

const PostInternshipForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    gender: '',
    organization: '',
    type: '',
    passoutYear: '',
    course: '',
    specialization: '',
    duration: '',
    differentlyAbled: '',
    location: '',
    consent: false
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required.');
      return;
    }
    if (!formData.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!formData.gender) {
      setError('Gender is required.');
      return;
    }
    if (!formData.organization.trim()) {
      setError('Organization name is required.');
      return;
    }
    if (!formData.type) {
      setError('Type is required.');
      return;
    }
    if (!formData.passoutYear) {
      setError('Passout year is required.');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!formData.consent) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    console.log('Form Submitted:', formData);
    alert('Form submitted successfully!');
    navigate('/post-internship');
  };

  const renderOptionButtons = (options, selected, onSelect, name) => {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const label = typeof option === 'object' ? option.label : option;
          const icon = typeof option === 'object' ? option.icon : null;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={`flex items-center justify-center px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                selected === label
                  ? 'bg-blue-50 text-blue-700 border-blue-500'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-100'
              }`}
            >
              {icon && <span className="mr-2">{icon}</span>}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Candidate Details
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                placeholder="abc@gmail.com"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                disabled
                placeholder="+91 9876543210"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="First Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name (if applicable)
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Last Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              {renderOptionButtons(genderOptions, formData.gender, (val) => 
                setFormData({ ...formData, gender: val }), 'gender')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your College or Company Name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>
              {renderOptionButtons(typeOptions, formData.type, (val) => 
                setFormData({ ...formData, type: val }), 'type')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Passout Year <span className="text-red-500">*</span>
              </label>
              {renderOptionButtons(yearOptions, formData.passoutYear, (val) => 
                setFormData({ ...formData, passoutYear: val }), 'passoutYear')}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                {courseOptions.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course Specialization
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Specialization</option>
                {specializationOptions.map((special) => (
                  <option key={special} value={special}>{special}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Course Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4 Year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Differently Abled
              </label>
              {renderOptionButtons(differentlyAbledOptions, formData.differentlyAbled, (val) => 
                setFormData({ ...formData, differentlyAbled: val }), 'differentlyAbled')}
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
                placeholder="Select Location"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent"
                checked={formData.consent}
                onChange={handleChange}
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 mt-1"
                name="consent"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                By registering for this opportunity, you agree to share the data mentioned in this
                form or any form henceforth on this opportunity with the recruiter of this
                opportunity for further analysis, processing, and outreach. Your data will also be
                used for providing you regular and constant updates on this opportunity.
                You also agree to the <a href="#" className="text-blue-500 hover:underline">privacy policy</a> and <a href="#" className="text-blue-500 hover:underline">terms of use</a> of INTERNSHIP–OJT.
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 border border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-100"
            >
              Back
            </button>
            <button
              type="submit"
              className={`flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all ${!formData.consent ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!formData.consent}
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostInternshipForm;