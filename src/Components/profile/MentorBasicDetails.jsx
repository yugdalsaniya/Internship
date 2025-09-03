import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaCheckCircle, FaEdit, FaMale, FaFemale } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { mUpdate, fetchSectionData, uploadAndStoreFile } from '../../Utils/api';

const MentorBasicDetails = ({ userData, updateCompletionStatus }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+63');
  const [gender, setGender] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = userData?.userid;
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }

        const response = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userId },
          projection: {
            'sectionData.appuser.legalname': 1,
            'sectionData.appuser.email': 1,
            'sectionData.appuser.mobile': 1,
            'sectionData.appuser.Gender': 1,
            'sectionData.appuser.profile': 1,
          },
        });

        if (response && response.length > 0) {
          const user = response[0].sectionData?.appuser || {};
          setName(user.legalname || '');
          setEmail(user.email || '');
          if (user.mobile) {
            if (user.mobile.startsWith('+63')) {
              setCountryCode('+63');
              setMobile(user.mobile.slice(3));
            } else {
              setMobile(user.mobile);
              setCountryCode('+63');
            }
          }
          setGender(user.Gender ? user.Gender.charAt(0).toUpperCase() + user.Gender.slice(1).toLowerCase() : '');
          setProfilePicture(user.profile || '');

          // Check if basic details already exist
          if (user.legalname && user.email && user.mobile) {
            setIsFirstSaveSuccessful(true);
            updateCompletionStatus('Basic Details', true);
          }
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details. Please try again.');
        toast.error('Failed to fetch user details. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
        });
      }
    };

    if (userData?.userid && !fetched) {
      setFetched(true);
      fetchUserDetails();
    }
  }, [userData?.userid, updateCompletionStatus, fetched]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!name || !email || !mobile || !gender) {
      return 'Please fill all required fields.';
    }
    if (mobile.length > 10 || !/^\d+$/.test(mobile)) {
      return 'Mobile number must be up to 10 digits.';
    }
    return '';
  };

  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, {
        position: 'top-right',
        autoClose: 5000,
      });
      setTimeout(() => setError(''), 5000);
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const userId = userData.userid;
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      let profilePictureUrl = profilePicture;
      if (profilePictureFile) {
        try {
          profilePictureUrl = await uploadProfilePicture(profilePictureFile, userId);
          setProfilePicture(profilePictureUrl);
          setProfilePictureFile(null);
          setProfilePicturePreview('');
        } catch (uploadErr) {
          setError(uploadErr.message);
          toast.error(uploadErr.message, {
            position: 'top-right',
            autoClose: 5000,
          });
          setTimeout(() => setError(''), 5000);
          setIsProcessing(false);
          return;
        }
      }

      const updateData = {
        $set: {
          'sectionData.appuser.profile': profilePictureUrl,
          'sectionData.appuser.legalname': name,
          'sectionData.appuser.email': email,
          'sectionData.appuser.mobile': `${countryCode}${mobile}`,
          'sectionData.appuser.Gender': gender,
          editedAt: new Date().toISOString(),
        },
      };

      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: updateData,
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (updateResponse && (updateResponse.success || updateResponse.modifiedCount > 0)) {
        toast.success('Basic details updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        if (!isFirstSaveSuccessful) {
          setIsFirstSaveSuccessful(true);
        }
        updateCompletionStatus('Basic Details', true);
      } else {
        throw new Error('Failed to update details in database.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update details. Please try again.');
      toast.error(err.message || 'Failed to update details. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  async function uploadProfilePicture(file, userId) {
    try {
      if (!file) {
        throw new Error('No file selected for upload.');
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          'Invalid file type. Please upload a JPEG, PNG, or GIF image.'
        );
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit.');
      }

      const response = await uploadAndStoreFile({
        appName: 'app8657281202648',
        moduleName: 'appuser',
        file,
        userId,
      });

      if (!response || !response.filePath) {
        throw new Error(
          'Failed to upload profile picture: No file path returned.'
        );
      }

      return response.filePath;
    } catch (err) {
      console.error('Upload profile picture error:', err);
      throw new Error(err.message || 'Failed to upload profile picture.');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          Basic Details
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center overflow-hidden group">
            {profilePicture || profilePicturePreview ? (
              <img
                src={profilePicturePreview || profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                <FaUser className="text-4xl text-white" />
              </div>
            )}
            <label
              htmlFor="profilePicture"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <FaEdit className="text-white text-xl" />
              <input
                id="profilePicture"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleProfilePictureChange}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 w-full">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mt-1">
            <select
              className="border border-gray-300 rounded-lg p-2 bg-white w-24 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              disabled={isProcessing}
            >
              <option value="+63">+63</option>
            </select>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 10) {
                  setMobile(value);
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mobile number"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full border text-sm min-w-fit ${
                  gender === g
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-blue-400'
                } transition`}
                disabled={isProcessing}
              >
                {g === 'Male' && <FaMale />}
                {g === 'Female' && <FaFemale />}
                {g === 'Other' && <FaUser />}
                {g}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            disabled={isProcessing}
            aria-label="Save Basic Details"
          >
            {isProcessing ? (
              'Processing...'
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

export default MentorBasicDetails;