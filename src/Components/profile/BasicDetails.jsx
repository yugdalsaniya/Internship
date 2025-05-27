import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { FaEye, FaRegLightbulb } from "react-icons/fa6";

const userTypes = [
  { label: "College Students", icon: <FaGraduationCap /> },
  { label: "Professional", icon: <FaBriefcase /> },
  { label: "School Student", icon: <FaCalendarAlt /> },
  { label: "Fresher", icon: <FaUserGraduate /> },
];

const gradeOptions = [
  { label: "1" },
  { label: "2" },
  { label: "3" },
  { label: "4" },
  { label: "5" },
  { label: "6" },
  { label: "7" },
  { label: "8" },
  { label: "9" },
  { label: "10" },
  { label: "11" },
  { label: "12" },
];

const purposes = [
  { label: "To find a Job", icon: <FaSearch /> },
  { label: "Compete & Upskill", icon: <FaTrophy /> },
  { label: "To Host an Event", icon: <FaBullhorn /> },
  { label: "To be a Mentor", icon: <FaUsers /> },
];

const designationOptions = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Marketing Manager",
  "Other",
];

const workExperienceOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

function BasicDetails() {
  const [firstName, setFirstName] = useState("Yug");
  const [lastName, setLastName] = useState("Dalsaniya");
  const [email, setEmail] = useState("yugpatel231078@gmail.com");
  const [mobile, setMobile] = useState("9979737457");
  const [gender, setGender] = useState("Male");
  const [userType, setUserType] = useState("College Students");
  const [location, setLocation] = useState("");
  const [course, setCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [college, setCollege] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [designation, setDesignation] = useState("");
  const [workExperienceType, setWorkExperienceType] = useState("");
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [grade, setGrade] = useState("");
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    if (userType !== "Professional") {
      setDesignation("");
      setWorkExperienceType("");
      setIsCurrentlyWorking(false);
    }
    if (userType !== "School Student") {
      setGrade("");
      setSchoolName("");
    }
    if (userType !== "College Students") {
      setCourse("");
      setSpecialization("");
      setCollege("");
      setStartYear("");
      setEndYear("");
    }
  }, [userType]);

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
      ...(userType === "Professional" && {
        designation,
        workExperienceType,
        isCurrentlyWorking,
      }),
      ...(userType === "School Student" && {
        grade,
        schoolName,
      }),
    };
    console.log("Saved data:", data);
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
      <div className="p-4 sm:p-6 space-y-6">
        {/* Avatar and Name */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍🦱</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1 h-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1 h-10"
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
            className="w-full bg-gray-100 text-gray-500 border rounded-lg p-2 mt-1 h-10"
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
              className="w-full bg-gray-100 text-gray-500 border rounded-lg p-2 mt-1 pr-10 h-10"
            />
            <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
          </div>
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="text-sm font-medium">Mobile *</label>
          <div className="flex gap-1 sm:gap-2 mt-1 overflow-hidden">
            <select className="border rounded-lg p-2 bg-white w-16 sm:w-24 h-10 text-sm">
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 border rounded-lg p-2 h-10 min-w-0 text-sm"
            />
            <button
              className="bg-blue-600 text-white px-2 py-2 rounded-lg text-sm min-w-[70px] h-10 hover:bg-blue-700 transition touch-action-manipulation"
            >
              Verify
            </button>
          </div>
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label className="text-sm font-medium">Gender *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Male", "Female", "More Options"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm min-w-fit ${
                  gender === g
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-white border-gray-300 text-gray-700"
                } touch-action-manipulation`}
              >
                {g === "Male" && <FaMale />}
                {g === "Female" && <FaFemale />}
                {g === "More Options" && <FaUser />}
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
                className={`flex items-center gap-2 border rounded-full px-4 py-2 min-w-fit ${
                  userType === label
                    ? "border-blue-600 text-blue-600 font-medium bg-blue-50"
                    : "border-gray-300 text-gray-700"
                } touch-action-manipulation`}
                onClick={() => setUserType(label)}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional Fields based on User Type */}
        {userType === "Professional" ? (
          <>
            {/* Designation */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2 h-10"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Select Designation</option>
                {designationOptions.map((designation) => (
                  <option key={designation} value={designation}>
                    {designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Experience */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Work Experience <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2 h-10"
                value={workExperienceType}
                onChange={(e) => setWorkExperienceType(e.target.value)}
              >
                <option value="">Select Work Experience Type</option>
                {workExperienceOptions.map((experience) => (
                  <option key={experience} value={experience}>
                    {experience}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isCurrentlyWorking}
                    onChange={(e) => setIsCurrentlyWorking(e.target.checked)}
                    className="mr-2"
                  />
                  Currently working in this role
                </label>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Start Year
                </label>
                <input
                  type="text"
                  placeholder="Start Year"
                  className="w-full border rounded-lg p-2 h-10"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  End Year
                </label>
                <input
                  type="text"
                  placeholder="End Year"
                  className="w-full border rounded-lg p-2 h-10"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={isCurrentlyWorking}
                />
              </div>
            </div>
          </>
        ) : userType === "School Student" ? (
          <>
            {/* Grade/Class */}
            <div className="mb-4">
              <label className="block font-medium mb-2 text-sm text-gray-700">
                Class <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {gradeOptions.map((g) => (
                  <button
                    key={g.label}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm min-w-[60px] text-center justify-center ${
                      grade === g.label
                        ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                        : "border-gray-300 text-gray-600 hover:border-blue-400"
                    } touch-action-manipulation`}
                    onClick={() => setGrade(g.label)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* School Name */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full border rounded-lg p-2 h-10"
                placeholder="Enter your school name"
              />
            </div>
          </>
        ) : (
          <>
            {/* Course (College Students and Fresher) */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg p-2 h-10"
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
                className="w-full border rounded-lg p-2 h-10"
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
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Start Year
                </label>
                <input
                  type="text"
                  placeholder="Start Year"
                  className="w-full border rounded-lg p-2 h-10"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  End Year
                </label>
                <input
                  type="text"
                  placeholder="End Year"
                  className="w-full border rounded-lg p-2 h-10"
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
                className="w-full border rounded-lg p-2 h-10"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              >
                <option value="">Select College</option>
                <option value="ABC University">ABC University</option>
                <option value="XYZ Institute">XYZ Institute</option>
              </select>
            </div>
          </>
        )}

        {/* Purpose */}
        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Purpose <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {purposes.map((p) => (
              <button
                key={p.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm min-w-fit ${
                  selectedPurpose === p.label
                    ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                } touch-action-manipulation`}
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
                checked={careerGoal === "current"}
                onChange={() => setCareerGoal("current")}
              />
              Grow in my current career
            </label>
            <label className="flex items-center px-4 py-3 cursor-pointer">
              <input
                type="radio"
                name="career"
                className="mr-3"
                checked={careerGoal === "new"}
                onChange={() => setCareerGoal("new")}
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
              className="w-full border rounded-lg px-4 py-2 pr-10 h-10"
            />
            <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition touch-action-manipulation"
          >
            <span className="text-lg">✓</span> Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;