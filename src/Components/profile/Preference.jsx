import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { FaCheckCircle } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchSectionData, mUpdate } from "../../Utils/api";
import philippineRegionsData from '../../data/philippine-regions-data.json';

// List of Philippine regions (18 as of 2025)
const philippineRegions = [
  { value: 'Region I - Ilocos Region', label: 'Region I - Ilocos Region' },
  { value: 'Region II - Cagayan Valley', label: 'Region II - Cagayan Valley' },
  { value: 'Region III - Central Luzon', label: 'Region III - Central Luzon' },
  { value: 'Region IV-A - CALABARZON', label: 'Region IV-A - CALABARZON' },
  { value: 'MIMAROPA Region', label: 'MIMAROPA Region' },
  { value: 'Region V - Bicol Region', label: 'Region V - Bicol Region' },
  { value: 'Region VI - Western Visayas', label: 'Region VI - Western Visayas' },
  { value: 'Region VII - Central Visayas', label: 'Region VII - Central Visayas' },
  { value: 'Region VIII - Eastern Visayas', label: 'Region VIII - Eastern Visayas' },
  { value: 'Region IX - Zamboanga Peninsula', label: 'Region IX - Zamboanga Peninsula' },
  { value: 'Region X - Northern Mindanao', label: 'Region X - Northern Mindanao' },
  { value: 'Region XI - Davao Region', label: 'Region XI - Davao Region' },
  { value: 'Region XII - SOCCSKSARGEN', label: 'Region XII - SOCCSKSARGEN' },
  { value: 'Region XIII - Caraga', label: 'Region XIII - Caraga' },
  { value: 'NCR - National Capital Region', label: 'NCR - National Capital Region' },
  { value: 'CAR - Cordillera Administrative Region', label: 'CAR - Cordillera Administrative Region' },
  { value: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao', label: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao' },
  { value: 'NIR - Negros Island Region', label: 'NIR - Negros Island Region' },
];

const Preference = ({
  userData,
  preferredRegion = '',
  setPreferredRegion,
  locationjson = '',
  setLocation,
  isProcessing = false,
  customSelectStyles = {},
  updateCompletionStatus
}) => {
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  // Memoize location options
  const locationOptions = useMemo(() => {
    if (preferredRegion && philippineRegionsData.regions[preferredRegion]) {
      const regionData = philippineRegionsData.regions[preferredRegion];
      const cities = regionData.cities || [];
      const provinces = regionData.provinces || [];
      const cityProvinceMap = regionData.cityProvinceMap || {};

      // Create options with City, Province, Country structure for cities
      const cityOptions = cities.map(city => {
        const province = cityProvinceMap[city] || (provinces.length > 0 ? provinces[0] : 'Metro Manila');
        return {
          value: `${city}, ${province}, Philippines`,
          label: `${city}, ${province}, Philippines`
        };
      });

      // Create options with Province, Country structure for provinces
      const provinceOptions = provinces.map(province => ({
        value: `${province}, Philippines`,
        label: `${province}, Philippines`
      }));

      // Combine and sort all locations
      return [...cityOptions, ...provinceOptions].sort((a, b) => a.label.localeCompare(b.label));
    }
    return [];
  }, [preferredRegion]);

  // Filter locations based on input
  const filteredLocationOptions = useMemo(() => {
    if (!locationInput) return locationOptions;
    return locationOptions.filter(option =>
      option.label.toLowerCase().includes(locationInput.toLowerCase())
    );
  }, [locationOptions, locationInput]);

  // Update filtered locations when options change
  useEffect(() => {
    setFilteredLocations(locationOptions);
  }, [locationOptions]);

  // Check if preferences are already saved
  useEffect(() => {
    if (userData?.sectionData?.appuser) {
      const appuser = userData.sectionData.appuser;
      const preferencesComplete = appuser.preferredregion && appuser.preferredlocation;
      if (preferencesComplete) {
        setIsFirstSaveSuccessful(true);
        if (typeof updateCompletionStatus === 'function') {
          updateCompletionStatus("Preference", true);
        }
      }
    }
  }, [userData, updateCompletionStatus]);

  // Fetch existing user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("Please log in to view your preferences.");
          toast.error("Please log in to view your preferences.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }

        let userId;
        try {
          const user = JSON.parse(userString);
          userId = user.userid;
        } catch (parseError) {
          console.error("Parse error:", parseError);
          setError("Invalid user data. Please log in again.");
          toast.error("Invalid user data. Please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }

        if (!userId) {
          setError("User ID not found. Please log in again.");
          toast.error("User ID not found. Please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }

        const userDataResponse = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
        });

        if (
          !userDataResponse ||
          (Array.isArray(userDataResponse) && userDataResponse.length === 0)
        ) {
          setError("User data not found in database.");
          toast.error("User data not found in database.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }

        const userData = Array.isArray(userDataResponse)
          ? userDataResponse.find((item) => item._id === userId)?.sectionData?.appuser || {}
          : userDataResponse.sectionData?.appuser || {};

        if (userData.preferredregion && typeof setPreferredRegion === 'function') {
          setPreferredRegion(userData.preferredregion);
        }
        if (userData.preferredlocation && typeof setLocation === 'function') {
          setLocation(userData.preferredlocation);
          setLocationInput(userData.preferredlocation);
        }

        const preferencesComplete = userData.preferredregion && userData.preferredlocation;
        if (preferencesComplete) {
          setIsFirstSaveSuccessful(true);
          if (typeof updateCompletionStatus === 'function') {
            updateCompletionStatus("Preference", true);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err.message);
        setError("Failed to load preferences from server.");
        toast.error("Failed to load preferences from server.", {
          position: "top-right",
          autoClose: 5000,
        });
        setTimeout(() => setError(""), 5000);
      }
    };

    fetchUserData();
  }, [setPreferredRegion, setLocation, updateCompletionStatus]);

  // Handle region change
  const handleRegionChange = (selected) => {
    if (typeof setPreferredRegion === 'function') {
      setPreferredRegion(selected ? selected.value : '');
      if (typeof setLocation === 'function') {
        setLocation('');
        setLocationInput('');
      }
    }
  };

  // Handle location change
  const handleLocationChange = (selected) => {
    if (typeof setLocation === 'function') {
      const newValue = selected ? selected.value : '';
      setLocation(newValue);
      setLocationInput(selected ? selected.label : '');
    }
  };

  // Handle location input change
  const handleLocationInputChange = (inputValue) => {
    setLocationInput(inputValue);
  };

  // Validate form inputs
  const validateForm = () => {
    if (!preferredRegion) {
      return "Please select a preferred region.";
    }
    if (!locationjson) {
      return "Please select a specific location.";
    }
    return "";
  };

  // Handle save button click
  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => setError(""), 5000);
      return;
    }

    setError("");
    setSuccess("");

    try {
      const userString = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (!userString) {
        setError("Please log in to save your preferences.");
        toast.error("Please log in to save your preferences.", {
          position: "top-right",
          autoClose: 5000,
        });
        setTimeout(() => setError(""), 5000);
        return;
      }

      let userId;
      try {
        const user = JSON.parse(userString);
        userId = user.userid;
      } catch (parseError) {
        setError("Invalid user data. Please log in again.");
        toast.error("Invalid user data. Please log in again.", {
          position: "top-right",
          autoClose: 5000,
        });
        setTimeout(() => setError(""), 5000);
        return;
      }

      if (!userId || !token) {
        setError(
          "Authentication token or user ID missing. Please log in again."
        );
        toast.error(
          "Authentication token or user ID missing. Please log in again.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setTimeout(() => setError(""), 5000);
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
        toast.error(
          "User not found in database. Please sign up or contact support.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setTimeout(() => setError(""), 5000);
        return;
      }

      const updateData = {
        $set: {
          "sectionData.appuser.preferredregion": preferredRegion,
          "sectionData.appuser.preferredlocation": locationjson,
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

      if (
        updateResponse &&
        (updateResponse.success ||
          updateResponse.modifiedCount > 0 ||
          updateResponse.matchedCount > 0)
      ) {
        if (updateResponse.matchedCount === 0) {
          setError("Failed to update preferences: User not found.");
          toast.error("Failed to update preferences: User not found.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }
        if (updateResponse.upsertedId) {
          setError(
            "Unexpected error: New user created instead of updating. Please contact support."
          );
          toast.error(
            "Unexpected error: New user created instead of updating. Please contact support.",
            {
              position: "top-right",
              autoClose: 5000,
            }
          );
          setTimeout(() => setError(""), 5000);
          return;
        }

        toast.success("Preferences updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });

        setSuccess("Preferences updated successfully!");
        setIsFirstSaveSuccessful(true);

        if (typeof updateCompletionStatus === 'function') {
          updateCompletionStatus("Preference", true);
        }

        try {
          const completionStatusString = localStorage.getItem("completionStatus");
          const completionStatus = completionStatusString ? JSON.parse(completionStatusString) : {};
          completionStatus["Preference"] = true;
          localStorage.setItem("completionStatus", JSON.stringify(completionStatus));
        } catch (storageError) {
          console.error("Error storing completion status:", storageError);
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        throw new Error("Failed to update preferences in database.");
      }
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
      }
      setError(errorMessage || "Failed to update preferences. Please try again.");
      toast.error(
        errorMessage || "Failed to update preferences. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      setTimeout(() => setError(""), 5000);
    }
  };

  // Memoize current location value
  const currentLocationValue = useMemo(() => {
    if (!locationjson || filteredLocations.length === 0) {
      return null;
    }
    return filteredLocations.find(opt => opt.value === locationjson) || null;
  }, [locationjson, filteredLocations]);

  // Memoize region value
  const currentRegionValue = useMemo(() => {
    return philippineRegions.find((option) => option.value === preferredRegion) || null;
  }, [preferredRegion]);

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          Preference
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Region Selection */}
        <label className="block font-medium mb-2 text-sm text-gray-700">
          Preferred Region <span className="text-red-500">*</span>
        </label>
        <Select
          options={philippineRegions}
          value={currentRegionValue}
          onChange={handleRegionChange}
          styles={customSelectStyles}
          isDisabled={isProcessing}
          placeholder="Select your preferred region..."
          isClearable
          isSearchable
          menuPortalTarget={document.body}
        />

        {/* Location Selection */}
        <label className="block font-medium mb-2 mt-4 text-sm text-gray-700">
          Specific Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Select
            key={`location-select-${locationjson}-${filteredLocations.length}`}
            options={filteredLocationOptions}
            value={currentLocationValue}
            onChange={handleLocationChange}
            onInputChange={handleLocationInputChange}
            inputValue={locationInput}
            styles={customSelectStyles}
            isDisabled={isProcessing || !preferredRegion}
            placeholder={
              preferredRegion
                ? "Type or select a city or province..."
                : "Please select a region first"
            }
            isClearable
            isSearchable
            menuPortalTarget={document.body}
            noOptionsMessage={() =>
              preferredRegion
                ? "No locations found"
                : "Please select a region first"
            }
            closeMenuOnSelect={true}
            blurInputOnSelect={true}
          />
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
            aria-label="Save Preferences"
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
};

export default Preference;