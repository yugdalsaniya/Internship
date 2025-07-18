import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { addGeneralData, fetchSectionData, mUpdate } from "../../Utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCrosshairs } from "react-icons/fa";
import MDEditor from "@uiw/react-md-editor";
import Select from "react-select";

const PostInternshipForm = () => {
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
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const navigate = useNavigate();
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

  // Fetch company data and skills
  useEffect(() => {
    const fetchCompanyAndSkills = async () => {
      try {
        setCategoryLoading(true);
        setSkillsLoading(true);

        // Fetch company data
        const companyResponse = await fetchSectionData({
          collectionName: "company",
          query: { _id: user.companyId },
          projection: {
            "sectionData.Company.organizationName": 1,
            "sectionData.Company.logoImage": 1,
          },
          limit: 1,
        });

        if (companyResponse.length > 0) {
          setFormData((prev) => ({
            ...prev,
            company: companyResponse[0].sectionData.Company.organizationName,
            logo:
              companyResponse[0].sectionData.Company.logoImage ||
              "https://placehold.co/40x40",
          }));
        } else {
          toast.error("Failed to fetch company data.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }

        // Fetch categories
        const categoryResponse = await fetchSectionData({
          collectionName: "category",
          query: {},
          projection: {
            _id: 1,
            "sectionData.category.titleofinternship": 1,
          },
          limit: 0,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.category.titleofinternship",
        });

        if (Array.isArray(categoryResponse) && categoryResponse.length > 0) {
          setCategoryData(
            categoryResponse
              .map((item) => ({
                _id: item._id,
                titleofinternship: item.sectionData.category.titleofinternship,
              }))
              .sort((a, b) =>
                a.titleofinternship.localeCompare(b.titleofinternship)
              )
          );
        } else {
          toast.error("No categories found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }

        // Fetch skills
        const skillsResponse = await fetchSectionData({
          collectionName: "skills",
          query: { "sectionData.skills.showinsuggestions": true },
          projection: { "sectionData.skills.name": 1, _id: 1 },
          limit: 100,
          skip: 0,
          order: 1,
          sortedBy: "sectionData.skills.name",
        });

        if (Array.isArray(skillsResponse) && skillsResponse.length > 0) {
          setSkillsData(
            skillsResponse.map((item) => ({
              value: item._id,
              label: item.sectionData.skills.name,
            }))
          );
        } else {
          toast.error("No skills found.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to fetch data. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } finally {
        setCategoryLoading(false);
        setSkillsLoading(false);
      }
    };

    if (user.companyId) {
      fetchCompanyAndSkills();
    }
  }, [user.companyId]);

  // Google Maps Autocomplete
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
          resolve();
          return;
        }
        const existingScript = document.querySelector(
          'script[src*="maps.googleapis.com/maps/api/js"]'
        );
        if (existingScript) {
          existingScript.addEventListener("load", resolve);
          return;
        }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Google Maps API"));
        document.head.appendChild(script);
      });
    };

    loadGoogleMapsScript()
      .then(() => {
        if (!window.google?.maps?.places) {
          console.error("Google Maps places library not loaded");
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
          const newLocation = place.formatted_address || place.name || "";
          setFormData((prevFormData) => ({
            ...prevFormData,
            location: newLocation,
          }));
        });
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        toast.error(
          "Google Maps API failed to load. Location suggestions unavailable.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          }
        );
        setTimeout(() => setError(""), 3000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    if (user.role !== "company" || !user.companyId) {
      navigate("/login");
    }
  }, [user.role, user.companyId, navigate]);

  const handleChange = (e) => {
    // Handle standard HTML inputs
    if (e.target) {
      const { name, value } = e.target;
      if (name === "salary" && !salaryRegex.test(value)) {
        return;
      }
      if (name === "internshipduration" && !durationRegex.test(value)) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (value, name) => {
    // Handle MDEditor inputs
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
        updatedDegrees.push(value);
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
    return salaryRegex.test(salary) ? `${salary} PHP` : "Not specified";
  };

  const validateLocation = (location) => {
    if (!location || location.trim() === "") return null;
    return location;
  };

  const validateDuration = (duration) => {
    if (!duration || duration.trim() === "") return null;
    return durationRegex.test(duration)
      ? `${duration} month${duration === "1" ? "" : "s"}`
      : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!user.companyId) {
      toast.error("Company ID is missing. Please log in again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      navigate("/login");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Internship title is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.company) {
      toast.error("Company name could not be fetched.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!validateLocation(formData.location)) {
      toast.error("Valid location is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.subtype) {
      toast.error("Category is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!categoryData.some((category) => category._id === formData.subtype)) {
      toast.error("Invalid category selected.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.experiencelevel) {
      toast.error("Experience level is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!experienceLevelOptions.includes(formData.experiencelevel)) {
      toast.error("Invalid experience level selected.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.applicationdeadline) {
      toast.error("Application deadline is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!validateDuration(formData.internshipduration)) {
      toast.error("Valid internship duration is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.keyResponsibilities.trim()) {
      toast.error("Key responsibilities are required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (!formData.professionalSkills.trim()) {
      toast.error("Professional skills are required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }
    if (formData.degree.length === 0) {
      toast.error("At least one degree is required.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setLoading(false);
      return;
    }

    try {
      // Format the current date in 'dd/MM/yyyy, h:mm:ss a' format
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const jobpostData = {
        sectionData: {
          jobpost: {
            title: formData.title,
            company: formData.company,
            type: "Internship",
            time: formData.time,
            location: formData.location,
            salary: validateSalary(formData.salary),
            subtype: formData.subtype,
            experiencelevel: formData.experiencelevel,
            applicationdeadline: formData.applicationdeadline,
            internshipduration: validateDuration(formData.internshipduration),
            skillsrequired: formData.skillsrequired
              .map((skill) => skill.label)
              .join(", "),
            applicationinstructions: formData.applicationinstructions,
            description: formData.description,
            logo: formData.logo,
            keyResponsibilities: formData.keyResponsibilities,
            professionalSkills: formData.professionalSkills,
            degree: formData.degree,
          },
        },
        createdBy: user.companyId,
        companyId: user.companyId,
        createdDate: formattedDate,
      };

      const response = await addGeneralData({
        dbName: "internph",
        collectionName: "jobpost",
        data: jobpostData,
      });

      if (response.success) {
        try {
          const categoryResponse = await fetchSectionData({
            collectionName: "category",
            query: { _id: formData.subtype },
            projection: { "sectionData.category.numberofinternships": 1 },
            limit: 1,
          });

          if (categoryResponse.length === 0) {
            throw new Error(
              `Category with ID '${formData.subtype}' not found.`
            );
          }

          const currentCount =
            parseInt(
              categoryResponse[0].sectionData.category.numberofinternships,
              10
            ) || 0;
          const newCount = currentCount + 1;

          await mUpdate({
            appName: "app8657281202648",
            collectionName: "category",
            query: { _id: formData.subtype },
            update: {
              $set: {
                "sectionData.category.numberofinternships": newCount.toString(),
              },
            },
            options: { upsert: false },
          });

          toast.success("Internship posted successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            onClose: () => navigate("/"),
          });
        } catch (updateError) {
          console.error("Error updating numberofinternships:", updateError);
          toast.error(
            "Internship posted, but failed to update category count.",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            }
          );
        }
      } else {
        toast.error(response.message || "Failed to post internship.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (err) {
      toast.error(
        err.message || "Failed to post internship. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        }
      );
      console.error("Post Internship Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== "company" || !user.companyId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          Post Internship Form
        </h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineering Intern"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  ref={locationInputRef}
                  className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Manila, Philippines"
                  required
                />
                <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Type <span className="text-red-500">*</span>
              </label>
              <select
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select Internship Type
                </option>
                {internshipTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Salary (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  PHP
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="subtype"
                value={formData.subtype}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={categoryLoading || categoryData.length === 0}
              >
                <option value="" disabled>
                  {categoryLoading
                    ? "Loading categories..."
                    : categoryData.length === 0
                    ? "No categories available"
                    : "Select Category"}
                </option>
                {categoryData.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.titleofinternship.charAt(0).toUpperCase() +
                      category.titleofinternship.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience Level <span className="text-red-500">*</span>
              </label>
              <select
                name="experiencelevel"
                value={formData.experiencelevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select Experience Level
                </option>
                {experienceLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level.replace("-", " ").charAt(0).toUpperCase() +
                      level.replace("-", " ").slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="applicationdeadline"
                value={formData.applicationdeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Internship Duration (Months){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="internshipduration"
                  value={formData.internshipduration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  / months
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
                placeholder="Search and select skills..."
                isLoading={skillsLoading}
                isDisabled={skillsLoading || skillsData.length === 0}
                isSearchable={true}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Degrees <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 mt-2">
                {degreeOptions.map((degree) => (
                  <label key={degree} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="degree"
                      value={degree}
                      checked={formData.degree.includes(degree)}
                      onChange={handleDegreeChange}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{degree}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Key Responsibilities <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.keyResponsibilities}
              onChange={(value) =>
                handleEditorChange(value, "keyResponsibilities")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Professional Skills <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.professionalSkills}
              onChange={(value) =>
                handleEditorChange(value, "professionalSkills")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <MDEditor
              value={formData.description}
              onChange={(value) => handleEditorChange(value, "description")}
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Application Instructions (Optional)
            </label>
            <MDEditor
              value={formData.applicationinstructions}
              onChange={(value) =>
                handleEditorChange(value, "applicationinstructions")
              }
              preview="edit"
              height={200}
              toolbar={[
                "bold",
                "italic",
                "underline",
                "list-unordered",
                "list-ordered",
              ]}
              data-color-mode="light"
              style={{ backgroundColor: "#ffffff" }}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={
                loading ||
                categoryLoading ||
                skillsLoading ||
                categoryData.length === 0 ||
                skillsData.length === 0
              }
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Internship"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/post-internship")}
              className="flex-1 border border-gray-400 text-gray-700 py-2 px-4 rounded-lg text-sm font-bold hover:bg-gray-100"
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
