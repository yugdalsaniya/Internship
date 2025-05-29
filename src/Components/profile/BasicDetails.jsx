import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Select from "react-select";
import { fetchSectionData, mUpdate } from "../../Utils/api";

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

const streamOptions = [
  { value: "", label: "Select Stream" },
  { value: "Science", label: "Science" },
  { value: "Commerce", label: "Commerce" },
  { value: "Arts", label: "Arts" },
];

const purposes = [
  { label: "To Find a job", icon: <FaSearch /> },
  { label: "Compete & Upskill", icon: <FaTrophy /> },
  { label: "To Host an Event", icon: <FaBullhorn /> },
  { label: "To be a Mentor", icon: <FaUsers /> },
];

const workExperienceOptions = ["1 year", "2 year", "3 year", "4 year"];

function BasicDetails() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("yahuvarmora@gmail.com");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [userType, setUserType] = useState("");
  const [location, setLocation] = useState("");
  const [course, setCourse] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [college, setCollege] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState([]); // Changed to array for multi-select
  const [careerGoal, setCareerGoal] = useState("");
  const [designation, setDesignation] = useState("");
  const [workExperienceType, setWorkExperienceType] = useState("");
  const [isCurrentlyWorking, setIsCurrentlyWorking] = useState(false);
  const [grade, setGrade] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [stream, setStream] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCareerRole, setNewCareerRole] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const designationData = await fetchSectionData({
          dbName: "internph",
          collectionName: "designation",
          query: {},
        });
        const designations = designationData.map((item) => ({
          _id: item._id,
          name: item.sectionData.designation.name,
        }));
        setDesignationOptions(designations);

        const courseData = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: {},
        });
        const courses = courseData.map((item) => ({
          _id: item._id,
          name: item.sectionData.course.name,
        }));
        setCourseOptions(courses);

        const roleData = await fetchSectionData({
          dbName: "internph",
          collectionName: "role",
          query: {},
        });
        const roles = roleData.map((item) => ({
          _id: item._id,
          name: item.sectionData.role.name.trim(),
        }));
        setRoleOptions(roles);
      } catch (err) {
        setError("Failed to load dropdown options. Please try again.");
        setTimeout(() => setError(""), 5000);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (userType !== "Professional") {
      setDesignation("");
      setWorkExperienceType("");
      setIsCurrentlyWorking(false);
    }
    if (userType !== "School Student") {
      setGrade("");
      setSchoolName("");
      setStream("");
    }
    if (userType !== "College Students") {
      setCourse("");
      setSpecialization("");
      setCollege("");
      setStartYear("");
      setEndYear("");
    }
    if (careerGoal !== "new") {
      setNewCareerRole([]);
    }
  }, [userType, careerGoal]);

  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !gender ||
      !userType ||
      !location ||
      !selectedPurpose.length // Updated to check array length
    ) {
      return "Please fill all required fields.";
    }
    if (
      userType === "Professional" &&
      (!designation ||
        !workExperienceType ||
        !startYear ||
        (!isCurrentlyWorking && !endYear))
    ) {
      return "Please fill all required professional fields.";
    }
    if (userType === "School Student" && (!grade || !schoolName)) {
      return "Please fill all required school student fields.";
    }
    if (
      userType === "School Student" &&
      (grade === "11" || grade === "12") &&
      !stream
    ) {
      return "Please select a stream for grade 11 or 12.";
    }
    if (
      (userType === "College Students" || userType === "Fresher") &&
      (!course || !specialization || !college || !startYear || !endYear)
    ) {
      return "Please fill all required college/fresher fields.";
    }
    if (careerGoal === "new" && newCareerRole.length === 0) {
      return "Please select at least one role for your new career.";
    }
    return "";
  };

  const handlePurposeToggle = (purpose) => {
    if (selectedPurpose.includes(purpose)) {
      // If purpose is already selected, remove it
      setSelectedPurpose(selectedPurpose.filter((p) => p !== purpose));
    } else {
      // If purpose is not selected, add it
      setSelectedPurpose([...selectedPurpose, purpose]);
    }
  };

  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setTimeout(() => setError(""), 5000);
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (!userString) {
        setError("Please log in to save your details.");
        setTimeout(() => setError(""), 2000);
        return;
      }

      let userId;
      try {
        const user = JSON.parse(userString);
        userId = user.userid;
      } catch (parseError) {
        setError("Invalid user data. Please log in again.");
        setTimeout(() => setError(""), 2000);
        return;
      }

      if (!userId || !token) {
        setError("Authentication token missing. Please log in again.");
        setTimeout(() => setError(""), 2000);
        return;
      }

      const existingUser = await fetchSectionData({
        dbName: "internph",
        collectionName: "appuser",
        query: { _id: userId },
      });

      if (
        !existingUser ||
        (Array.isArray(existingUser) && existingUser.length === 0)
      ) {
        setError(
          "User not found in database. Please sign up or contact support."
        );
        setTimeout(() => {
          setError("");
          navigate("/signup");
        }, 2000);
        return;
      }

      let creatorName = `${firstName} ${lastName}`.trim();
      const storedUser = JSON.parse(userString) || {};
      if (!storedUser.fname) {
        try {
          const userData = Array.isArray(existingUser)
            ? existingUser.find((item) => item._id === userId)?.sectionData
                ?.appuser || {}
            : existingUser.sectionData?.appuser || {};
          creatorName = `${userData.fname || firstName} ${userData.lname || lastName}`.trim();
        } catch (fetchError) {
          console.warn(
            "Failed to fetch user data for creatorName:",
            fetchError
          );
        }
      }

      const updateData = {
        $set: {
          "sectionData.appuser.name": email,
          "sectionData.appuser.legalname": creatorName,
          "sectionData.appuser.email": email,
          "sectionData.appuser.mobile": mobile,
          "sectionData.appuser.Gender": gender,
          "sectionData.appuser.usertype": userType,
          "sectionData.appuser.location": location,
          "sectionData.appuser.purpose": selectedPurpose, // Already an array
          "sectionData.appuser.growinmycurrentcareer": careerGoal === "current",
          "sectionData.appuser.transitioninnewcareer": careerGoal === "new",
          "sectionData.appuser.companyname": "",
          "sectionData.appuser.academyname": "",
          "sectionData.appuser.role": "",
          "sectionData.appuser.role1": newCareerRole,
          "sectionData.appuser.teammember": "",
          "sectionData.appuser.stream": userType === "School Student" ? stream : "",
          ...(userType === "Professional" && {
            "sectionData.appuser.designation": designation,
            "sectionData.appuser.workexperience": workExperienceType,
            "sectionData.appuser.currentlyworkinginthisrole": isCurrentlyWorking,
            "sectionData.appuser.startyear": startYear,
            "sectionData.appuser.endyear": isCurrentlyWorking ? "" : endYear,
          }),
          ...(userType === "School Student" && {
            "sectionData.appuser.class": grade,
            "sectionData.appuser.organisationcollege": schoolName,
          }),
          ...(userType === "College Students" || userType === "Fresher"
            ? {
                "sectionData.appuser.course": course,
                "sectionData.appuser.coursespecialization": specialization,
                "sectionData.appuser.organisationcollege": college,
                "sectionData.appuser.startyear": startYear,
                "sectionData.appuser.endyear": endYear,
              }
            : {}),
          editedAt: new Date().toISOString(),
        },
      };

      
      const updateResponse = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: updateData,
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (updateResponse && updateResponse.success) {
        setSuccess("Details updated successfully!");
        setTimeout(() => {
          setSuccess("");
          navigate("/");
        }, 2000);
      } else {
        throw new Error("Failed to update details in database.");
      }
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        setTimeout(() => navigate("/login"), 2000);
      }
      setError(errorMessage || "Failed to update details. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      minHeight: "2.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#dbeafe"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "#1e40af" : "#374151",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#dbeafe",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#1e40af",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#1e40af",
      "&:hover": {
        backgroundColor: "#bfdbfe",
        color: "#1e3a8a",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
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

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="w-24 h-24 bg-orange-400 rounded-full flex items-center justify-center">
            <span className="text-4xl">👨‍🦱</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div>
              <label className="text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value="yugpatel0631"
            disabled
            className="w-full bg-gray-100 text-gray-500 border border-gray-300 rounded-lg p-2 mt-1 h-10"
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Email <span className="text-red-500">*</span>
            <button className="text-blue-600 text-sm flex items-center gap-1 hover:text-blue-800">
              <FaEdit size={14} />
              Update Email
            </button>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              className="w-full bg-gray-100 text-gray-500 border border-gray-300 rounded-lg p-2 mt-1 pr-10 h-10"
              disabled
            />
            <FaCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mt-1">
            <select
              className="border border-gray-300 rounded-lg p-2 bg-white w-24 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm min-w-[70px] h-10 hover:bg-blue-700 transition disabled:opacity-50"
              disabled={isProcessing}
            >
              Verify
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Male", "Female", "More Options"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm min-w-fit ${
                  gender === g
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-blue-400"
                } transition`}
                disabled={isProcessing}
              >
                {g === "Male" && <FaMale />}
                {g === "Female" && <FaFemale />}
                {g === "More Options" && <FaUser />}
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium block mb-2 text-gray-700">
            User Type <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {userTypes.map(({ label, icon }) => (
              <button
                key={label}
                className={`flex items-center gap-2 border rounded-full px-4 py-2 min-w-fit ${
                  userType === label
                    ? "border-blue-600 text-blue-600 font-medium bg-blue-50"
                    : "border-gray-300 text-gray-700 hover:border-blue-400"
                } transition`}
                onClick={() => setUserType(label)}
                disabled={isProcessing}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {userType === "Professional" ? (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                Designation <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                disabled={isProcessing || isLoadingOptions}
              >
                <option value="">Select Designation</option>
                {designationOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {isLoadingOptions && (
                <p className="text-sm text-gray-500 mt-1">Loading designations...</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                Work Experience <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={workExperienceType}
                onChange={(e) => setWorkExperienceType(e.target.value)}
                disabled={isProcessing}
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
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    disabled={isProcessing}
                  />
                  Currently working in this role
                </label>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700">
                  Start Year
                </label>
                <input
                  type="text"
                  placeholder="Start Year"
                  className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700">
                  End Year
                </label>
                <input
                  type="text"
                  placeholder="End Year"
                  className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={isCurrentlyWorking || isProcessing}
                />
              </div>
            </div>
          </>
        ) : userType === "School Student" ? (
          <>
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
                    } transition`}
                    onClick={() => {
                      setGrade(g.label);
                      if (g.label !== "11" && g.label !== "12") {
                        setStream("");
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {(grade === "11" || grade === "12") && (
              <div className="mb-4">
                <label className="text-sm font-medium block mb-1 text-gray-700">
                  Stream <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  disabled={isProcessing}
                >
                  {streamOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your school name"
                disabled={isProcessing}
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={isProcessing || isLoadingOptions}
              >
                <option value="">Select Course</option>
                {courseOptions.map((option) => (
                  <option key={option._id} value={option._id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {isLoadingOptions && (
                <p className="text-sm text-gray-500 mt-1">Loading courses...</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                Course Specialization <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                disabled={isProcessing}
              >
                <option value="">Select Specialization</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700">
                  Start Year
                </label>
                <input
                  type="text"
                  placeholder="Start Year"
                  className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1 text-gray-700">
                  End Year
                </label>
                <input
                  type="text"
                  placeholder="End Year"
                  className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-1 text-gray-700">
                Organisation/College <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                disabled={isProcessing}
              >
                <option value="">Select College</option>
                <option value="ABC University">ABC University</option>
                <option value="XYZ Institute">XYZ Institute</option>
              </select>
            </div>
          </>
        )}

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Purpose <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {purposes.map((p) => (
              <button
                key={p.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm min-w-fit ${
                  selectedPurpose.includes(p.label)
                    ? "bg-blue-100 border-blue-500 text-blue-700 font-medium"
                    : "border-gray-300 text-gray-600 hover:border-blue-400"
                } transition`}
                onClick={() => handlePurposeToggle(p.label)}
                disabled={isProcessing}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Career Goal
          </label>
          <div className="flex flex-col border border-gray-300 rounded-lg">
            <label className="flex items-center px-4 py-3 border-b cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="career"
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                checked={careerGoal === "current"}
                onChange={() => setCareerGoal("current")}
                disabled={isProcessing}
              />
              Grow in my current career
            </label>
            <label className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="career"
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                checked={careerGoal === "new"}
                onChange={() => setCareerGoal("new")}
                disabled={isProcessing}
              />
              Transition into a new career
            </label>
            {careerGoal === "new" && (
              <div className="px-4 py-3 border-t relative z-10">
                <Select
                  isMulti
                  options={roleOptions.map((option) => ({
                    value: option._id,
                    label: option.name,
                  }))}
                  value={roleOptions
                    .filter((option) => newCareerRole.includes(option._id))
                    .map((option) => ({ value: option._id, label: option.name }))}
                  onChange={(selected) =>
                    setNewCareerRole(selected ? selected.map((item) => item.value) : [])
                  }
                  styles={customSelectStyles}
                  isDisabled={isProcessing || isLoadingOptions}
                  placeholder="Select roles..."
                  menuPortalTarget={document.body}
                />
                {isLoadingOptions && (
                  <p className="text-sm text-gray-500 mt-1">Loading roles...</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
            <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {success && (
          <p className="text-green-500 text-sm text-center">{success}</p>
        )}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <span className="text-lg">✓</span> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BasicDetails;