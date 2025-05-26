import React, { useState } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';
import { CalendarDays } from 'lucide-react';

const PersonalDetails = () => {
  const [formData, setFormData] = useState({
    pronouns: '',
    dob: '',
    currentAddress: {
      line1: '',
      line2: '',
      landmark: '',
      pincode: '',
      location: '',
    },
    permanentAddress: {
      line1: '',
      line2: '',
      landmark: '',
      pincode: '',
      location: '',
    },
    copyAddress: false,
    hobbies: '',
  });

  const handleChange = (field, value, isPermanent = false) => {
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
        line1: '', line2: '', landmark: '', pincode: '', location: '',
      }
    });
  };

  const handleSave = () => {
    console.log('Saved Personal Details:', formData);
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
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Personal Details</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <FaEye className="cursor-pointer hover:text-blue-600" />
          <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Pronouns */}
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
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* DOB */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">DOB</p>
          <div className="relative">
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
            />
            <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Current Address */}
        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Current Address</h2>
          {renderInput('Address Line 1', 'line1', 'currentAddress', '', 'text', true)}
          {renderInput('Address Line 2', 'line2', 'currentAddress')}
          {renderInput('Landmark', 'landmark', 'currentAddress')}
          {renderInput('Pincode', 'pincode', 'currentAddress', '', 'text', true)}
          {renderInput('Location', 'location', 'currentAddress', '', 'text', true)}
        </div>

        {/* Permanent Address */}
        <div className="border rounded-lg p-4 space-y-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Permanent Address</h2>
            <label className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.copyAddress}
                onChange={handleCopyAddress}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Copy Current Address
            </label>
          </div>
          {renderInput('Address Line 1', 'line1', 'permanentAddress', '', 'text', true)}
          {renderInput('Address Line 2', 'line2', 'permanentAddress')}
          {renderInput('Landmark', 'landmark', 'permanentAddress')}
          {renderInput('Pincode', 'pincode', 'permanentAddress', '', 'text', true)}
          {renderInput('Location', 'location', 'permanentAddress', '', 'text', true)}
        </div>

        {/* Hobbies */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">Hobbies</p>
          <input
            type="text"
            placeholder="List your hobbies."
            value={formData.hobbies}
            onChange={(e) => handleChange('hobbies', e.target.value)}
            className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <span className="text-lg">✓</span> Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetails;