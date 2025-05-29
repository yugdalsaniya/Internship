import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Navbar/logo.png';

import { FaMale, FaFemale } from 'react-icons/fa';
import { MdTransgender, MdOutlineWc } from 'react-icons/md';
import { PiGenderIntersexBold } from 'react-icons/pi';
import { TbGenderBigender } from 'react-icons/tb';
import { BsEyeSlash } from 'react-icons/bs';

const genderOptions = [
  { label: 'Female', icon: <FaFemale size={30} /> },
  { label: 'Male', icon: <FaMale size={30} /> },
  { label: 'Transgender', icon: <MdTransgender size={30} /> },
  { label: 'Intersex', icon: <PiGenderIntersexBold size={30} /> },
  { label: 'Non-binary', icon: <TbGenderBigender size={30} /> },
  { label: 'Prefer not to say', icon: <BsEyeSlash size={30} /> },
  { label: 'Others', icon: <MdOutlineWc size={30} /> }
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

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
    alert('Form submitted successfully!');
    navigate('/post-internship');
  };

  const renderOptionButtons = (options, selected, onSelect, size = 'default') => {
    let widthClass = 'w-28';
    let heightClass = 'h-24';
    let paddingClass = 'px-2 py-2';
    if (size === 'small') {
      widthClass = 'w-28';
      heightClass = 'h-15';
      paddingClass = 'px-1.5 py-1.5';
    }

    return (
      <div className="flex gap-2 overflow-x-auto">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`flex flex-col items-center justify-center ${widthClass} ${heightClass} ${paddingClass} rounded-lg border text-sm font-medium transition-all
              ${selected === option
                ? 'bg-blue-50 text-blue-700 border-blue-500'
                : 'text-gray-800 bg-white border-gray-300 hover:bg-gray-100'
              }`}
          >
            <span className="text-lg">{option}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center mb-6">
          <img src={logo} alt="Logo" className="w-10 h-10 mr-2" />
          <div>
            <h1 className="text-2xl font-bold text-[#050748] tracking-wide">INTERNSHIP–OJT</h1>
            <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
            <p className="text-base text-black font-bold text-center">WORK24 PHILIPPINES</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#050748] mb-4 text-center">Candidate Details</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              placeholder="abc@gmail.com"
              className="w-full px-4 py-3 bg-gray-200 border rounded-lg text-base focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              disabled
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 bg-gray-200 border rounded-lg text-base focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="First Name"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Last Name (if applicable)
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Last Name"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: '#1C4980' }}>
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 overflow-x-auto">
              {genderOptions.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: label })}
                  className={`flex flex-col items-center justify-center w-28 h-24 px-2 py-2 rounded-lg border text-sm font-medium transition-all 
                    ${formData.gender === label
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'text-gray-800 bg-white border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  <div className="mb-2">{icon}</div>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Your College or Company Name"
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: '#1C4980' }}>
              Type <span className="text-red-500">*</span>
            </label>
            {renderOptionButtons(typeOptions, formData.type, (val) =>
              setFormData({ ...formData, type: val }), 'small')}
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: '#1C4980' }}>
              Passout Year <span className="text-red-500">*</span>
            </label>
            {renderOptionButtons(yearOptions, formData.passoutYear, (val) =>
              setFormData({ ...formData, passoutYear: val }), 'small')}
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Course
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none"
            >
              <option value="">Select Course</option>
              {courseOptions.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Course Specialization
            </label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none"
            >
              <option value="">Select Specialization</option>
              {specializationOptions.map((special) => (
                <option key={special} value={special}>{special}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Course Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 4 Year"
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-base font-medium mb-2" style={{ color: '#1C4980' }}>
              Differently Abled
            </label>
            {renderOptionButtons(differentlyAbledOptions, formData.differentlyAbled, (val) =>
              setFormData({ ...formData, differentlyAbled: val }), 'small')}
          </div>

          <div>
            <label className="block text-base font-medium" style={{ color: '#1C4980' }}>
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Select Location"
              className="w-full px-4 py-3 border rounded-lg text-base focus:outline-none"
              required
            />
          </div>

          <div className="flex items-start gap-2 mt-4">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
              className="mt-1"
            />
            <label htmlFor="consent" className="text-sm text-black">
              By registering for this opportunity, you agree to share the data mentioned in this
              form or any form henceforth on this opportunity with the recruiter of this
              opportunity for further analysis, processing, and outreach. Your data will also be
              used by Unstop for providing you regular and constant updates on this opportunity.
              You also agree to the <a href="#" className="text-blue-600 underline">privacy policy</a> and <a href="#" className="text-blue-600 underline">terms of use</a> of INTERNSHIP–OJT.
            </label>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-60 border border-gray-400 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Back
            </button>
            <button
              type="submit"
              className={`w-60 text-white py-2 rounded-md text-sm font-medium ${
                formData.consent ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
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
