import React, { useState, useEffect, useRef } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle, FaCrosshairs } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from './../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PersonalDetails = ({ userData, updateCompletionStatus }) => {
  const [formData, setFormData] = useState({
    pronouns: '',
    dob: '',
    currentAddress: {
      line1: '',
      line2: '',
      landmark: '',
      ZIPcode: '',
      location: '',
    },
    permanentAddress: {
      line1: '',
      line2: '',
      landmark: '',
      ZIPcode: '',
      location: '',
    },
    copyAddress: false,
    hobbies: [], // Changed to array of objects [{id, name}]
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [allHobbies, setAllHobbies] = useState([]);
  const [filteredHobbies, setFilteredHobbies] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const [isHobbiesDropdownOpen, setIsHobbiesDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const currentLocationInputRef = useRef(null);
  const permanentLocationInputRef = useRef(null);
  const currentAutocompleteRef = useRef(null);
  const permanentAutocompleteRef = useRef(null);
  const hobbyInputRef = useRef(null);
  const hobbyDropdownRef = useRef(null);

  // Fetch user data and hobbies
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem('user');
        let userIdLocal;
        if (!userString) {
          setError('Please log in to view your details.');
          toast.error('Please log in to view your details.', {
            position: 'top-right',
            autoClose: 3000,
          });
          navigate('/login');
          return;
        }
        try {
          const user = JSON.parse(userString);
          userIdLocal = user.userid;
          setUserId(userIdLocal);
        } catch (parseError) {
          setError('Invalid user data. Please log in again.');
          toast.error('Invalid user data. Please log in again.', {
            position: 'top-right',
            autoClose: 3000,
          });
          navigate('/login');
          return;
        }

        // Fetch user data
        const data = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userIdLocal },
          dbName: 'internph',
        });

        if (data.length > 0 && data[0].sectionData?.appuser) {
          const user = data[0].sectionData.appuser;
          const userHobbies = user.hobbies || [];
          // Fetch hobbies to map IDs to names
          const hobbiesResponse = await fetchSectionData({
            collectionName: 'hobbies',
            projection: { 'sectionData.hobbies.name': 1, _id: 1 },
            dbName: 'internph',
          });
          const hobbyData = hobbiesResponse.map((item) => ({
            id: item._id,
            name: item.sectionData.hobbies.name,
          }));
          setAllHobbies(hobbyData);

          // Map user hobbies (IDs) to objects with id and name
          const mappedHobbies = userHobbies
            .map((hobbyId) => {
              const hobby = hobbyData.find((h) => h.id === hobbyId);
              return hobby ? { id: hobby.id, name: hobby.name } : null;
            })
            .filter((h) => h !== null);

          const newFormData = {
            pronouns: user.pronouns || '',
            dob: user.dOB || '',
            currentAddress: {
              line1: user.addressline1 || '',
              line2: user.addressline2 || '',
              landmark: user.landmark1 || '',
              ZIPcode: user.zipcode1 || '',
              location: user.location1 || '',
            },
            permanentAddress: {
              line1: user.addressline3 || '',
              line2: user.addressline4 || '',
              landmark: user.landmark2 || '',
              ZIPcode: user.zipcode2 || '',
              location: user.location2 || '',
            },
            copyAddress: user.copycurrentaddress || false,
            hobbies: mappedHobbies,
          };
          setFormData(newFormData);
          const isFormComplete =
            !!newFormData.currentAddress.line1 &&
            !!newFormData.currentAddress.ZIPcode &&
            !!newFormData.currentAddress.location &&
            (newFormData.copyAddress ||
              (!!newFormData.permanentAddress.line1 &&
                !!newFormData.permanentAddress.ZIPcode &&
                !!newFormData.permanentAddress.location));
          setIsCompleted(isFormComplete);
          if (updateCompletionStatus) {
            updateCompletionStatus('Personal Details', isFormComplete);
          }
        } else {
          // Fetch hobbies even if user data is not found
          const hobbiesResponse = await fetchSectionData({
            collectionName: 'hobbies',
            projection: { 'sectionData.hobbies.name': 1, _id: 1 },
            dbName: 'internph',
          });
          const hobbyData = hobbiesResponse.map((item) => ({
            id: item._id,
            name: item.sectionData.hobbies.name,
          }));
          setAllHobbies(hobbyData);

          setError('User data not found. Please ensure your account exists.');
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus('Personal Details', false);
          }
        }
      } catch (error) {
        console.error('Error fetching user data or hobbies:', error);
        const errorMessage = 'Failed to load data. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus('Personal Details', false);
        }
      }
    };
    fetchUserData();
  }, [userData?.userid, updateCompletionStatus, navigate]);

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
          const errorMessage = "Google Maps API failed to load. Location suggestions unavailable.";
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(""), 5000);
          return;
        }
        currentAutocompleteRef.current = new window.google.maps.places.Autocomplete(
          currentLocationInputRef.current,
          {
            types: ["(cities)"],
            fields: ["formatted_address", "name"],
            componentRestrictions: { country: "ph" },
          }
        );
        currentAutocompleteRef.current.addListener("place_changed", () => {
          const place = currentAutocompleteRef.current.getPlace();
          if (place && (place.formatted_address || place.name)) {
            setFormData((prev) => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                location: place.formatted_address || place.name || "",
              },
            }));
          } else {
            console.warn("No valid place selected for current address");
            // Optionally, set an error or clear the location
            setFormData((prev) => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                location: "",
              },
            }));
          }
        });

        if (!formData.copyAddress) {
          permanentAutocompleteRef.current = new window.google.maps.places.Autocomplete(
            permanentLocationInputRef.current,
            {
              types: ["(cities)"],
              fields: ["formatted_address", "name"],
              componentRestrictions: { country: "ph" },
            }
          );
          permanentAutocompleteRef.current.addListener("place_changed", () => {
            const place = permanentAutocompleteRef.current.getPlace();
            if (place && (place.formatted_address || place.name)) {
              setFormData((prev) => ({
                ...prev,
                permanentAddress: {
                  ...prev.permanentAddress,
                  location: place.formatted_address || place.name || "",
                },
              }));
            } else {
              console.warn("No valid place selected for permanent address");
              setFormData((prev) => ({
                ...prev,
                permanentAddress: {
                  ...prev.permanentAddress,
                  location: "",
                },
              }));
            }
          });
        }
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
      if (currentAutocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          currentAutocompleteRef.current
        );
      }
      if (permanentAutocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          permanentAutocompleteRef.current
        );
      }
    };
  }, [formData.copyAddress]);

  // Handle click outside to close hobbies dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        hobbyInputRef.current &&
        !hobbyInputRef.current.contains(event.target) &&
        hobbyDropdownRef.current &&
        !hobbyDropdownRef.current.contains(event.target)
      ) {
        setIsHobbiesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounce function for filtering hobbies
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Filter hobbies based on input
  const fetchFilteredHobbies = debounce((query) => {
    if (!query.trim()) {
      setFilteredHobbies([]);
      setIsHobbiesDropdownOpen(false);
      return;
    }
    const filtered = allHobbies.filter(
      (hobby) =>
        hobby.name.toLowerCase().includes(query.toLowerCase()) &&
        !formData.hobbies.some((h) => h.id === hobby.id)
    );
    setFilteredHobbies(filtered);
    setIsHobbiesDropdownOpen(filtered.length > 0);
  }, 500);

  const handleHobbyInputChange = (value) => {
    setHobbyInput(value);
    fetchFilteredHobbies(value);
  };

  const handleHobbySelect = (hobby) => {
    setFormData({
      ...formData,
      hobbies: [...formData.hobbies, { id: hobby.id, name: hobby.name }],
    });
    setHobbyInput('');
    setIsHobbiesDropdownOpen(false);
  };

  const handleHobbyRemove = (hobbyId) => {
    setFormData({
      ...formData,
      hobbies: formData.hobbies.filter((h) => h.id !== hobbyId),
    });
  };

  const isValidDate = (dateStr) => {
    if (!dateStr) return true; // Allow empty DOB as it's not required
    const date = new Date(dateStr);
    const today = new Date();
    const minYear = 1900;

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return false;
    }

    // Extract year, month, day
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-based
    const day = date.getDate();

    // Check year (not before 1900, not in future)
    if (year < minYear || date > today) {
      return false;
    }

    // Check month (1-12)
    if (month < 1 || month > 12) {
      return false;
    }

    // Check day based on month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return false;
    }

    return true;
  };

  const handleChange = (field, value, isPermanent = false) => {
    setError('');
    if (field === 'dob' && value) {
      if (!isValidDate(value)) {
        toast.error('Please enter a valid date of birth (1900 or later, not in the future).', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
    }
    if (field in formData) {
      setFormData({ ...formData, [field]: value });
    } else {
      const section = isPermanent ? 'permanentAddress' : 'currentAddress';
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: value,
        },
      });
    }
  };

  const handleCopyAddress = () => {
    const copied = !formData.copyAddress;
    setFormData({
      ...formData,
      copyAddress: copied,
      permanentAddress: copied
        ? { ...formData.currentAddress }
        : {
            line1: '',
            line2: '',
            landmark: '',
            ZIPcode: '',
            location: '',
          },
    });
  };

  const validateForm = () => {
    if (
      !formData.currentAddress.line1 ||
      !formData.currentAddress.ZIPcode ||
      !formData.currentAddress.location
    ) {
      setError('Please fill all required current address fields.');
      return false;
    }
    if (
      !formData.copyAddress &&
      (!formData.permanentAddress.line1 ||
        !formData.permanentAddress.ZIPcode ||
        !formData.permanentAddress.location)
    ) {
      setError(
        'Please fill all required permanent address fields or check "Copy Current Address".'
      );
      return false;
    }
    if (formData.dob && !isValidDate(formData.dob)) {
      setError('Please enter a valid date of birth (1900 or later, not in the future).');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!userId) {
        setError('Please log in to save details.');
        toast.error('Please log in to save details.', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      if (!validateForm()) {
        toast.error(error, {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      const userDataToUpdate = {
        'sectionData.appuser.pronouns': formData.pronouns,
        'sectionData.appuser.dOB': formData.dob,
        'sectionData.appuser.addressline1': formData.currentAddress.line1,
        'sectionData.appuser.addressline2': formData.currentAddress.line2,
        'sectionData.appuser.landmark1': formData.currentAddress.landmark,
        'sectionData.appuser.zipcode1': formData.currentAddress.ZIPcode,
        'sectionData.appuser.location1': formData.currentAddress.location,
        'sectionData.appuser.copycurrentaddress': formData.copyAddress,
        'sectionData.appuser.addressline3': formData.permanentAddress.line1,
        'sectionData.appuser.addressline4': formData.permanentAddress.line2,
        'sectionData.appuser.landmark2': formData.permanentAddress.landmark,
        'sectionData.appuser.zipcode2': formData.permanentAddress.ZIPcode,
        'sectionData.appuser.location2': formData.permanentAddress.location,
        'sectionData.appuser.hobbies': formData.hobbies.map((h) => h.id), // Save hobby IDs
        'editedAt': new Date().toISOString(),
      };

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: userDataToUpdate },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });


      if (
        response &&
        (response.success ||
          response.modifiedCount > 0 ||
          response.matchedCount > 0)
      ) {
        if (response.matchedCount === 0) {
          throw new Error('Failed to update user data: User not found.');
        }
        if (response.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Personal details saved successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus('Personal Details', true);
        }
      } else {
        throw new Error('Failed to save personal details to database.');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      const errorMessage = error.message || 'Failed to update personal details. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsCompleted(false);
      if (updateCompletionStatus) {
        updateCompletionStatus('Personal Details', false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const renderInput = (
    label,
    field,
    section = null,
    placeholder = '',
    type = 'text',
    required = false,
    inputRef = null
  ) => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder || label}
          value={section ? formData[section][field] : formData[field]}
          onChange={(e) =>
            handleChange(field, e.target.value, section === 'permanentAddress')
          }
          ref={inputRef}
          max={type === 'date' ? getCurrentDate() : undefined}
          className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          disabled={isLoading || (section === 'permanentAddress' && formData.copyAddress)}
        />
        {field === 'location' && (
          <FaCrosshairs className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        )}
      </div>
    </div>
  );

  const renderHobbiesInput = () => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">Hobbies</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {formData.hobbies.map((hobby) => (
          <button
            key={hobby.id}
            onClick={() => handleHobbyRemove(hobby.id)}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1"
            disabled={isLoading}
          >
            {hobby.name}
            <span className="text-sm">✕</span>
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          ref={hobbyInputRef}
          type="text"
          placeholder="Search hobbies..."
          value={hobbyInput}
          onChange={(e) => handleHobbyInputChange(e.target.value)}
          onFocus={() =>
            hobbyInput.trim() &&
            filteredHobbies.length > 0 &&
            setIsHobbiesDropdownOpen(true)
          }
          className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        {isHobbiesDropdownOpen && filteredHobbies.length > 0 && (
          <div
            ref={hobbyDropdownRef}
            className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
          >
            {filteredHobbies.map((hobby) => (
              <button
                key={hobby.id}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                onClick={() => handleHobbySelect(hobby)}
                disabled={isLoading}
              >
                {hobby.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );


  return (
    <div className="bg-white rounded-xl shadow-md">
      <style>{`
        .pac-container { z-index: 10000 !important; }
      `}</style>
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
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>Personal Details</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Pronouns</p>
          <div className="flex flex-wrap gap-2">
            {['He/Him/his', 'She/Her', 'Them/They'].map((option) => (
              <button
                key={option}
                className={`px-3 py-1 border rounded-full text-sm ${
                  formData.pronouns === option
                    ? 'border-blue-600 text-blue-600'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleChange('pronouns', option)}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">DOB</p>
          <div className="relative">
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              max={getCurrentDate()}
              className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-5"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Address</h2>
          {renderInput('Address Line 1', 'line1', 'currentAddress', '', 'text', true)}
          {renderInput('Address Line 2', 'line2', 'currentAddress')}
          {renderInput('Landmark', 'landmark', 'currentAddress')}
          {renderInput('ZIP Code', 'ZIPcode', 'currentAddress', '', 'text', true)}
          {renderInput('Location', 'location', 'currentAddress', '', 'text', true, currentLocationInputRef)}
        </div>

        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Permanent Address</h2>
            <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.copyAddress}
                onChange={handleCopyAddress}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              Copy Current Address
            </label>
          </div>
          {renderInput('Address Line 1', 'line1', 'permanentAddress', '', 'text', !formData.copyAddress)}
          {renderInput('Address Line 2', 'line2', 'permanentAddress')}
          {renderInput('Landmark', 'landmark', 'permanentAddress')}
          {renderInput('ZIP Code', 'ZIPcode', 'permanentAddress', '', 'text', !formData.copyAddress)}
          {renderInput('Location', 'location', 'permanentAddress', '', 'text', !formData.copyAddress, permanentLocationInputRef)}
        </div>

        {renderHobbiesInput()}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
              isLoading || error
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !!error}
          >
            <span className="text-lg">✓</span> {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;