import React, { useState, useEffect, useRef } from "react";
import { BiTime } from "react-icons/bi";
import { BsEye, BsLightbulb } from "react-icons/bs";
import { AiFillFilePdf } from "react-icons/ai";
import { MdDelete, MdEdit } from "react-icons/md";
import { ChevronDown, Plus } from "lucide-react";
import { fetchSectionData, mUpdate, uploadAndStoreFile } from "../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Education = () => {
  const [formData, setFormData] = useState({
    qualification: "",
    course: "",
    specialization: "",
    stream: "",
    college: "",
    startYear: "",
    endYear: "",
    courseType: "",
    percentage: "",
    grade: "",
    rollNumber: "",
    lateralEntry: "",
    skills: "",
    description: "",
    fileUrl: "",
  });
  const [educationList, setEducationList] = useState([]);
  const [intermediateEducationList, setIntermediateEducationList] = useState([]);
  const [highSchoolEducationList, setHighSchoolEducationList] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIntermediateIndex, setEditingIntermediateIndex] = useState(null);
  const [editingHighSchoolIndex, setEditingHighSchoolIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isQualificationLocked, setIsQualificationLocked] = useState(false);
  const dropdownRef = useRef(null);
  const collegeDropdownRef = useRef(null);
  const skillInputRef = useRef(null);
  const skillDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        collegeDropdownRef.current &&
        !collegeDropdownRef.current.contains(event.target)
      ) {
        setShowCollegeDropdown(false);
      }
      if (
        skillInputRef.current &&
        !skillInputRef.current.contains(event.target) &&
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target)
      ) {
        setIsSkillsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      toast.error("Please log in to view your details.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }
    try {
      const user = JSON.parse(userString);
      setUserId(user.userid);
    } catch (parseError) {
      toast.error("Invalid user data. Please log in again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, []);

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        setIsProcessing(true);
        console.log(
          "Fetching courses, specializations, colleges, and skills from database..."
        );

        // Fetch courses
        const courseResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "course",
          query: {},
          projection: { _id: 1, "sectionData.course.name": 1 },
        });

        console.log("fetchCourses raw response:", courseResponse);

        if (!courseResponse || !Array.isArray(courseResponse)) {
          console.error(
            "Course response is not an array or is null:",
            courseResponse
          );
          toast.error("Invalid response from server while fetching courses.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        if (courseResponse.length === 0) {
          console.warn("No courses found in the database.");
          toast.error(
            "No courses found in the database. Please add courses to continue.",
            { position: "top-right", autoClose: 5000 }
          );
          return;
        }

        const courses = courseResponse
          .map((item, index) => {
            if (!item._id) {
              console.warn(`Course at index ${index} missing _id:`, item);
              return null;
            }
            if (!item.sectionData?.course?.name) {
              console.warn(
                `Course at index ${index} missing sectionData.course.name:`,
                item
              );
              return null;
            }
            return {
              id: item._id.toString(),
              name: item.sectionData.course.name,
            };
          })
          .filter(Boolean);

        console.log("Processed courses:", courses);

        if (courses.length === 0) {
          toast.error("No valid courses found in the database.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        setCourseOptions(courses);

        // Fetch specializations
        const specializationResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "coursespecialization",
          query: {},
          projection: { _id: 1, "sectionData.coursespecialization.name": 1 },
        });

        console.log(
          "fetchSpecializations raw response:",
          specializationResponse
        );

        if (!specializationResponse || !Array.isArray(specializationResponse)) {
          console.error(
            "Specialization response is not an array or is null:",
            specializationResponse
          );
          toast.error(
            "Invalid response from server while fetching specializations.",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
          return;
        }

        if (specializationResponse.length === 0) {
          console.warn("No specializations found in the database.");
          toast.error(
            "No specializations found in the database. Please add specializations to continue.",
            { position: "top-right", autoClose: 5000 }
          );
          return;
        }

        const specializations = specializationResponse
          .map((item, index) => {
            if (!item._id) {
              console.warn(`Specialization at index ${index} missing _id:`, item);
              return null;
            }
            if (!item.sectionData?.coursespecialization?.name) {
              console.warn(
                `Specialization at index ${index} missing sectionData.coursespecialization.name:`,
                item
              );
              return null;
            }
            return {
              id: item._id.toString(),
              name: item.sectionData.coursespecialization.name,
            };
          })
          .filter(Boolean);

        console.log("Processed specializations:", specializations);

        if (specializations.length === 0) {
          toast.error("No valid specializations found in the database.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        setSpecializationOptions(specializations);

        // Fetch colleges
        const collegeResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "institute",
          query: {},
          projection: { _id: 1, "sectionData.institute.institutionname": 1 },
        });

        console.log("fetchColleges raw response:", collegeResponse);

        if (!collegeResponse || !Array.isArray(collegeResponse)) {
          console.error(
            "College response is not an array or is null:",
            collegeResponse
          );
          toast.error("Invalid response from server while fetching colleges.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        if (collegeResponse.length === 0) {
          console.warn("No colleges found in the database.");
          toast.error(
            "No colleges found in the database. Please add colleges to continue.",
            { position: "top-right", autoClose: 5000 }
          );
          return;
        }

        const colleges = collegeResponse
          .map((item, index) => {
            if (!item._id) {
              console.warn(`College at index ${index} missing _id:`, item);
              return null;
            }
            if (!item.sectionData?.institute?.institutionname) {
              console.warn(
                `College at index ${index} missing sectionData.institute.institutionname:`,
                item
              );
              return null;
            }
            return {
              id: item._id.toString(),
              name: item.sectionData.institute.institutionname,
            };
          })
          .filter(Boolean);

        console.log("Processed colleges:", colleges);

        if (colleges.length === 0) {
          toast.error("No valid colleges found in the database.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        setCollegeOptions(colleges);
        setFilteredColleges(colleges);

        // Fetch skills
        const skillResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "skills",
          query: {},
          projection: { _id: 1, "sectionData.skills.name": 1 },
        });

        console.log("fetchSkills raw response:", skillResponse);

        if (!skillResponse || !Array.isArray(skillResponse)) {
          console.error("Skill response is not an array or is null:", skillResponse);
          toast.error("Invalid response from server while fetching skills.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        if (skillResponse.length === 0) {
          console.warn("No skills found in the database.");
          toast.error(
            "No skills found in the database. Please add skills to continue.",
            { position: "top-right", autoClose: 5000 }
          );
          return;
        }

        const skills = skillResponse
          .map((item, index) => {
            if (!item._id) {
              console.warn(`Skill at index ${index} missing _id:`, item);
              return null;
            }
            if (!item.sectionData?.skills?.name) {
              console.warn(
                `Skill at index ${index} missing sectionData.skills.name:`,
                item
              );
              return null;
            }
            return {
              id: item._id.toString(),
              name: item.sectionData.skills.name,
            };
          })
          .filter(Boolean);

        console.log("Processed skills:", skills);

        if (skills.length === 0) {
          toast.error("No valid skills found in the database.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }

        setAllSkills(skills);
      } catch (err) {
        console.error("fetchDropdownOptions error:", err);
        toast.error(`Failed to load dropdown data: ${err.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    fetchDropdownOptions();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserEducation = async () => {
      try {
        setIsProcessing(true);
        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
          projection: {
            "sectionData.appuser.education": 1,
            "sectionData.appuser.intermediateeducation": 1,
            "sectionData.appuser.highschooleducation": 1,
          },
        });

        console.log("Fetched education data:", response);

        const fetchedEducation =
          response && response[0] && response[0].sectionData?.appuser?.education
            ? response[0].sectionData.appuser.education
            : [];
        const fetchedIntermediateEducation =
          response &&
          response[0] &&
          response[0].sectionData?.appuser?.intermediateeducation
            ? response[0].sectionData.appuser.intermediateeducation
            : [];
        const fetchedHighSchoolEducation =
          response &&
          response[0] &&
          response[0].sectionData?.appuser?.highschooleducation
            ? response[0].sectionData.appuser.highschooleducation
            : [];

        setEducationList(fetchedEducation);
        setIntermediateEducationList(fetchedIntermediateEducation);
        setHighSchoolEducationList(fetchedHighSchoolEducation);
        setShowForm(
          fetchedEducation.length === 0 &&
          fetchedIntermediateEducation.length === 0 &&
          fetchedHighSchoolEducation.length === 0
        );
      } catch (err) {
        toast.error("Failed to load education data.", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    fetchUserEducation();
  }, [userId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (field === "college") {
      const filtered = collegeOptions.filter((college) =>
        college.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredColleges(filtered);
      setShowCollegeDropdown(true);
    }
  };

  const handleCollegeSelect = (collegeName) => {
    setFormData({ ...formData, college: collegeName });
    setShowCollegeDropdown(false);
    setFilteredColleges(collegeOptions);
  };

  const handleSkillInputChange = (value) => {
    setSkillInput(value);
    if (!value.trim()) {
      setFilteredSkills([]);
      setIsSkillsDropdownOpen(false);
      return;
    }
    const filtered = allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(value.toLowerCase()) &&
        !formData.skills.split(",").map((s) => s.trim()).includes(skill.name)
    );
    setFilteredSkills(filtered);
    setIsSkillsDropdownOpen(filtered.length > 0);
  };

  const handleSkillSelect = (skill) => {
    const currentSkills = formData.skills
      ? formData.skills.split(",").map((s) => s.trim())
      : [];
    const newSkills = [...currentSkills, skill.name].filter(Boolean).join(", ");
    setFormData({ ...formData, skills: newSkills });
    setSkillInput("");
    setIsSkillsDropdownOpen(false);
  };

  const handleSkillRemove = (skillName) => {
    const currentSkills = formData.skills
      ? formData.skills.split(",").map((s) => s.trim())
      : [];
    const newSkills = currentSkills
      .filter((s) => s !== skillName)
      .filter(Boolean)
      .join(", ");
    setFormData({ ...formData, skills: newSkills });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFormData({ ...formData, fileUrl: "" });
  };

  const handleRemoveFileFromForm = () => {
    setSelectedFile(null);
    setFormData({ ...formData, fileUrl: "" });
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error("Please log in to save education details.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    console.log("formData before saving:", formData);

    const requiredFields = ["qualification", "college", "startYear", "endYear"];
    const isIntermediate = formData.qualification === "Senior High School (SHS)";
    if (isIntermediate) {
      requiredFields.push("stream");
    } else if (formData.qualification !== "Junior High School (JHS)") {
      requiredFields.push("course");
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`, {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
    }

    if (
      formData.qualification !== "Junior High School (JHS)" &&
      formData.qualification !== "Senior High School (SHS)"
    ) {
      const validCourse = courseOptions.find(
        (course) => course.id === formData.course
      );
      if (!validCourse) {
        toast.error("Please select a valid course from the list.", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
    }

    try {
      setIsProcessing(true);
      let fileUrl = formData.fileUrl;

      if (selectedFile) {
        const uploadResponse = await uploadAndStoreFile({
          appName: "app8657281202648",
          moduleName: "appuser",
          file: selectedFile,
          userId,
        });

        fileUrl =
          uploadResponse?.filePath ||
          uploadResponse?.fileUrl ||
          uploadResponse?.data?.fileUrl;
        if (!fileUrl) {
          throw new Error(
            "Failed to upload file: No file path returned in response."
          );
        }
      }

      let updatePayload = {};
      const isHighSchool = formData.qualification === "Junior High School (JHS)";

      if (isHighSchool) {
        const highSchoolData = {
          qualification3: formData.qualification,
          college3: formData.college,
          startyear3: formData.startYear,
          endyear3: formData.endYear,
          coursetype3: formData.courseType,
          percentage3: formData.percentage,
          grade3: formData.grade,
          rollnumber3: formData.rollNumber,
          files3: fileUrl,
        };

        if (editingHighSchoolIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.highschooleducation.${editingHighSchoolIndex}`]:
              highSchoolData,
          };
          const updatedHighSchoolList = [...highSchoolEducationList];
          updatedHighSchoolList[editingHighSchoolIndex] = highSchoolData;
          setHighSchoolEducationList(updatedHighSchoolList);
        } else {
          const updatedHighSchoolList = [
            ...highSchoolEducationList,
            highSchoolData,
          ];
          updatePayload = {
            "sectionData.appuser.highschooleducation": updatedHighSchoolList,
          };
          setHighSchoolEducationList(updatedHighSchoolList);
        }
      } else if (isIntermediate) {
        const intermediateData = {
          qualification2: formData.qualification,
          steam2: formData.stream,
          college2: formData.college,
          startyear2: formData.startYear,
          endyear2: formData.endYear,
          coursetype2: formData.courseType,
          percentage2: formData.percentage,
          grade2: formData.grade,
          rollnumber2: formData.rollNumber,
          files2: fileUrl,
        };

        if (editingIntermediateIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.intermediateeducation.${editingIntermediateIndex}`]:
              intermediateData,
          };
          const updatedIntermediateList = [...intermediateEducationList];
          updatedIntermediateList[editingIntermediateIndex] = intermediateData;
          setIntermediateEducationList(updatedIntermediateList);
        } else {
          const updatedIntermediateList = [
            ...intermediateEducationList,
            intermediateData,
          ];
          updatePayload = {
            "sectionData.appuser.intermediateeducation": updatedIntermediateList,
          };
          setIntermediateEducationList(updatedIntermediateList);
        }
      } else {
        const educationData = {
          qualification1: formData.qualification,
          course1: formData.course,
          specialization1: formData.specialization,
          stream1: formData.stream,
          college1: formData.college,
          startyear1: formData.startYear,
          endyear1: formData.endYear,
          "Course type1": formData.courseType,
          percentage1: formData.percentage,
          grade1: formData.grade,
          rollnumber1: formData.rollNumber,
          areyoualateralentrystudent1: formData.lateralEntry,
          skills1: formData.skills,
          description1: formData.description,
          files1: fileUrl,
        };

        console.log("educationData:", educationData);

        if (editingIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.education.${editingIndex}`]: educationData,
          };
          const updatedEducationList = [...educationList];
          updatedEducationList[editingIndex] = educationData;
          setEducationList(updatedEducationList);
        } else {
          const updatedEducationList = [...educationList, educationData];
          updatePayload = {
            "sectionData.appuser.education": updatedEducationList,
          };
          setEducationList(updatedEducationList);
        }
      }

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (response && response.success) {
        toast.success(
          editingIndex !== null ||
            editingIntermediateIndex !== null ||
            editingHighSchoolIndex !== null
            ? "updated successfully!"
            : "saved successfully!",
          { position: "top-right", autoClose: 3000 }
        );
        setFormData({
          qualification: "",
          course: "",
          specialization: "",
          stream: "",
          college: "",
          startYear: "",
          endYear: "",
          courseType: "",
          percentage: "",
          grade: "",
          rollNumber: "",
          lateralEntry: "",
          skills: "",
          description: "",
          fileUrl: "",
        });
        setSkillInput("");
        setSelectedFile(null);
        setEditingIndex(null);
        setEditingIntermediateIndex(null);
        setEditingHighSchoolIndex(null);
        setShowForm(false);
        setIsQualificationLocked(false);
        setShowCollegeDropdown(false);
        setIsSkillsDropdownOpen(false);
      } else {
        throw new Error("Failed to save education data to database.");
      }
    } catch (error) {
      console.error("Failed to save education data:", error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }
      toast.error(errorMessage || "Failed to save education details", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditEducation = (index, type) => {
    if (type === "highschool") {
      const edu = highSchoolEducationList[index];
      setFormData({
        qualification: edu.qualification3 || "",
        course: "",
        specialization: "",
        stream: "",
        college: edu.college3 || "",
        startYear: edu.startyear3 || "",
        endYear: edu.endyear3 || "",
        courseType: edu.coursetype3 || "",
        percentage: edu.percentage3 || "",
        grade: edu.grade3 || "",
        rollNumber: edu.rollnumber3 || "",
        lateralEntry: "",
        skills: "",
        description: "",
        fileUrl: edu.files3 || "",
      });
      setEditingHighSchoolIndex(index);
      setEditingIntermediateIndex(null);
      setEditingIndex(null);
      setIsQualificationLocked(true);
    } else if (type === "intermediate") {
      const edu = intermediateEducationList[index];
      setFormData({
        qualification: edu.qualification2 || "",
        course: "",
        specialization: "",
        stream: edu.steam2 || "",
        college: edu.college2 || "",
        startYear: edu.startyear2 || "",
        endYear: edu.endyear2 || "",
        courseType: edu.coursetype2 || "",
        percentage: edu.percentage2 || "",
        grade: edu.grade2 || "",
        rollNumber: edu.rollnumber2 || "",
        lateralEntry: "",
        skills: "",
        description: "",
        fileUrl: edu.files2 || "",
      });
      setEditingIntermediateIndex(index);
      setEditingHighSchoolIndex(null);
      setEditingIndex(null);
      setIsQualificationLocked(true);
    } else {
      const edu = educationList[index];
      const courseValue =
        courseOptions.find(
          (c) => c.id === edu.course1 || c.name === edu.course1
        )?.id ||
        edu.course1 ||
        "";
      const specializationValue =
        specializationOptions.find(
          (s) => s.id === edu.specialization1 || s.name === edu.specialization1
        )?.id ||
        edu.specialization1 ||
        "";
      setFormData({
        qualification: edu.qualification1 || "",
        course: courseValue,
        specialization: specializationValue,
        stream: edu.stream1 || "",
        college: edu.college1 || "",
        startYear: edu.startyear1 || "",
        endYear: edu.endyear1 || "",
        courseType: edu["Course type1"] || "",
        percentage: edu.percentage1 || "",
        grade: edu.grade1 || "",
        rollNumber: edu.rollnumber1 || "",
        lateralEntry: edu.areyoualateralentrystudent1 || "",
        skills: edu.skills1 || "",
        description: edu.description1 || "",
        fileUrl: edu.files1 || "",
      });
      setEditingIndex(index);
      setEditingIntermediateIndex(null);
      setEditingHighSchoolIndex(null);
      setIsQualificationLocked(false);
    }
    setSelectedFile(null);
    setShowForm(true);
    setShowDropdown(false);
    setShowCollegeDropdown(false);
    setFilteredColleges(collegeOptions);
    setSkillInput("");
    setIsSkillsDropdownOpen(false);
  };

  const handleRemoveEducation = async (index, type) => {
    if (!userId) {
      toast.error("Please log in to remove education details.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      let updatePayload = {};
      let updatedEducationList = [...educationList];
      let updatedIntermediateEducationList = [...intermediateEducationList];
      let updatedHighSchoolList = [...highSchoolEducationList];

      if (type === "highschool") {
        updatedHighSchoolList.splice(index, 1);
        updatePayload = {
          "sectionData.appuser.highschooleducation": updatedHighSchoolList,
        };
        setHighSchoolEducationList(updatedHighSchoolList);
        if (editingHighSchoolIndex === index) {
          setEditingHighSchoolIndex(null);
        }
      } else if (type === "intermediate") {
        updatedIntermediateEducationList.splice(index, 1);
        updatePayload = {
          "sectionData.appuser.intermediateeducation": updatedIntermediateEducationList,
        };
        setIntermediateEducationList(updatedIntermediateEducationList);
        if (editingIntermediateIndex === index) {
          setEditingIntermediateIndex(null);
        }
      } else {
        updatedEducationList.splice(index, 1);
        updatePayload = {
          "sectionData.appuser.education": updatedEducationList,
        };
        setEducationList(updatedEducationList);
        if (editingIndex === index) {
          setEditingIndex(null);
        }
      }

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (response && response.success) {
        toast.success("removed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData({
          qualification: "",
          course: "",
          specialization: "",
          stream: "",
          college: "",
          startYear: "",
          endYear: "",
          courseType: "",
          percentage: "",
          grade: "",
          rollNumber: "",
          lateralEntry: "",
          skills: "",
          description: "",
          fileUrl: "",
        });
        setSkillInput("");
        setSelectedFile(null);
        setShowForm(
          updatedEducationList.length === 0 &&
          updatedIntermediateEducationList.length === 0 &&
          updatedHighSchoolList.length === 0
        );
        setIsQualificationLocked(false);
        setShowCollegeDropdown(false);
        setIsSkillsDropdownOpen(false);
      } else {
        throw new Error("Failed to remove education entry from database.");
      }
    } catch (error) {
      console.error("Failed to remove education data:", error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }
      toast.error(errorMessage || "Failed to remove education entry", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async (index, type) => {
    if (!userId) {
      toast.error("Please log in to remove file.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      let updatePayload = {};

      if (type === "highschool") {
        updatePayload = {
          [`sectionData.appuser.highschooleducation.${index}.files3`]: "",
        };
        const updatedHighSchoolList = [...highSchoolEducationList];
        updatedHighSchoolList[index] = {
          ...updatedHighSchoolList[index],
          files3: "",
        };
        setHighSchoolEducationList(updatedHighSchoolList);
      } else if (type === "intermediate") {
        updatePayload = {
          [`sectionData.appuser.intermediateeducation.${index}.files2`]: "",
        };
        const updatedIntermediateEducationList = [...intermediateEducationList];
        updatedIntermediateEducationList[index] = {
          ...updatedIntermediateEducationList[index],
          files2: "",
        };
        setIntermediateEducationList(updatedIntermediateEducationList);
      } else {
        updatePayload = {
          [`sectionData.appuser.education.${index}.files1`]: "",
        };
        const updatedEducationList = [...educationList];
        updatedEducationList[index] = {
          ...updatedEducationList[index],
          files1: "",
        };
        setEducationList(updatedEducationList);
      }

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (response && response.success) {
        toast.success("File removed successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        if (type === "education" && editingIndex === index) {
          setFormData({ ...formData, fileUrl: "" });
          setSelectedFile(null);
        } else if (
          type === "intermediate" &&
          editingIntermediateIndex === index
        ) {
          setFormData({ ...formData, fileUrl: "" });
          setSelectedFile(null);
        } else if (type === "highschool" && editingHighSchoolIndex === index) {
          setFormData({ ...formData, fileUrl: "" });
          setSelectedFile(null);
        }
      } else {
        throw new Error("Failed to remove file from database.");
      }
    } catch (error) {
      console.error("Failed to remove file:", error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }
      toast.error(errorMessage || "Failed to remove file", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
    setFormData({
      qualification: "Bachelor",
      course: "",
      specialization: "",
      stream: "",
      college: "",
      startYear: "",
      endYear: "",
      courseType: "",
      percentage: "",
      grade: "",
      rollNumber: "",
      lateralEntry: "",
      skills: "",
      description: "",
      fileUrl: "",
    });
    setSkillInput("");
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setShowCollegeDropdown(false);
    setFilteredColleges(collegeOptions);
    setIsSkillsDropdownOpen(false);
    setIsQualificationLocked(false);
  };

  const handleAddIntermediate = () => {
    setShowForm(true);
    setFormData({
      qualification: "Senior High School (SHS)",
      course: "",
      specialization: "",
      stream: "",
      college: "",
      startYear: "",
      endYear: "",
      courseType: "",
      percentage: "",
      grade: "",
      rollNumber: "",
      lateralEntry: "",
      skills: "",
      description: "",
      fileUrl: "",
    });
    setSkillInput("");
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setShowCollegeDropdown(false);
    setFilteredColleges(collegeOptions);
    setIsSkillsDropdownOpen(false);
    setIsQualificationLocked(true);
  };

  const handleAddHighSchool = () => {
    setShowForm(true);
    setFormData({
      qualification: "Junior High School (JHS)",
      course: "",
      specialization: "",
      stream: "",
      college: "",
      startYear: "",
      endYear: "",
      courseType: "",
      percentage: "",
      grade: "",
      rollNumber: "",
      lateralEntry: "",
      skills: "",
      description: "",
      fileUrl: "",
    });
    setSkillInput("");
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setShowCollegeDropdown(false);
    setFilteredColleges(collegeOptions);
    setIsSkillsDropdownOpen(false);
    setIsQualificationLocked(true);
  };

  const dropdownOptions = {
    qualification: [
      "Junior High School (JHS)",
      "Senior High School (SHS)",
      "Bachelor",
      "Master",
      "PhD",
    ],
    stream: ["STEM", "ABM", "HUMSS"],
    courseType: ["Full Time", "Part Time", "Distance Learning"],
    lateralEntry: ["Yes", "No"],
  };

  const getCourseNameById = (id) => {
    const course = courseOptions.find((c) => c.id === id || c.name === id);
    return course ? course.name : id || "Unknown Course";
  };

  const getSpecializationNameById = (id) => {
    const specialization = specializationOptions.find(
      (s) => s.id === id || s.name === id
    );
    return specialization ? specialization.name : id || "";
  };

  const renderSelect = (label, field, options, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={formData[field] || ""}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
            isProcessing || (field === "qualification" && isQualificationLocked)
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            isProcessing || (field === "qualification" && isQualificationLocked)
          }
        >
          <option value="" disabled>
            Select {label}
          </option>
          {field === "course" || field === "specialization" ? (
            <>
              {options.length === 0 ? (
                <option value="" disabled>
                  No {field === "course" ? "courses" : "specializations"} available
                </option>
              ) : (
                options
                  .filter((opt) => opt && opt.id && opt.name)
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))
              )}
            </>
          ) : (
            options
              .filter((opt) => typeof opt === "string" && opt.trim() !== "")
              .map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );

  const renderCollegeInput = (label, field, required = false) => (
    <div className="mb-4 relative" ref={collegeDropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        placeholder="Type to search colleges..."
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        onFocus={() => setShowCollegeDropdown(true)}
        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isProcessing}
      />
      {showCollegeDropdown && filteredColleges.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {filteredColleges.map((college) => (
            <li
              key={college.id}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleCollegeSelect(college.name)}
            >
              {college.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderInput = (label, field, type = "text", required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={label}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isProcessing}
      />
    </div>
  );

  const renderTextarea = (label, field) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        placeholder={label}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isProcessing}
        rows="4"
      />
    </div>
  );

  const renderSkillsInput = () => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Skills
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {formData.skills &&
          formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
            .map((skill, index) => (
              <button
                key={index}
                onClick={() => handleSkillRemove(skill)}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1"
                disabled={isProcessing}
              >
                {skill}
                <span className="text-sm">✕</span>
              </button>
            ))}
      </div>
      <div className="relative">
        <input
          ref={skillInputRef}
          type="text"
          placeholder="Search skills..."
          value={skillInput}
          onChange={(e) => handleSkillInputChange(e.target.value)}
          onFocus={() =>
            skillInput.trim() && filteredSkills.length > 0 && setIsSkillsDropdownOpen(true)
          }
          className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isProcessing}
        />
        {isSkillsDropdownOpen && filteredSkills.length > 0 && (
          <div
            ref={skillDropdownRef}
            className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
          >
            {filteredSkills.map((skill) => (
              <button
                key={skill.id}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => handleSkillSelect(skill)}
                disabled={isProcessing}
              >
                {skill.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div
      className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm w-full animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
          <div className="flex gap-2 mt-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeletonForm = () => (
    <div className="space-y-4 animate-pulse">
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-24 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-20 bg-gray-200 rounded w-full border-dashed"></div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 bg-gray-200 rounded-full w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -468px 0;
          }
          100% {
            background-position: 468px 0;
          }
        }
        .animate-pulse {
          animation: shimmer 1.5s infinite;
          background: linear-gradient(
            to right,
            #f6f7f8 8%,
            #edeef1 18%,
            #f6f7f8 33%
          );
          background-size: 800px 104px;
        }
      `}</style>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Education</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <button
            onClick={handleAddNew}
            className="text-green-600 hover:text-green-700 cursor-pointer"
            title="Add New Education"
            aria-label="Add New Education"
            disabled={isProcessing}
          >
            <Plus className="text-xl" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isProcessing ? (
          showForm ? (
            renderSkeletonForm()
          ) : (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i}>{renderSkeletonCard()}</div>
              ))}
            </div>
          )
        ) : showForm ? (
          <div className="space-y-4">
            {renderSelect(
              "Qualification",
              "qualification",
              dropdownOptions.qualification,
              true
            )}
            {formData.qualification !== "Junior High School (JHS)" &&
              formData.qualification !== "Senior High School (SHS)" && (
                <>
                  {renderSelect("Course", "course", courseOptions, true)}
                  {renderSelect(
                    "Specialization",
                    "specialization",
                    specializationOptions
                  )}
                </>
              )}
            {formData.qualification === "Senior High School (SHS)" &&
              renderSelect("Stream", "stream", dropdownOptions.stream, true)}
            {renderCollegeInput("College", "college", true)}

            <div className="grid md:grid-cols-2 gap-4">
              {renderInput("Start Year", "startYear", "text", true)}
              {renderInput("End Year", "endYear", "text", true)}
            </div>

            {renderSelect(
              "Course Type",
              "courseType",
              dropdownOptions.courseType
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {renderInput("Percentage", "percentage")}
              {renderInput("GRADE", "grade")}
            </div>

            {renderInput("Roll Number", "rollNumber")}

            {formData.qualification !== "Junior High School (JHS)" &&
              formData.qualification !== "Senior High School (SHS)" && (
                <>
                  {renderSelect(
                    "Are You A Lateral Entry Student?",
                    "lateralEntry",
                    dropdownOptions.lateralEntry
                  )}
                  {renderSkillsInput()}
                  {renderTextarea("Description", "description")}
                </>
              )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              {formData.fileUrl || selectedFile ? (
                <div className="flex items-center justify-between border border-gray-300 rounded-md p-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <AiFillFilePdf
                      className="text-gray-500 text-lg"
                      aria-label="PDF file icon"
                    />
                    {formData.fileUrl ? (
                      <a
                        href={formData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 truncate max-w-[200px]"
                      >
                        {formData.fileUrl.split("/").pop()}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowDropdown(!showDropdown)}
                      aria-label="More options"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {formData.fileUrl && (
                          <a
                            href={formData.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Preview
                          </a>
                        )}
                        <label
                          htmlFor="educationFileUpload"
                          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Edit
                          <input
                            type="file"
                            id="educationFileUpload"
                            className="hidden"
                            accept=".doc,.docx,.pdf"
                            onChange={(e) => {
                              handleFileUpload(e);
                              setShowDropdown(false);
                            }}
                            disabled={isProcessing}
                          />
                        </label>
                        <button
                          onClick={() => {
                            if (
                              editingIndex !== null ||
                              editingIntermediateIndex !== null ||
                              editingHighSchoolIndex !== null
                            ) {
                              const type =
                                editingHighSchoolIndex !== null
                                  ? "highschool"
                                  : editingIntermediateIndex !== null
                                  ? "intermediate"
                                  : "education";
                              const idx =
                                editingHighSchoolIndex !== null
                                  ? editingHighSchoolIndex
                                  : editingIntermediateIndex !== null
                                  ? editingIntermediateIndex
                                  : editingIndex;
                              handleDeleteFile(idx, type);
                            } else {
                              handleRemoveFileFromForm();
                            }
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M5 7h14M5 7l1-4h6l1 4"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <label htmlFor="educationFileId" className="cursor-pointer block">
                  <div className="border-dashed border-2 border-gray-300 rounded-md px-4 py-6 text-center text-gray-600">
                    <span className="text-xl">+</span> Attachments
                  </div>
                  <input
                    type="file"
                    id="educationFileId"
                    className="hidden"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </label>
              )}
            </div>
            <button
              className="mt-2 px-4 py-2 border rounded-full text-blue-600 opacity-50 cursor-not-allowed transition"
              disabled
            >
              Generate with AI
            </button>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
                    isProcessing
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                  disabled={isProcessing}
                  aria-label={
                    editingIndex !== null ||
                    editingIntermediateIndex !== null ||
                    editingHighSchoolIndex !== null
                      ? "Update Education"
                      : "Save Education"
                  }
                >
                  <span className="text-lg">✓</span>{" "}
                  {editingIndex !== null ||
                  editingIntermediateIndex !== null ||
                  editingHighSchoolIndex !== null
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Saved Education
            </p>
            {educationList.length === 0 &&
            intermediateEducationList.length === 0 &&
            highSchoolEducationList.length === 0 ? (
              <p className="text-gray-600">No education details saved yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {educationList.map((edu, index) => (
                  <div
                    key={`education-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college1?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {edu.college1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {edu.qualification1}
                          </p>
                          {edu.course1 && (
                            <p className="text-sm text-gray-600">
                              {getCourseNameById(edu.course1)}
                            </p>
                          )}
                          {edu.specialization1 && (
                            <p className="text-sm text-gray-600">
                              {getSpecializationNameById(edu.specialization1)}
                            </p>
                          )}
                          {edu.areyoualateralentrystudent1 && (
                            <p className="text-sm text-gray-600">
                              Lateral Entry: {edu.areyoualateralentrystudent1}
                            </p>
                          )}
                          {edu.skills1 && (
                            <p className="text-sm text-gray-600">
                              Skills: {edu.skills1}
                            </p>
                          )}
                          {edu.description1 && (
                            <p className="text-sm text-gray-600">
                              Description: {edu.description1}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">
                              {edu.stream1}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm">{`${edu.startyear1} - ${edu.endyear1}`}</p>
                          </div>
                          {(edu.percentage1 || edu.grade1) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage1 &&
                                `Percentage: ${edu.percentage1}%`}
                              {edu.percentage1 && edu.grade1 && " | "}
                              {edu.grade1 && `GRADE: ${edu.grade1}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files1 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf
                                className="text-red-500 text-lg"
                                aria-label="PDF file icon"
                              />
                              <a
                                href={edu.files1}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files1.split("/").pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() =>
                                  handleDeleteFile(index, "education")
                                }
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() =>
                            handleEditEducation(index, "education")
                          }
                          disabled={isProcessing}
                          aria-label="Edit Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() =>
                            handleRemoveEducation(index, "education")
                          }
                          disabled={isProcessing}
                          aria-label="Delete Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {intermediateEducationList.map((edu, index) => (
                  <div
                    key={`intermediate-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college2?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {edu.college2}
                          </p>
                          <p className="text-sm text-gray-600">
                            {edu.qualification2}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">
                              {edu.steam2}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">{`${edu.startyear2} - ${edu.endyear2}`}</p>
                          </div>
                          {(edu.percentage2 || edu.grade2) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage2 &&
                                `Percentage: ${edu.percentage2}%`}
                              {edu.percentage2 && edu.grade2 && " | "}
                              {edu.grade2 && `GRADE: ${edu.grade2}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files2 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf
                                className="text-red-500 text-lg"
                                aria-label="PDF file icon"
                              />
                              <a
                                href={edu.files2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files2.split("/").pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() =>
                                  handleDeleteFile(index, "intermediate")
                                }
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() =>
                            handleEditEducation(index, "intermediate")
                          }
                          disabled={isProcessing}
                          aria-label="Edit Intermediate Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() =>
                            handleRemoveEducation(index, "intermediate")
                          }
                          disabled={isProcessing}
                          aria-label="Delete Intermediate Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {highSchoolEducationList.map((edu, index) => (
                  <div
                    key={`highschool-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college3?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {edu.college3}
                          </p>
                          <p className="text-sm text-gray-600">
                            {edu.qualification3}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">{`${edu.startyear3} - ${edu.endyear3}`}</p>
                          </div>
                          {(edu.percentage3 || edu.grade3) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage3 &&
                                `Percentage: ${edu.percentage3}%`}
                              {edu.percentage3 && edu.grade3 && " | "}
                              {edu.grade3 && `GRADE: ${edu.grade3}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files3 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf
                                className="text-red-500 text-lg"
                                aria-label="PDF file icon"
                              />
                              <a
                                href={edu.files3}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files3.split("/").pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() =>
                                  handleDeleteFile(index, "highschool")
                                }
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() =>
                            handleEditEducation(index, "highschool")
                          }
                          disabled={isProcessing}
                          aria-label="Edit High School Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() =>
                            handleRemoveEducation(index, "highschool")
                          }
                          disabled={isProcessing}
                          aria-label="Delete High School Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {intermediateEducationList.length === 0 && (
                <button
                  onClick={handleAddIntermediate}
                  className="text-blue-600 hover:underline text-sm font-medium"
                  aria-label="Add Intermediate Education"
                >
                  Add Intermediate
                </button>
              )}
              {intermediateEducationList.length === 0 &&
                highSchoolEducationList.length === 0 && <br />}
              {highSchoolEducationList.length === 0 && (
                <button
                  onClick={handleAddHighSchool}
                  className="text-blue-600 hover:underline text-sm font-medium"
                  aria-label="Add High School Education"
                >
                  Add High School
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;