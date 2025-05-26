import { useState } from 'react';
import {
  FaMale,
  FaFemale,
  FaUser,
  FaCheckCircle,
  FaEdit,
  FaGraduationCap,
  FaBriefcase,
  FaCalendarAlt,
  FaUserGraduate,
  FaCrosshairs,
  FaSearch,
  FaTrophy,
  FaBullhorn,
  FaUsers,
} from 'react-icons/fa';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';

const userTypes = [
  { label: 'College Students', icon: <FaGraduationCap /> },
  { label: 'Professional', icon: <FaBriefcase /> },
  { label: 'School Student', icon: <FaCalendarAlt /> },
  { label: 'Fresher', icon: <FaUserGraduate /> },
];

const purposes = [
  { label: 'To find a Job', icon: <FaSearch /> },
  { label: 'Compete & Upskill', icon: <FaTrophy /> },
  { label: 'To Host an Event', icon: <FaBullhorn /> },
  { label: 'To be a Mentor', icon: <FaUsers /> },
];

function BasicDetails() {
  const [firstName, setFirstName] = useState('Yug');
  const [lastName, setLastName] = useState('Dalsaniya');
  const [email, setEmail] = useState('yugpatel231078@gmail.com');
  const [mobile, setMobile] = useState('9979737457');
  const [gender, setGender] = useState('Male');
  const [userType, setUserType] = useState('College Students');
  const [location, setLocation] = useState('');
  const [course, setCourse] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [college, setCollege] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [careerGoal, setCareerGoal] = useState('');

  const handleSave = () => {
    const data = {
      firstName,
      lastName,
      email,
      mobile,
      gender,
      userType,
      location,
      course,
      specialization,
      college,
      startYear,
      endYear,
      selectedPurpose,
      careerGoal,
    };
    console.log('Saved data:', data);
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          <FaCheckCircle className="text-green-500" />
          Basic Details
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-lg">
          <FaEye className="cursor-pointer hover:text-gray-800" />
          <FaRegLightbulb className="cursor-pointer hover:text-gray-800" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍🦱</span>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="text-sm font-medium">Username *</label>
          <input
            type="text"
            value="yugpatel0631"
            disabled
            className="w-full bg-gray-100 text-gray-500 border rounded-lg p-2 mt-1"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-sm font-medium flex items-center justify-between">
            Email *
            <button className="text-blue-600 text-sm flex items-center gap-1">
              <FaEdit size={14} />
              Update Email
            </button>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              className="w-full bg-gray-100 text-gray-500 border rounded-lg p-2 mt-1 pr-10"
            />
            <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
          </div>
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="text-sm font-medium">Mobile *</label>
          <div className="flex gap-2 mt-1">
            <select className="border rounded-lg p-2 bg-white">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 border rounded-lg p-2"
            />
            <button className="bg-blue-600 text-white px-4 rounded-lg text-sm">
              Verify
            </button>
          </div>
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="text-sm font-medium">Gender *</label>
          <div className="flex gap-2 mt-1">
            {['Male', 'Female', 'More Options'].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm ${
                  gender === g
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                {g === 'Male' && <FaMale />}
                {g === 'Female' && <FaFemale />}
                {g === 'More Options' && <FaUser />}
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* User Type */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-2">
            User Type <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {userTypes.map(({ label, icon }) => (
              <button
                key={label}
                className={`flex items-center gap-2 border rounded-full px-4 py-2 ${
                  userType === label
                    ? 'border-blue-600 text-blue-600 font-medium bg-blue-50'
                    : 'border-gray-300 text-gray-700'
                }`}
                onClick={() => setUserType(label)}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Course */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Course <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            <option value="B.Tech">B.Tech</option>
            <option value="M.Tech">M.Tech</option>
            <option value="MBA">MBA</option>
          </select>
        </div>

        {/* Specialization */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Course Specialization <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">Select Specialization</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Duration */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Start Year</label>
            <input
              type="text"
              placeholder="Start Year"
              className="w-full border rounded-lg p-2"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">End Year</label>
            <input
              type="text"
              placeholder="End Year"
              className="w-full border rounded-lg p-2"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value)}
            />
          </div>
        </div>

        {/* College */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1">
            Organisation/College <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border rounded-lg p-2"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          >
            <option value="">Select College</option>
            <option value="ABC University">ABC University</option>
            <option value="XYZ Institute">XYZ Institute</option>
          </select>
        </div>

        {/* Purpose */}
        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Purpose <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {purposes.map((p) => (
              <button
                key={p.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all ${
                  selectedPurpose === p.label
                    ? 'bg-blue-100 border-blue-500 text-blue-700 font-medium'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400'
                }`}
                onClick={() => setSelectedPurpose(p.label)}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Career Goal */}
        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Career Goal
          </label>
          <div className="flex flex-col border rounded-lg overflow-hidden">
            <label className="flex items-center px-4 py-3 border-b cursor-pointer">
              <input
                type="radio"
                name="career"
                className="mr-3"
                checked={careerGoal === 'current'}
                onChange={() => setCareerGoal('current')}
              />
              Grow in my current career
            </label>
            <label className="flex items-center px-4 py-3 cursor-pointer">
              <input
                type="radio"
                name="career"
                className="mr-3"
                checked={careerGoal === 'new'}
                onChange={() => setCareerGoal('new')}
              />
              Transition into a new career
            </label>
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 pr-10"
            />
            <FaCrosshairs className="absolute right-3 top-3 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <span className="text-lg">✓</span> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;