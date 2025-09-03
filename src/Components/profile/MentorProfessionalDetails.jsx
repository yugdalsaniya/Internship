import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import Select from 'react-select';
import { mUpdate, fetchSectionData } from '../../Utils/api';

const MentorProfessionalDetails = ({ userData, updateCompletionStatus }) => {
  const [mentorExpertise, setMentorExpertise] = useState(userData.mentorExpertise || '');
  const [mentorExperience, setMentorExperience] = useState(userData.mentorExperience || '');
  const [mentorSpecializations, setMentorSpecializations] = useState(userData.mentorSpecializations || []);
  const [education, setEducation] = useState(userData.education || '');
  const [certifications, setCertifications] = useState(userData.certifications || []);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [error, setError] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (userData) {
      setMentorExpertise(userData.mentorExpertise || '');
      setMentorExperience(userData.mentorExperience || '');
      setMentorSpecializations(userData.mentorSpecializations || []);
      setEducation(userData.education || '');
      setCertifications(userData.certifications || []);
      
      // Check if professional details already exist
      if (userData.mentorExpertise && userData.mentorExperience && userData.mentorSpecializations?.length > 0) {
        setIsFirstSaveSuccessful(true);
        updateCompletionStatus('Professional Details', true);
      }
    }
  }, [userData, updateCompletionStatus]);

  const validateForm = () => {
    if (!mentorExpertise || !mentorExperience || mentorSpecializations.length === 0) {
      return 'Please fill all required fields.';
    }
    return '';
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !mentorSpecializations.includes(newSpecialization.trim())) {
      setMentorSpecializations([...mentorSpecializations, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index) => {
    setMentorSpecializations(mentorSpecializations.filter((_, i) => i !== index));
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
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

      const updateData = {
        $set: {
          'sectionData.appuser.mentorExpertise': mentorExpertise,
          'sectionData.appuser.mentorExperience': mentorExperience,
          'sectionData.appuser.mentorSpecializations': mentorSpecializations,
          'sectionData.appuser.education': education,
          'sectionData.appuser.certifications': certifications,
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
        toast.success('Professional details updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        if (!isFirstSaveSuccessful) {
          setIsFirstSaveSuccessful(true);
        }
        updateCompletionStatus('Professional Details', true);
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

  const experienceOptions = [
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          Professional Details
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Area of Expertise <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mentorExpertise}
            onChange={(e) => setMentorExpertise(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Development, Data Science, UX Design"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={mentorExperience}
            onChange={(e) => setMentorExperience(e.target.value)}
            disabled={isProcessing}
          >
            <option value="">Select Experience Level</option>
            {experienceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Specializations <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a specialization"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={handleAddSpecialization}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={isProcessing}
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {mentorSpecializations.map((spec, index) => (
              <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                {spec}
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(index)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  disabled={isProcessing}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Education Background
          </label>
          <input
            type="text"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Bachelor's in Computer Science, Master's in Business Administration"
            disabled={isProcessing}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Certifications
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a certification"
              disabled={isProcessing}
            />
            <button
              type="button"
              onClick={handleAddCertification}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={isProcessing}
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                {cert}
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className="ml-2 text-green-600 hover:text-green-800"
                  disabled={isProcessing}
                >
                  ×
                </button>
              </div>
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
            aria-label="Save Professional Details"
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

export default MentorProfessionalDetails;