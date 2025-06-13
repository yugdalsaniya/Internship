import { useState, useEffect, useRef } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { fetchSectionData, mUpdate, uploadAndStoreFile } from "../../Utils/api";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const OrganizationDetails = ({ onBack }) => {
  const [userData, setUserData] = useState({
    organizationName: "",
    description: "",
    organizationCity: "",
    industry: [],
    noOfEmployees: "",
    organizationLogo: null,
  });
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const industryOptions = [
    { value: "Technology", label: "Technology" },
    { value: "Finance", label: "Finance" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Education", label: "Education" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
  ];

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        if (!userString || !accessToken) {
          throw new Error("Please log in to view your details.");
        }

        let userId;
        try {
          const user = JSON.parse(userString);
          userId = user.companyId;
        } catch (parseError) {
          throw new Error("Invalid user data. Please log in again.");
        }

        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "company",
          query: { _id: userId },
          projection: { "sectionData.Company": 1, _id: 0 },
        });

        if (!response || (Array.isArray(response) && response.length === 0)) {
          throw new Error("Organization data not found. Please contact support.");
        }

        const companyData = Array.isArray(response)
          ? response[0]?.sectionData?.Company || {}
          : response.sectionData?.Company || {};

        setUserData({
          organizationName: companyData.organizationName || "",
          description: companyData.description || "",
          organizationCity: companyData.organizationcity || "",
          industry: Array.isArray(companyData.industry)
            ? companyData.industry
            : typeof companyData.industry === "string"
            ? companyData.industry.split(",").map((item) => item.trim())
            : [],
          noOfEmployees: companyData.noofemployees || "",
          organizationLogo: companyData.organizationlogo || null,
        });

        if (companyData.organizationlogo) {
          setLogoPreview(companyData.organizationlogo);
        }
      } catch (err) {
        setError(err.message || "Failed to load organization data.");
        toast.error(err.message || "Failed to load organization data.");
        console.error("Error fetching organization data:", err);
        setTimeout(() => setError(""), 5000);
      }
    };

    const loadGoogleMapsScript = () => {
      return new Promise((resolve) => {
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
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    fetchUserData();

    loadGoogleMapsScript().then(() => {
      if (locationInputRef.current && window.google?.maps?.places) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          { types: ["(cities)"], componentRestrictions: { country: "ph" } }
        );
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          setUserData((prev) => ({
            ...prev,
            organizationCity: place.formatted_address || "",
          }));
        });
      }
    }).catch((err) => {
      console.error("Error loading Google Maps:", err);
      toast.error("Location suggestions unavailable.");
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error("File size exceeds 3MB limit.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Only JPG and PNG formats are supported.");
        return;
      }
      setUserData((prev) => ({ ...prev, organizationLogo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    if (
      !userData.organizationName ||
      !userData.organizationCity ||
      userData.industry.length === 0 ||
      !userData.noOfEmployees
    ) {
      return "Please fill all required fields.";
    }
    return "";
  };

  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setTimeout(() => setError(""), 5000);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const userString = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!userString || !accessToken) {
        throw new Error("Please log in to save your details.");
      }

      let userId;
      try {
        const user = JSON.parse(userString);
        userId = user.companyId;
      } catch (parseError) {
        throw new Error("Invalid user data. Please log in again.");
      }

      const existingUser = await fetchSectionData({
        dbName: "internph",
        collectionName: "company",
        query: { _id: userId },
      });

      if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
        throw new Error("User not found in database. Please sign up or contact support.");
      }

      let uploadedFilePath = userData.organizationLogo;
      if (userData.organizationLogo instanceof File) {
        // Upload the logo using uploadAndStoreFile
        const uploadResponse = await uploadAndStoreFile({
          appName: "app8657281202648",
          moduleName: "company",
          file: userData.organizationLogo,
          userId,
        });

        uploadedFilePath = uploadResponse?.filePath || uploadResponse?.fileUrl || uploadResponse?.data?.fileUrl;
        if (!uploadedFilePath) {
          throw new Error("Failed to upload logo: No file path returned in response.");
        }
      }

      // Prepare the update object
      const updateData = {
        "sectionData.Company.organizationName": userData.organizationName,
        "sectionData.Company.description": userData.description,
        "sectionData.Company.organizationcity": userData.organizationCity,
        "sectionData.Company.industry": userData.industry,
        "sectionData.Company.noofemployees": userData.noOfEmployees,
        "sectionData.Company.lastUpdated": new Date().toISOString(),
      };

      if (uploadedFilePath && uploadedFilePath !== userData.organizationLogo) {
        updateData["sectionData.Company.organizationlogo"] = uploadedFilePath;
      }

      // Update the database
      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "company",
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });

      if (response && response.success) {
        if (response.matchedCount === 0) {
          throw new Error("Failed to update organization details: User not found.");
        }
        toast.success("Organization details updated successfully!");
        if (uploadedFilePath && uploadedFilePath !== userData.organizationLogo) {
          setUserData((prev) => ({ ...prev, organizationLogo: uploadedFilePath }));
          setLogoPreview(uploadedFilePath);
        }
      } else {
        throw new Error("Failed to update organization details in database.");
      }
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        setTimeout(() => onBack(), 2000);
      } else if (err.message.includes("User not found")) {
        errorMessage = "User not found in database. Please sign up or contact support.";
        setTimeout(() => {
          setError("");
          onBack();
        }, 2000);
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating organization details:", err);
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          <BiTime className="text-gray-600 text-xl" />
          Organization Details
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organizationName"
            value={userData.organizationName}
            onChange={handleInputChange}
            placeholder="Organization Name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Organization Description</p>
          <textarea
            name="description"
            value={userData.description}
            onChange={handleInputChange}
            placeholder="Describe your Organization here..."
            rows={5}
            className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Organization City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="organization-city"
              ref={locationInputRef}
              type="text"
              name="organizationCity"
              value={userData.organizationCity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your location"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Industry <span className="text-red-500">*</span>
          </label>
          <Select
            isMulti
            options={industryOptions}
            value={industryOptions.filter((option) =>
              userData.industry.includes(option.value)
            )}
            onChange={(selected) =>
              setUserData((prev) => ({
                ...prev,
                industry: selected ? selected.map((item) => item.value) : [],
              }))
            }
            styles={customSelectStyles}
            isDisabled={isProcessing}
            placeholder="Select industries..."
            menuPortalTarget={document.body}
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            No. of Employees <span className="text-red-500">*</span>
          </label>
          <select
            name="noOfEmployees"
            value={userData.noOfEmployees}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          >
            <option value="" disabled>
              Select number of employees
            </option>
            <option value="1-10">1-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="501+">501+</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-sm text-gray-700">
            Organization Logo
          </label>
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50">
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              id="logo-upload"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <label
              htmlFor="logo-upload"
              className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              Upload Logo
            </label>
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo Preview" className="h-16 w-40 object-contain rounded" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG. Max size: 3MB
            </p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-between">
          <button
            className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50"
            onClick={onBack}
            disabled={isProcessing}
          >
            <RxCross2 className="text-gray-600" />
            Discard
          </button>

          <button
            className="flex items-center gap-2 bg-blue-500 rounded-3xl px-4 py-2 text-white hover:bg-blue-600 transition disabled:opacity-50"
            onClick={handleSave}
            disabled={isProcessing}
          >
            <IoCheckmark />
            {isProcessing ? "Processing..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;