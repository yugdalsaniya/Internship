import { useState, useEffect, useRef } from "react";
import { BiTime } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { FaCrosshairs, FaCheckCircle } from "react-icons/fa"; // Added FaCheckCircle
import { fetchSectionData, mUpdate } from "../../Utils/api";
import { toast } from "react-toastify";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const CompanyDetails = ({ userData, updateCompletionStatus, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    cdesignation: "",
    mobile: "",
    location: "",
  });
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); // Added to track completion
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("Google Maps API key is missing.");
      setError("Location suggestions unavailable. API key is missing.");
      setTimeout(() => setError(null), 5000);
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
          setFormData((prev) => ({
            ...prev,
            location: place.formatted_address || place.name || "",
          }));
        });
      })
      .catch((err) => {
        console.error("Error loading Google Maps:", err);
        setError(
          "Google Maps API failed to load. Location suggestions unavailable."
        );
        setTimeout(() => setError(null), 5000);
      });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (typeof window === "undefined") return;

        const userString = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        if (!userString || !accessToken) {
          setError("Please log in to view your details.");
          toast.error("Please log in to view your details.");
          setTimeout(() => setError(null), 5000);
          return;
        }

        let userId;
        try {
          const user = JSON.parse(userString);
          userId = user.userid;
        } catch (parseError) {
          setError("Invalid user data. Please log in again.");
          toast.error("Invalid user data. Please log in again.");
          setTimeout(() => setError(null), 5000);
          return;
        }

        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
          projection: { "sectionData.appuser": 1, _id: 0 },
        });

        if (!response || (Array.isArray(response) && response.length === 0)) {
          setError("User data not found. Please contact support.");
          toast.error("User data not found. Please contact support.");
          setTimeout(() => setError(null), 5000);
          return;
        }

        const appuser = Array.isArray(response)
          ? response[0]?.sectionData?.appuser || {}
          : response.sectionData?.appuser || {};

        const [fname = "", lname = ""] = appuser.legalname
          ? appuser.legalname.split(" ")
          : ["", ""];

        const newData = {
          firstName: fname,
          lastName: lname,
          email: appuser.email || "",
          cdesignation: appuser.cdesignation || "",
          mobile: appuser.mobile ? appuser.mobile.replace("+63", "") : "",
          location: appuser.location || "",
        };

        setFormData(newData);
        // Check if required fields are filled to set completion status
        const isFormComplete =
          !!newData.firstName &&
          !!newData.lastName &&
          !!newData.email &&
          !!newData.mobile &&
          !!newData.location;
        setIsCompleted(isFormComplete);
        if (updateCompletionStatus) {
          updateCompletionStatus("Company Details", isFormComplete);
        }
      } catch (err) {
        setError(err.message || "Failed to load user data.");
        toast.error(err.message || "Failed to load user data.");
        console.error("Error fetching user data:", err);
        setTimeout(() => setError(null), 5000);
      }
    };

    fetchUserData();
  }, [updateCompletionStatus]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form before saving
  const validateForm = () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.mobile ||
      !formData.location
    ) {
      return "Please fill all required fields.";
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      return "Mobile number must be 10 digits.";
    }
    return "";
  };

  // Handle form submission to update data
  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (typeof window === "undefined") throw new Error("Browser environment required");

      const userString = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!userString || !accessToken) {
        throw new Error("Please log in to save your details.");
      }

      let userId;
      try {
        const user = JSON.parse(userString);
        userId = user.userid;
      } catch (parseError) {
        throw new Error("Invalid user data. Please log in again.");
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
        setError("User not found in database. Please sign up or contact support.");
        toast.error("User not found in database. Please sign up or contact support.");
        setTimeout(() => {
          setError(null);
          onBack?.();
        }, 2000);
        return;
      }

      const updateData = {
        "sectionData.appuser.legalname": `${formData.firstName} ${formData.lastName}`.trim(),
        "sectionData.appuser.cdesignation": formData.cdesignation,
        "sectionData.appuser.mobile": formData.mobile,
        "sectionData.appuser.location": formData.location,
        "sectionData.appuser.email": formData.email,
        "sectionData.appuser.lastUpdated": new Date().toISOString(),
      };

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });

      if (response && response.success) {
        if (response.matchedCount === 0) {
          throw new Error("Failed to update profile: User not found.");
        }
        toast.success("Profile updated successfully!");
        setIsCompleted(true); // Set completion status to true on successful save
        if (updateCompletionStatus) {
          updateCompletionStatus("Company Details", true);
        }
      } else {
        throw new Error("Failed to update profile in database.");
      }
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        setTimeout(() => onBack?.(), 2000);
      } else if (err.message.includes("User not found")) {
        errorMessage = "User not found in database. Please sign up or contact support.";
        setTimeout(() => {
          setError(null);
          onBack?.();
        }, 2000);
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error updating profile:", err);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-600 text-xl" />
          )}
          Personal Details
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="First Name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last Name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="E-Mail"
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <input
            type="text"
            name="cdesignation"
            value={formData.cdesignation}
            onChange={handleInputChange}
            placeholder="Designation"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile<span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg p-2 bg-white w-20 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            >
              <option value="+63">+63</option>
            </select>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location<span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter your location"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ref={locationInputRef}
              disabled={isProcessing}
            />
            <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
            {isProcessing ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;