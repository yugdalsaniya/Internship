import React, { useState, useEffect } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle } from 'react-icons/fa';
import { CalendarDays } from 'lucide-react';
import { fetchSectionData, mUpdate } from './../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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
    hobbies: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = userData?.userid;
        if (!userId) {
          console.error('User ID not found in userData:', userData);
          setError('Please log in to view your details.');
          toast.error('Please log in to view your details.', {
            position: 'top-right',
            autoClose: 5000,
          });
          navigate('/login');
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('Access token missing in localStorage');
          setError('Authentication required. Please log in.');
          toast.error('Authentication required. Please log in.', {
            position: 'top-right',
            autoClose: 5000,
          });
          navigate('/login');
          return;
        }

        setIsLoading(true);
        const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              return await fn();
            } catch (err) {
              if (i === retries - 1) throw err;
              console.warn(`Retry ${i + 1} for fetchSectionData:`, err.message);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        };

        const response = await fetchWithRetry(() =>
          fetchSectionData({
            appName: 'app8657281202648',
            collectionName: 'appuser',
            query: { _id: userId },
            projection: {
              'sectionData.appuser.pronouns': 1,
              'sectionData.appuser.dOB': 1,
              'sectionData.appuser.addressline1': 1,
              'sectionData.appuser.addressline2': 1,
              'sectionData.appuser.landmark1': 1,
              'sectionData.appuser.zipcode1': 1,
              'sectionData.appuser.location1': 1,
              'sectionData.appuser.copycurrentaddress': 1,
              'sectionData.appuser.addressline3': 1,
              'sectionData.appuser.addressline4': 1,
              'sectionData.appuser.landmark2': 1,
              'sectionData.appuser.zipcode2': 1,
              'sectionData.appuser.location2': 1,
              'sectionData.appuser.hobbies': 1,
            },
          })
        );

        console.log('fetchSectionData response for PersonalDetails:', JSON.stringify(response, null, 2));
        const apiData = response[0];
        if (!apiData) {
          console.warn('No user data returned from API, setting default state');
          if (!isCompleted) {
            setIsCompleted(false);
            if (updateCompletionStatus) {
              updateCompletionStatus('Personal Details', false);
              console.log('Updated completion status for Personal Details: false');
            }
          }
          return;
        }

        const user = apiData.sectionData?.appuser || {};
        const fetchedFormData = {
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
        };
        setFormData(fetchedFormData);

        const isDataPresent =
          fetchedFormData.pronouns ||
          fetchedFormData.dob ||
          fetchedFormData.currentAddress.line1 ||
          fetchedFormData.currentAddress.ZIPcode ||
          fetchedFormData.currentAddress.location ||
          fetchedFormData.permanentAddress.line1 ||
          fetchedFormData.permanentAddress.ZIPcode ||
          fetchedFormData.permanentAddress.location ||
          fetchedFormData.hobbies;
        if (!isCompleted) {
          setIsCompleted(isDataPresent);
          if (updateCompletionStatus) {
            updateCompletionStatus('Personal Details', isDataPresent);
            console.log('Updated completion status for Personal Details:', isDataPresent);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        let errorMessage = 'Failed to load user data. Please try again.';
        if (error.response?.status === 404) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          navigate('/login');
        }
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 5000,
        });
        if (!isCompleted) {
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus('Personal Details', false);
            console.log('Updated completion status for Personal Details: false');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userData?.userid, updateCompletionStatus, navigate, isCompleted]);

  const handleChange = (field, value, isPermanent = false) => {
    setError('');
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
      permanentAddress: copied ? { ...formData.currentAddress } : {
        line1: '', line2: '', landmark: '', ZIPcode: '', location: '',
      }
    });
  };

  const validateForm = () => {
    if (!formData.currentAddress.line1 || !formData.currentAddress.ZIPcode || !formData.currentAddress.location) {
      setError('Please fill all required current address fields.');
      toast.error('Please fill all required current address fields.', {
        position: 'top-right',
        autoClose: 5000,
      });
      return false;
    }
    if (!formData.copyAddress && (!formData.permanentAddress.line1 || !formData.permanentAddress.ZIPcode || !formData.permanentAddress.location)) {
      setError('Please fill all required permanent address fields or check "Copy Current Address".');
      toast.error('Please fill all required permanent address fields or check "Copy Current Address".', {
        position: 'top-right',
        autoClose: 500/svg/FontAwesomeIcons.stories.mdx5000,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const userId = userData?.userid;
      if (!userId) {
        throw new Error('Please log in to save details.');
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }

      if (!validateForm()) {
        return;
      }

      const userDataUpdate = {
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

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: userDataUpdate },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for PersonalDetails:', JSON.stringify(response, null, 2));

      if (
        response &&
        (response.success ||
          response.modifiedCount > 0 ||
          response.matchedCount > 0)
      ) {
        if (response.matchedCount === 0) {
          throw new Error('Failed to update personal details: User not found.');
        }
        if (response.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Personal details updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus('Personal Details', true);
          console.log('Updated completion status for Personal Details: true');
        }
      } else {
        throw new Error('Failed to update personal details in database.');
      }
    } catch (error) {
      console.error('Error updating personal details:', error.response?.data || error.message);
      let errorMessage = error.message || 'Failed to update personal details. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
      }
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
      const isDataPresent =
        formData.pronouns ||
        formData.dob ||
        formData.currentAddress.line1 ||
        formData.currentAddress.ZIPcode ||
        formData.currentAddress.location ||
        formData.permanentAddress.line1 ||
        formData.permanentAddress.ZIPcode ||
        formData.permanentAddress.location ||
        formData.hobbies;
      setIsCompleted(isDataPresent);
      if (updateCompletionStatus) {
        updateCompletionStatus('Personal Details', isDataPresent);
        console.log('Updated completion status for Personal Details:', isDataPresent);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (label, field, section = null, placeholder = '', type = 'text', required = false) => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <input
        type={type}
        placeholder={placeholder || label}
        value={section ? formData[section][field] : formData[field]}
        onChange={(e) => handleChange(field, e.target.value, section === 'permanentAddress')}
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
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
          {renderInput('Location', 'location', 'currentAddress', '', 'text', true)}
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
          {renderInput('Location', 'location', 'permanentAddress', '', 'text', !formData.copyAddress)}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Hobbies</p>
          <input
            type="text"
            placeholder="List your hobbies (comma-separated)"
            value={formData.hobbies}
            onChange={(e) => handleChange('hobbies', e.target.value)}
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
              isLoading || error ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading || !!error}
            aria-label="Save Personal Details"
          >
            {isLoading ? (
              <span className="text-lg">⏳</span>
            ) : (
              <span className="text-lg">✓</span>
            )}
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;