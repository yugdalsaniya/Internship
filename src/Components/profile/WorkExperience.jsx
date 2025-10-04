import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { BiTime } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { AiFillFilePdf } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSectionData, mUpdate, uploadAndStoreFile } from "../../Utils/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const WorkExperience = ({ userData, updateCompletionStatus }) => {
  const [formData, setFormData] = useState({
    designation4: { id: "", name: "" },
    organisation4: "",
    employmenttype4: "",
    gotFromInternph4: false,
    startdate4: "",
    enddate4: "",
    currentlyworking4: false,
    location4: "",
    remote4: false,
    skills4: [],
    description4: "",
    files4: "",
  });
  const [designations, setDesignations] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [filteredInstituteNames, setFilteredNames] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [instituteInput, setInstituteInput] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
  const [isInstitutesDropdownOpen, setIsInstitutesDropdownOpen] = useState(false);
  const [workExperienceList, setWorkExperienceList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const skillInputRef = useRef(null);
  const skillDropdownRef = useRef(null);
  const instituteInputRef = useRef(null);
  const instituteDropdownRef = useRef(null);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const dropdownRef = useRef(null);

  const today = new Date().toISOString().split("T")[0];
  const minDate = "1900-01-01";

  useEffect(() => {
    setInstituteInput(formData.organisation4);
  }, [formData.organisation4]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          toast.error("Please log in to view your details.", {
            position: "top-right",
            autoClose: 5000,
          });
          return;
        }
        const user = JSON.parse(userString);
        const userId = user.userid;

        setIsProcessing(true);
        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
          projection: { "sectionData.appuser.workexperience2": 1 },
        });

        const fetchedWorkExperience =
          response &&
          response[0] &&
          response[0].sectionData?.appuser?.workexperience2
            ? response[0].sectionData.appuser.workexperience2
            : [];
        setWorkExperienceList(fetchedWorkExperience);
        setShowForm(fetchedWorkExperience.length === 0);
        const isCompleted = fetchedWorkExperience.length > 0;
        setIsFirstSaveSuccessful(isCompleted);
        if (updateCompletionStatus) {
          updateCompletionStatus("Work Experience", isCompleted);
        }
      } catch (err) {
        console.error("Failed to load work experience data:", err);
        toast.error("Failed to load work experience data.", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    fetchUserData();
  }, [updateCompletionStatus]);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const params = {
          collectionName: "designation",
          projection: { "sectionData.designation": 1, _id: 1 },
          cacheBust: new Date().getTime(),
        };
        const response = await fetchSectionData(params);
        const designationData = response.map((item) => ({
          id: item._id,
          name: item.sectionData.designation.name,
        }));
        setDesignations(designationData);
        setError("");
      } catch (err) {
        console.error("Failed to fetch designations:", err);
        setError("Failed to load designations. Please try again later.");
        setTimeout(() => setError(""), 5000);
        setDesignations([]);
      }
    };
    fetchDesignations();
  }, []);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const params = {
          collectionName: "institute",
          projection: { "sectionData.institute.institutionname": 1 },
          cacheBust: new Date().getTime(),
        };
        const response = await fetchSectionData(params);
        const instituteNames = response
          .filter((item) => item.sectionData?.institute?.institutionname)
          .map((item) => item.sectionData.institute.institutionname);
        setInstitutes(instituteNames);
        setError("");
      } catch (err) {
        console.error("Failed to fetch institutes:", err);
        setError("Failed to load institutes. Please try again later.");
        setTimeout(() => setError(""), 5000);
        setInstitutes([]);
      }
    };
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const params = {
          collectionName: "skills",
          projection: { "sectionData.skills.name": 1, _id: 1 },
          cacheBust: new Date().getTime(),
        };
        const response = await fetchSectionData(params);
        const skillData = response.map((item) => ({
          id: item._id,
          name: item.sectionData.skills.name,
        }));
        setAllSkills(skillData);
        setError("");
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError("Failed to load skills. Please try again later.");
        setTimeout(() => setError(""), 5000);
        setAllSkills([]);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        skillInputRef.current &&
        !skillInputRef.current.contains(event.target) &&
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target)
      ) {
        setIsSkillsDropdownOpen(false);
      }
      if (
        instituteInputRef.current &&
        !instituteInputRef.current.contains(event.target) &&
        instituteDropdownRef.current &&
        !instituteDropdownRef.current.contains(event.target)
      ) {
        setIsInstitutesDropdownOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key is missing.");
      toast.error("Location suggestions unavailable: API key missing.", {
        autoClose: 5000,
      });
      setError("Location suggestions unavailable: API key missing.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          `script[src*="maps.googleapis.com/maps/api/js"]`
        );
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    if (!showForm || !locationInputRef.current) {
      return;
    }

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          console.error("Google Maps places library not loaded.");
          toast.error(
            "Location suggestions unavailable: Places library not loaded.",
            { autoClose: 5000 }
          );
          setError(
            "Location suggestions unavailable: Places library not loaded."
          );
          setTimeout(() => setError(""), 5000);
          return;
        }
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ["(cities)"],
            fields: ["formatted_address", "name"],
            componentRestrictions: { country: "ph" },
          }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place && (place.formatted_address || place.name)) {
            setFormData((prev) => ({
              ...prev,
              location4: place.formatted_address || place.name || "",
            }));
          } else {
            console.warn("No valid place selected");
            setFormData((prev) => ({
              ...prev,
              location4: "",
            }));
          }
        });
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        const errorMessage = "Google Maps API failed to load. Location suggestions unavailable.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
        setTimeout(() => setError(""), 5000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [showForm]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchFilteredSkills = debounce((query) => {
    if (!query.trim()) {
      setFilteredSkills([]);
      setIsSkillsDropdownOpen(false);
      return;
    }
    const filtered = allSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query.toLowerCase()) &&
        !formData.skills4.includes(skill.id)
    );
    setFilteredSkills(filtered);
    setIsSkillsDropdownOpen(filtered.length > 0);
  }, 500);

  const fetchFilteredNames = debounce((query) => {
    if (!query.trim()) {
      setFilteredNames([]);
      setIsInstitutesDropdownOpen(false);
      return;
    }
    const filtered = institutes.filter((name) =>
      name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNames(filtered);
    setIsInstitutesDropdownOpen(filtered.length > 0);
  }, 500);

  const handleInstituteInputChange = (value) => {
    setInstituteInput(value);
    fetchFilteredNames(value);
    setFormData((prev) => ({ ...prev, organisation4: value }));
  };

  const handleInstituteSelect = (name) => {
    setInstituteInput(name);
    setFormData((prev) => ({ ...prev, organisation4: name }));
    setIsInstitutesDropdownOpen(false);
  };

  const handleSkillInputChange = (value) => {
    setSkillInput(value);
    fetchFilteredSkills(value);
  };

  const handleSkillSelect = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills4: [...prev.skills4, skill.id],
    }));
    setSkillInput("");
    setIsSkillsDropdownOpen(false);
  };

  const handleSkillRemove = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skills4: prev.skills4.filter((id) => id !== skillId),
    }));
  };

  const isValidDate = (dateStr) => {
    if (!dateStr) return false; // Required, so false if empty
    const date = new Date(dateStr);
    const todayDate = new Date(today);
    const minYear = 1900;

    if (isNaN(date.getTime())) {
      return false;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (year < minYear || date > todayDate) {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return false;
    }

    return true;
  };

  const handleChange = (field, value) => {
    setError("");
    if (field === "startdate4" || field === "enddate4") {
      if (value && !isValidDate(value)) {
        toast.error(
          field === "startdate4"
            ? "Please enter a valid start date (1900 or later, not in the future)."
            : "Please enter a valid end date (after start date, not in the future).",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
        return;
      }
      if (field === "enddate4" && value && formData.startdate4) {
        if (value <= formData.startdate4) {
          toast.error("End date must be after start date.", {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
      }
      if (field === "startdate4" && formData.enddate4 && value > formData.enddate4) {
        toast.info("End date reset as it was earlier than the new start date.", {
          position: "top-right",
          autoClose: 3000,
        });
        setFormData((prev) => ({ ...prev, enddate4: "" }));
      }
    }
    if (field === "designation4") {
      setFormData((prev) => ({ ...prev, designation4: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: !prev[field] };
      if (field === "currentlyworking4" && updated.currentlyworking4) {
        updated.enddate4 = "";
      }
      return updated;
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.designation4.id) errors.push("Designation is required.");
    if (!formData.organisation4.trim()) errors.push("Organisation is required.");
    if (!formData.employmenttype4) errors.push("Employment type is required.");
    if (!formData.startdate4) errors.push("Start date is required.");
    else if (!isValidDate(formData.startdate4)) errors.push("Invalid start date. Must be a valid date from 1900 to today.");
    else if (formData.startdate4 > today) errors.push("Start date cannot be in the future.");
    if (!formData.currentlyworking4 && !formData.enddate4) errors.push("End date is required if not currently working.");
    else if (!formData.currentlyworking4 && formData.enddate4 && !isValidDate(formData.enddate4)) errors.push("Invalid end date. Must be a valid date.");
    else if (!formData.currentlyworking4 && formData.enddate4 && formData.enddate4 <= formData.startdate4) errors.push("End date must be after start date.");
    else if (!formData.currentlyworking4 && formData.enddate4 && formData.enddate4 > today) errors.push("End date cannot be in the future.");
    if (!formData.location4.trim()) errors.push("Location is required.");

    if (errors.length > 0) {
      toast.error("Please fill all required fields.", {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Please log in to save work experience.");
      }
      const user = JSON.parse(userString);
      const userId = user.userid;

      const newWorkExperience = {
        designation4: formData.designation4.id,
        organisation4: formData.organisation4,
        employmenttype4: formData.employmenttype4,
        gotFromInternph4: formData.gotFromInternph4,
        startdate4: formData.startdate4,
        enddate4: formData.currentlyworking4 ? null : formData.enddate4,
        currentlyworking4: formData.currentlyworking4,
        location4: formData.location4,
        remote4: formData.remote4,
        skills4: formData.skills4,
        description4: formData.description4,
        files4: formData.files4,
        createdAt: editingIndex !== null && workExperienceList[editingIndex] ? workExperienceList[editingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedWorkExperienceList;
      if (editingIndex !== null) {
        updatedWorkExperienceList = workExperienceList.map((item, idx) =>
          idx === editingIndex ? newWorkExperience : item
        );
      } else {
        updatedWorkExperienceList = [
          ...workExperienceList,
          newWorkExperience,
        ];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.workexperience2": updatedWorkExperienceList,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setWorkExperienceList(updatedWorkExperienceList);
      resetForm();
      setShowForm(false);
      setEditingIndex(null);
      const isCompleted = updatedWorkExperienceList.length > 0;
      setIsFirstSaveSuccessful(isCompleted);
      if (updateCompletionStatus) {
        updateCompletionStatus("Work Experience", isCompleted);
      }
      toast.success(
        editingIndex !== null
          ? "Work experience updated successfully!"
          : "Work experience saved successfully!",
        { position: "top-right", autoClose: 3000 }
      );
    } catch (err) {
      console.error("Failed to save work experience:", err);
      toast.error(err.message || "Failed to save work experience. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (index) => {
    const work = workExperienceList[index];
    setFormData({
      designation4: {
        id: work.designation4,
        name: getDesignationNameById(work.designation4),
      },
      organisation4: work.organisation4,
      employmenttype4: work.employmenttype4,
      gotFromInternph4: work.gotFromInternph4,
      startdate4: work.startdate4,
      enddate4: work.enddate4 || "",
      currentlyworking4: work.currentlyworking4,
      location4: work.location4,
      remote4: work.remote4,
      skills4: work.skills4,
      description4: work.description4,
      files4: work.files4,
    });
    setShowForm(true);
    setEditingIndex(index);
  };

  const handleRemove = async (index) => {
    try {
      setIsProcessing(true);
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Please log in to remove work experience.");
      }
      const user = JSON.parse(userString);
      const userId = user.userid;

      const updatedList = workExperienceList.filter((_, i) => i !== index);
      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.workexperience2": updatedList,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setWorkExperienceList(updatedList);
      const isCompleted = updatedList.length > 0;
      setIsFirstSaveSuccessful(isCompleted);
      if (updateCompletionStatus) {
        updateCompletionStatus("Work Experience", isCompleted);
      }
      toast.success("Work experience removed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Failed to remove work experience:", err);
      toast.error(err.message || "Failed to remove work experience. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async (index) => {
    try {
      setIsProcessing(true);
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Please log in to delete file.");
      }
      const user = JSON.parse(userString);
      const userId = user.userid;

      const updatedList = [...workExperienceList];
      updatedList[index].files4 = "";
      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.workexperience2": updatedList,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setWorkExperienceList(updatedList);
      toast.success("File deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("File deletion error:", err);
      toast.error(err.message || "Failed to delete file.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFileFromForm = () => {
    setFormData((prev) => ({ ...prev, files4: "" }));
    toast.info("File removed from form.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word file.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      const userString = localStorage.getItem("user");
      if (!userString) {
        throw new Error("Please log in to upload files.");
      }
      const user = JSON.parse(userString);
      const userId = user.userid;

      const response = await uploadAndStoreFile({
        appName: "app8657281202648",
        moduleName: "appuser",
        file,
        userId,
      });

      if (!response || !response.filePath) {
        throw new Error("Failed to upload file: No file path returned.");
      }

      setFormData((prev) => ({ ...prev, files4: response.filePath }));
      toast.success("File uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("File upload error:", err);
      toast.error(err.message || "Failed to upload file.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsProcessing(false);
      e.target.value = null;
    }
  };

  const resetForm = () => {
    setFormData({
      designation4: { id: "", name: "" },
      organisation4: "",
      employmenttype4: "",
      gotFromInternph4: false,
      startdate4: "",
      enddate4: "",
      currentlyworking4: false,
      location4: "",
      remote4: false,
      skills4: [],
      description4: "",
      files4: "",
    });
    setSkillInput("");
    setInstituteInput("");
    setFilteredSkills([]);
    setFilteredNames([]);
    setIsSkillsDropdownOpen(false);
    setIsInstitutesDropdownOpen(false);
    setShowDropdown(false);
    setSelectedFile(null);
  };

  const getDesignationNameById = (id) => {
    const designation = designations.find((d) => d.id === id);
    return designation ? designation.name : "";
  };

  const getSkillNameById = (id) => {
    const skill = allSkills.find((s) => s.id === id);
    return skill ? skill.name : "";
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}

      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>Work Experience</span>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              setEditingIndex(null);
            }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            disabled={isProcessing}
          >
            <Plus size={16} />
            Add Work Experience
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {isProcessing && !showForm ? (
          <p className="text-gray-500">Loading work experience...</p>
        ) : showForm ? (
          <div className="space-y-4">
            <div className="relative" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <div
                className="border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer"
                onClick={() => !isProcessing && setShowDropdown(!showDropdown)}
              >
                <span>
                  {formData.designation4.name || "Select Designation"}
                </span>
                <ChevronDown size={16} />
              </div>
              {showDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {designations.map((designation) => (
                    <button
                      key={designation.id}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        handleChange("designation4", designation);
                        setShowDropdown(false);
                      }}
                      disabled={isProcessing}
                    >
                      {designation.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organisation <span className="text-red-500">*</span>
              </label>
              <input
                ref={instituteInputRef}
                type="text"
                placeholder="Organisation"
                value={instituteInput}
                onChange={(e) => handleInstituteInputChange(e.target.value)}
                onFocus={() =>
                  instituteInput.trim() &&
                  filteredInstituteNames.length > 0 &&
                  setIsInstitutesDropdownOpen(true)
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isProcessing}
              />
              {isInstitutesDropdownOpen && filteredInstituteNames.length > 0 && (
                <div
                  ref={instituteDropdownRef}
                  className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto"
                >
                  {filteredInstituteNames.map((name) => (
                    <button
                      key={name}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      onClick={() => handleInstituteSelect(name)}
                      disabled={isProcessing}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employmenttype4}
                onChange={(e) => handleChange("employmenttype4", e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isProcessing}
              >
                <option value="">Select Employment Type</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formData.gotFromInternph4}
                onChange={() => handleCheckboxChange("gotFromInternph4")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isProcessing}
              />
              Got this job from Internshp
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.startdate4}
                onChange={(e) => handleChange("startdate4", e.target.value)}
                min={minDate}
                max={today}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isProcessing}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formData.currentlyworking4}
                onChange={() => handleCheckboxChange("currentlyworking4")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isProcessing}
              />
              Currently Working
            </label>

            {!formData.currentlyworking4 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.enddate4}
                  onChange={(e) => handleChange("enddate4", e.target.value)}
                  min={formData.startdate4 || minDate}
                  max={today}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                  disabled={isProcessing}
                />
              </div>
            )}

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Location"
                value={formData.location4}
                onChange={(e) => handleChange("location4", e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isProcessing}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={formData.remote4}
                onChange={() => handleCheckboxChange("remote4")}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isProcessing}
              />
              Remote
            </label>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills4.map((skillId) => {
                  const skill = allSkills.find((s) => s.id === skillId);
                  return skill ? (
                    <button
                      key={skillId}
                      onClick={() => !isProcessing && handleSkillRemove(skillId)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1 text-sm"
                      disabled={isProcessing}
                    >
                      {skill.name}
                      <span>✕</span>
                    </button>
                  ) : null;
                })}
              </div>
              <input
                ref={skillInputRef}
                type="text"
                placeholder="Search skills to add..."
                value={skillInput}
                onChange={(e) => handleSkillInputChange(e.target.value)}
                onFocus={() =>
                  skillInput.trim() &&
                  filteredSkills.length > 0 &&
                  setIsSkillsDropdownOpen(true)
                }
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isProcessing}
              />
              {isSkillsDropdownOpen && filteredSkills.length > 0 && (
                <div
                  ref={skillDropdownRef}
                  className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto"
                >
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill.id}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                      onClick={() => !isProcessing && handleSkillSelect(skill)}
                      disabled={isProcessing}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={formData.description4}
                onChange={(e) => handleChange("description4", e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                rows={5}
                disabled={isProcessing}
              />
            </div>

            <div>
              {formData.files4 ? (
                <div className="border rounded-md p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AiFillFilePdf className="text-red-500 text-lg" />
                    <a
                      href={formData.files4}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[80%]"
                    >
                      {formData.files4.split("/").pop()}
                    </a>
                  </div>
                  <button
                    onClick={() => !isProcessing && handleRemoveFileFromForm()}
                    className="text-red-600 hover:text-red-800"
                    disabled={isProcessing}
                  >
                    <MdDelete />
                  </button>
                </div>
              ) : (
                <label htmlFor="workFileUpload" className="cursor-pointer block">
                  <div className="border-dashed border-2 border-gray-300 rounded-md px-4 py-6 text-center text-gray-600">
                    <span className="text-xl">+</span> Attachments
                  </div>
                  <input
                    type="file"
                    id="workFileUpload"
                    className="hidden"
                    accept=".doc,.docx,.pdf"
                    onChange={(e) => {
                      handleFileUpload(e);
                      setShowDropdown(false);
                    }}
                    disabled={isProcessing}
                  />
                </label>
              )}
            </div>

            <button
              type="button"
              className="flex items-center gap-2 border rounded-full px-4 py-2 text-blue-600 border-blue-600 hover:bg-blue-50 w-fit"
              disabled={isProcessing}
            >
              <span aria-label="sparkle">🔮</span> Generate with AI
            </button>

            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex justify-end">
                <div
                  className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={() => !isProcessing && handleSave()}
                  aria-label={
                    editingIndex !== null
                      ? "Update Work Experience"
                      : "Save Work Experience"
                  }
                >
                  <span className="text-lg">✓</span>
                  <span>
                    {isProcessing
                      ? "Saving..."
                      : editingIndex !== null
                      ? "Update"
                      : "Save"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Saved Work Experience
            </p>
            {workExperienceList.length === 0 ? (
              <p className="text-gray-600">
                No work experience details saved yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {workExperienceList.map((work, index) => (
                  <div
                    key={`work-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {work.organisation4?.charAt(0) || "W"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {work.organisation4}
                          </p>
                          <p className="text-sm text-gray-600">
                            {getDesignationNameById(work.designation4)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {work.employmenttype4}
                          </p>
                          {work.gotFromInternph4 && (
                            <p className="text-sm text-gray-600">
                              Got this job from Internshp
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {`${work.startdate4} - ${
                                work.currentlyworking4
                                  ? "Present"
                                  : work.enddate4
                              }`}
                            </p>
                          </div>
                          {work.location4 && (
                            <p className="text-sm text-gray-600">
                              Location: {work.location4}
                            </p>
                          )}
                          {work.remote4 && (
                            <p className="text-sm text-gray-600">Remote</p>
                          )}
                          {work.skills4.length > 0 && (
                            <p className="text-sm text-gray-600">
                              Skills:{" "}
                              {work.skills4
                                .map((id) => getSkillNameById(id))
                                .join(", ")}
                            </p>
                          )}
                          {work.description4 && (
                            <p className="text-sm text-gray-600">
                              Description: {work.description4}
                            </p>
                          )}
                          {work.files4 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf
                                className="text-red-500 text-lg"
                                aria-label="PDF file icon"
                              />
                              <a
                                href={work.files4}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {work.files4.split("/").pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() => !isProcessing && handleDeleteFile(index)}
                                title="Delete File"
                                aria-label="Delete File"
                                disabled={isProcessing}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() => !isProcessing && handleEdit(index)}
                          disabled={isProcessing}
                          aria-label="Edit Work Experience"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() => !isProcessing && handleRemove(index)}
                          disabled={isProcessing}
                          aria-label="Delete Work Experience"
                        />
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkExperience;