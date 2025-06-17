import React, { useState, useEffect } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from './../../Utils/api';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const PersonalDetails = ({ userData, updateCompletionStatus, isCompleted }) => {
  const [formData, setFormData] = useState({
    pronouns: "",
    dob: "",
    currentAddress: {
      line1: "",
      line2: "",
      landmark: "",
      ZIPcode: "",
      location: "",
    },
    permanentAddress: {
      line1: "",
      line2: "",
      landmark: "",
      ZIPcode: "",
      location: "",
    },
    copyAddress: false,
    hobbies: "",
  });
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem('user');
        let userIdLocal;
        if (!userString) {
          setError('Please log in to view your details.');
          navigate('/login'); // Redirect to login page
          return;
        }
        try {
          const user = JSON.parse(userString);
          userIdLocal = user.userid;
          setUserId(userIdLocal);
        } catch (parseError) {
          setError('Invalid user data. Please log in again.');
          navigate('/login');
          return;
        }

        const data = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userIdLocal },
          dbName: 'internph',
        });

        if (data.length > 0 && data[0].sectionData?.appuser) {
          const user = data[0].sectionData.appuser;
          setFormData({
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
            hobbies: user.hobbies ? user.hobbies.join(', ') : '',
          });
        } else {
          setError('User data not found. Please ensure your account exists.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again.');
      }
    };
    fetchUserData();
  }, [userData?.userid, updateCompletionStatus, navigate, isCompleted]);

  const handleChange = (field, value, isPermanent = false) => {
    setError("");
    if (field in formData) {
      setFormData({ ...formData, [field]: value });
    } else {
      const section = isPermanent ? "permanentAddress" : "currentAddress";
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
            line1: "",
            line2: "",
            landmark: "",
            ZIPcode: "",
            location: "",
          },
    });
  };

  const validateForm = () => {
    if (!formData.currentAddress.line1 || !formData.currentAddress.ZIPcode || !formData.currentAddress.location) {
      setError('Please fill all required current address fields.');
      return false;
    }
    if (!formData.copyAddress && (!formData.permanentAddress.line1 || !formData.permanentAddress.ZIPcode || !formData.permanentAddress.location)) {
      setError('Please fill all required permanent address fields or check "Copy Current Address".');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      if (!userId) {
        setError('Please log in to save details.');
        return;
      }

      if (!validateForm()) {
        return;
      }

      const userData = {
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
        'sectionData.appuser.hobbies': formData.hobbies ? formData.hobbies.split(',').map(hobby => hobby.trim()) : [],
        'editedAt': new Date().toISOString(),
      };

      await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: userData },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      console.log('updated successfully:', userData);
      toast.success('Updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error updating data:', error);
      setError(error.message || 'Failed to update personal details. Please try again.');
      toast.error('Failed to update personal details. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Define getCurrentDate function
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const renderInput = (
    label,
    field,
    section = null,
    placeholder = "",
    type = "text",
    required = false
  ) => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <input
        type={type}
        placeholder={placeholder || label}
        value={section ? formData[section][field] : formData[field]}
        onChange={(e) =>
          handleChange(field, e.target.value, section === "permanentAddress")
        }
        className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
    </div>
  );

  console.log('Rendering PersonalDetails:', { isCompleted, formData });

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
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          <span>Personal Details</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Pronouns</p>
          <div className="flex flex-wrap gap-2">
            {["He/Him/his", "She/Her", "Them/They"].map((option) => (
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
              onChange={(e) => handleChange("dob", e.target.value)}
              max={getCurrentDate()} // Use defined function
              className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-5"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Current Address
          </h2>
          {renderInput(
            "Address Line 1",
            "line1",
            "currentAddress",
            "",
            "text",
            true
          )}
          {renderInput("Address Line 2", "line2", "currentAddress")}
          {renderInput("Landmark", "landmark", "currentAddress")}
          {renderInput(
            "ZIP Code",
            "ZIPcode",
            "currentAddress",
            "",
            "text",
            true
          )}
          {renderInput(
            "Location",
            "location",
            "currentAddress",
            "",
            "text",
            true
          )}
        </div>

        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Permanent Address
            </h2>
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
          {renderInput('Location', 'location', 'permanentAddress', '', 'text', !formData.copyAddress)}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Hobbies</p>
          <input
            type="text"
            placeholder="List your hobbies (comma-separated)"
            value={formData.hobbies}
            onChange={(e) => handleChange("hobbies", e.target.value)}
            className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
              isLoading || error
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
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