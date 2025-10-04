import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchSectionData, mUpdate } from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCrosshairs } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import Select from "react-select";

const EditInternship = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    time: "Remote",
    salary: "",
    description: "",
    subtype: "",
    experiencelevel: "",
    applicationdeadline: "",
    internshipduration: "",
    skillsrequired: [],
    applicationinstructions: "",
    keyResponsibilities: "",
    professionalSkills: "",
    degree: [],
    company: "",
    logo: "",
    published: true,
    createdDate: "", // Preserve createdDate
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [mapsScriptLoaded, setMapsScriptLoaded] = useState(false);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const degreeOptions = [
    "B.Tech",
    "B.Sc",
    "B.Com",
    "BBA",
    "MBA",
    "M.Tech",
    "M.Sc",
    "Ph.D",
  ];
  const experienceLevelOptions = [
    "No-experience",
    "Fresher",
    "Intermediate",
    "Expert",
  ];
  const internshipTypeOptions = [
    "Remote",
    "Onsite",
    "Hybrid",
    "Part-time",
    "Full-time",
  ];

  // Validation regex
  const salaryRegex = /^\d*$/;
  const durationRegex = /^\d*$/;

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps Script
  const loadGoogleMapsScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapsScriptLoaded(true);
        resolve(true);
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setMapsScriptLoaded(true);
          resolve(true);
        });
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapsScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        reject(new Error("Failed to load Google Maps API"));
      };
      document.head.appendChild(script);
    });
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize Autocomplete after script and input are ready
  const initializeAutocomplete = useCallback(() => {
    if (!locationInputRef.current || !window.google?.maps?.places || !mapsScriptLoaded) {
      return false;
    }

    try {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ["(cities)"],
          fields: ["formatted_address", "name", "geometry"],
          componentRestrictions: { country: "ph" },
          strictBounds: false,
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        let newLocation = formData.location;
        if (place.geometry) {
          newLocation = place.formatted_address || place.name || formData.location;
        } else {
          newLocation = locationInputRef.current.value.trim();
        }
        setFormData((prev) => ({ ...prev, location: newLocation }));
      });

      return true;
    } catch (err) {
      console.error("Error initializing Google Maps Autocomplete:", err);
      toast.error("Failed to initialize location suggestions.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      return false;
    }
  }, [mapsScriptLoaded, formData.location]);

  // Fetch all data using separate calls
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Fetch internship data with full projection
        const internshipResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "jobpost",
          query: {
            _id: id,
            companyId: user.companyId,
          },
          projection: {}, // Fetch all fields
        });

        if (!internshipResponse || internshipResponse.length === 0) {
          throw new Error("Internship not found or access denied");
        }

        const internship = internshipResponse[0];
        const jobpost = internship.sectionData?.jobpost || {};

        // Process skillsrequired safely
        let skillsArray = [];
        if (typeof jobpost.skillsrequired === "string" && jobpost.skillsrequired.trim()) {
          skillsArray = jobpost.skillsrequired
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0)
            .map((skill) => ({ label: skill, value: skill }));
        } else if (Array.isArray(jobpost.skillsrequired)) {
          skillsArray = jobpost.skillsrequired
            .filter((skill) => typeof skill === "string" && skill.trim().length > 0)
            .map((skill) => ({ label: skill.trim(), value: skill.trim() }));
        }

        // Set initial form data, preserving all fields
        const initialFormData = {
          title: jobpost.title || "",
          location: jobpost.location || "",
          time: jobpost.time || "Remote",
          salary: (jobpost.salary || "").replace(" PHP", "").replace(/[^\d]/g, "") || "",
          description: jobpost.description || "",
          subtype: jobpost.subtype || "",
          experiencelevel: jobpost.experiencelevel || "",
          applicationdeadline: jobpost.applicationdeadline || "",
          internshipduration: (jobpost.internshipduration || "").replace(/ month(s)?/, "").replace(/[^\d]/g, "") || "",
          skillsrequired: skillsArray,
          applicationinstructions: jobpost.applicationinstructions || "",
          keyResponsibilities: jobpost.keyResponsibilities || "",
          professionalSkills: jobpost.professionalSkills || "",
          degree: Array.isArray(jobpost.degree) ? jobpost.degree : [],
          company: jobpost.company || "",
          logo: jobpost.logo || "https://placehold.co/40x40",
          published: jobpost.published !== false,
          createdDate: internship.createdDate || "", // Preserve createdDate
        };

        setFormData(initialFormData);

        // 2. Fetch company data if not in jobpost
        if (!initialFormData.company) {
          const companyResponse = await fetchSectionData({
            dbName: "internph",
            collectionName: "company",
            query: { _id: user.companyId },
            projection: {
              "sectionData.Company.organizationName": 1,
              "sectionData.Company.logoImage": 1,
            },
            limit: 1,
          });

          if (companyResponse.length > 0) {
            const companyData = companyResponse[0].sectionData?.Company || {};
            setFormData((prev) => ({
              ...prev,
              company: companyData.organizationName || prev.company,
              logo: companyData.logoImage || prev.logo,
            }));
          }
        }

        // 3. Fetch categories
        const categoryResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "category",
          query: {},
          projection: {
            _id: 1,
            "sectionData.category.titleofinternship": 1,
          },
        });

        if (Array.isArray(categoryResponse) && categoryResponse.length > 0) {
          const categories = categoryResponse
            .map((item) => ({
              _id: item._id.toString(),
              titleofinternship: item.sectionData?.category?.titleofinternship || "",
            }))
            .filter(cat => cat.titleofinternship.trim())
            .sort((a, b) => a.titleofinternship.localeCompare(b.titleofinternship));
          setCategoryData(categories);

          // Validate subtype
          if (initialFormData.subtype && !categories.some(cat => cat._id === initialFormData.subtype)) {
            console.warn("Invalid subtype, resetting:", initialFormData.subtype);
            setFormData(prev => ({ ...prev, subtype: categories[0]?._id || "" }));
          }
        } else {
          console.warn("No categories found");
          setCategoryData([]);
        }

        // 4. Fetch skills
        const skillsResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "skills",
          query: { "sectionData.skills.showinsuggestions": true },
          projection: { _id: 1, "sectionData.skills.name": 1 },
          limit: 100,
        });

        if (Array.isArray(skillsResponse) && skillsResponse.length > 0) {
          const skillsOptions = skillsResponse
            .map((item) => ({
              value: item._id.toString(),
              label: item.sectionData?.skills?.name?.trim() || "",
            }))
            .filter(skill => skill.label);
          setSkillsData(skillsOptions);

          const updatedSkills = skillsArray.map(skill => {
            const matchedSkill = skillsOptions.find(option => option.label.toLowerCase() === skill.label.toLowerCase());
            return matchedSkill || { value: skill.value, label: skill.label };
          });
          setFormData(prev => ({ ...prev, skillsrequired: updatedSkills }));
        } else {
          console.warn("No skills found");
          setSkillsData([]);
        }

      } catch (err) {
        setError("Error fetching data: " + err.message);
        console.error("EditInternship Fetch Error:", err);
        toast.error("Failed to load internship data: " + err.message, {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user.role === "company" && user.companyId && id) {
      fetchData();
    } else {
      const errorMsg = !user.companyId
        ? "Company ID is missing. Please log in again."
        : !id
        ? "Internship ID is missing"
        : "Unauthorized access";
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      if (!user.companyId) {
        navigate("/login");
      }
    }
  }, [id, user.companyId, user.role, navigate]);

  // Load Google Maps and initialize autocomplete only once
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        const timer = setTimeout(() => {
          const initialized = initializeAutocomplete();
          if (!initialized) {
            const retryTimer = setTimeout(initializeAutocomplete, 500);
            return () => clearTimeout(retryTimer);
          }
        }, 200);
        return () => clearTimeout(timer);
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        toast.error(
          "Google Maps API failed to load. Please type the location manually.",
          {
            position: "top-right",
            autoClose: 5000,
            theme: "light",
          }
        );
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [loadGoogleMapsScript, initializeAutocomplete]);

  const handleChange = (e) => {
    if (e.target) {
      const { name, value } = e.target;
      if (name === "salary") {
        if (!salaryRegex.test(value)) return;
      }
      if (name === "internshipduration") {
        const numericValue = value.replace(/[^\d]/g, '');
        if (value !== numericValue) {
          setFormData((prev) => ({ ...prev, [name]: numericValue }));
          return;
        }
        if (!durationRegex.test(value)) return;
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationBlur = () => {
    if (locationInputRef.current) {
      const currentValue = locationInputRef.current.value.trim();
      if (currentValue !== formData.location) {
        setFormData((prev) => ({ ...prev, location: currentValue }));
      }
    }
  };

  const handleEditorChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

  const handleDegreeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      let updatedDegrees = [...prev.degree];
      if (checked) {
        if (!updatedDegrees.includes(value)) {
          updatedDegrees.push(value);
        }
      } else {
        updatedDegrees = updatedDegrees.filter((deg) => deg !== value);
      }
      return { ...prev, degree: updatedDegrees };
    });
  };

  const handleSkillsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      skillsrequired: selectedOptions || [],
    }));
  };

  const validateSalary = (salary) => {
    if (!salary || salary.trim() === "") return "Not specified";
    const cleanSalary = salary.trim();
    return salaryRegex.test(cleanSalary) ? `${cleanSalary} PHP` : "Not specified";
  };

  const validateLocation = (location) => {
    if (!location || location.trim() === "") {
      console.warn("Location validation failed: empty");
      return null;
    }
    const trimmed = location.trim();
    if (trimmed.length < 2) {
      console.warn("Location too short:", trimmed);
      return null;
    }
    return trimmed;
  };

  const validateDuration = (duration) => {
    if (!duration || duration.trim() === "") return null;
    const cleanDuration = duration.trim();
    return durationRegex.test(cleanDuration)
      ? `${cleanDuration} month${parseInt(cleanDuration) === 1 ? "" : "s"}`
      : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const requiredFields = [
      { key: "title", msg: "Internship title is required." },
      { key: "company", msg: "Company name is required." },
      { key: "location", msg: "Valid location is required.", validator: validateLocation },
      { key: "time", msg: "Internship type is required.", check: (v) => v && internshipTypeOptions.includes(v) },
      { key: "description", msg: "Description is required.", check: (v) => v && v.trim() },
      { key: "subtype", msg: "Category is required." },
      { key: "experiencelevel", msg: "Experience level is required." },
      { key: "applicationdeadline", msg: "Application deadline is required." },
      { key: "internshipduration", msg: "Valid internship duration is required.", validator: validateDuration },
      { key: "keyResponsibilities", msg: "Key responsibilities are required.", check: (v) => v && v.trim() },
      { key: "professionalSkills", msg: "Professional skills are required.", check: (v) => v && v.trim() },
    ];

    for (const field of requiredFields) {
      const value = formData[field.key];
      const valid = field.validator ? field.validator(value) : field.check ? field.check(value) : !!value;
      if (!valid) {
        toast.error(field.msg, { position: "top-right", theme: "light" });
        return;
      }
    }

    if (formData.degree.length === 0) {
      toast.error("At least one degree is required.", { position: "top-right", theme: "light" });
      return;
    }

    if (!experienceLevelOptions.includes(formData.experiencelevel)) {
      toast.error("Invalid experience level selected.", { position: "top-right", theme: "light" });
      return;
    }

    if (!categoryData.some((category) => category._id === formData.subtype)) {
      toast.error("Invalid category selected.", { position: "top-right", theme: "light" });
      return;
    }

    if (!internshipTypeOptions.includes(formData.time)) {
      toast.error("Invalid internship type selected.", { position: "top-right", theme: "light" });
      return;
    }

    setLoading(true);
    try {
      const validatedLocation = validateLocation(formData.location);
      if (!validatedLocation) {
        toast.error("Please enter a valid location (at least 2 characters).", { position: "top-right", theme: "light" });
        setLoading(false);
        return;
      }

      const jobpostData = {
        sectionData: {
          jobpost: {
            title: formData.title.trim(),
            company: formData.company.trim(),
            type: "Internship",
            time: formData.time,
            location: validatedLocation,
            salary: validateSalary(formData.salary),
            subtype: formData.subtype,
            experiencelevel: formData.experiencelevel,
            applicationdeadline: formData.applicationdeadline,
            internshipduration: validateDuration(formData.internshipduration),
            skillsrequired: formData.skillsrequired
              .map((skill) => skill.label)
              .filter(Boolean)
              .join(", "),
            applicationinstructions: formData.applicationinstructions || "",
            description: formData.description,
            logo: formData.logo,
            keyResponsibilities: formData.keyResponsibilities,
            professionalSkills: formData.professionalSkills,
            degree: formData.degree,
            published: formData.published,
            companyId: user.companyId,
            createdDate: formData.createdDate, // Preserve createdDate
            applicants: formData.applicants || [], // Preserve applicants if any
          },
        },
      };

     

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "jobpost",
        query: { _id: id, companyId: user.companyId },
        update: { $set: jobpostData },
        options: { upsert: false },
      });

      if (response.success) {
        toast.success("Internship updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
        navigate("/manage-internships");
      } else {
        toast.error(response.message || "Failed to update internship.", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
        });
      }
    } catch (err) {
      console.error("Update Internship Error:", err);
      toast.error(err.message || "Failed to update internship. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading internship data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/manage-internships")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Internships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Edit Internship
        </h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Software Engineering Intern"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
                {mapsScriptLoaded ? (
                  <span className="text-xs text-green-600 ml-1">Suggestions available</span>
                ) : (
                  <span className="text-xs text-yellow-600 ml-1">Loading suggestions...</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleLocationBlur}
                  ref={locationInputRef}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Manila, Philippines"
                  required
                />
                <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Type <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>
                  Select Internship Type
                </option>
                {internshipTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 10000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  PHP
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="applicationdeadline"
                value={formData.applicationdeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internship Duration (Months) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="internshipduration"
                  value={formData.internshipduration}
                  onChange={handleChange}
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 3"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  months
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={categoryData.length === 0}
              >
                <option value="" disabled>
                  {categoryData.length === 0 ? "Loading categories..." : "Select Category"}
                </option>
                {categoryData.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.titleofinternship.charAt(0).toUpperCase() +
                      category.titleofinternship.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              {categoryData.length === 0 && !loading && (
                <p className="text-xs text-gray-500 mt-1">No categories available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experiencelevel"
                value={formData.experiencelevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>
                  Select Experience Level
                </option>
                {experienceLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills Required <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                name="skillsrequired"
                options={skillsData}
                value={formData.skillsrequired}
                onChange={handleSkillsChange}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder={skillsData.length === 0 ? "Loading skills..." : "Search and select skills..."}
                isDisabled={skillsData.length === 0 && !loading}
                isSearchable={true}
                isClearable={true}
              />
              {skillsData.length === 0 && !loading && (
                <p className="text-xs text-gray-500 mt-1">No skills available</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eligible Degrees <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-2 max-h-32 overflow-y-auto p-1">
                {degreeOptions.map((degree) => (
                  <label key={degree} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={degree}
                      checked={formData.degree.includes(degree)}
                      onChange={handleDegreeChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{degree}</span>
                  </label>
                ))}
              </div>
              {formData.degree.length === 0 && (
                <p className="text-xs text-red-500 mt-1">Please select at least one degree</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Responsibilities <span className="text-red-500">*</span>
              </label>
              <MDEditor
                value={formData.keyResponsibilities}
                onChange={(value) => handleEditorChange(value, "keyResponsibilities")}
                preview="edit"
                height={200}
                toolbar={["bold", "italic", "underline", "list-unordered", "list-ordered"]}
                data-color-mode="light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Skills <span className="text-red-500">*</span>
              </label>
              <MDEditor
                value={formData.professionalSkills}
                onChange={(value) => handleEditorChange(value, "professionalSkills")}
                preview="edit"
                height={200}
                toolbar={["bold", "italic", "underline", "list-unordered", "list-ordered"]}
                data-color-mode="light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <MDEditor
                value={formData.description}
                onChange={(value) => handleEditorChange(value, "description")}
                preview="edit"
                height={200}
                toolbar={["bold", "italic", "underline", "list-unordered", "list-ordered"]}
                data-color-mode="light"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Instructions (Optional)
              </label>
              <MDEditor
                value={formData.applicationinstructions}
                onChange={(value) => handleEditorChange(value, "applicationinstructions")}
                preview="edit"
                height={150}
                toolbar={["bold", "italic", "underline", "list-unordered", "list-ordered"]}
                data-color-mode="light"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || categoryData.length === 0 || skillsData.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/manage-internships")}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
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

export default EditInternship;