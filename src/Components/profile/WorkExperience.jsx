import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

const WorkExperience = () => {
    const [formData, setFormData] = useState({
        designation: '',
        organisation: '',
        employmentType: '',
        gotFromUnstop: false,
        startDate: '',
        endDate: '',
        currentlyWorking: false,
        location: '',
        remote: false,
        skills: '',
        description: '',
    });

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSave = () => {
        console.log('Saved Work Experience Data:', formData);
    };

    const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Freelance'];

    const renderSelect = (label, field, options, required = false) => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </p>
            <div className="relative">
                <select
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                    <option value="" disabled>Select {label}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
        </div>
    );

    const renderInput = (label, field, type = 'text', required = false) => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </p>
            <input
                type={type}
                placeholder={label}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
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
                    <span>Work Experience</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600 text-xl">
                    <FaEye className="cursor-pointer hover:text-blue-600" />
                    <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                    <input
                        type="checkbox"
                        checked={formData.gotFromUnstop}
                        onChange={(e) => handleChange('gotFromUnstop', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Got this job from Unstop
                </label>

                {renderSelect('Designation', 'designation', ['Software Engineer', 'Product Manager'], true)}
                {renderInput('Organisation', 'organisation', 'text', true)}
                {renderSelect('Employment Type', 'employmentType', employmentTypes, true)}

                {/* Duration Section */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Duration <span className="text-red-500">*</span>
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Start Date"
                        />
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange('endDate', e.target.value)}
                            disabled={formData.currentlyWorking}
                            className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="End Date"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                        <input
                            type="checkbox"
                            checked={formData.currentlyWorking}
                            onChange={(e) => handleChange('currentlyWorking', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Currently working in this role
                    </label>
                </div>

                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                    </p>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                        placeholder="Enter Location"
                        className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                        <input
                            type="checkbox"
                            checked={formData.remote}
                            onChange={(e) => handleChange('remote', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Remote
                    </label>
                </div>

                {renderInput('Skills', 'skills')}

                {/* Description */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <textarea
                        placeholder="Describe your role here..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={5}
                        className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* AI Button */}
                <button
                    type="button"
                    className="flex items-center gap-2 border rounded-full px-4 py-2 text-blue-600 border-blue-600 hover:bg-blue-50 w-fit"
                >
                    <span role="img" aria-label="sparkle">🔮</span> Generate with AI
                </button>

                {/* Attachments */}
                <div className="border-dashed border-2 border-gray-300 rounded-md px-4 py-6 text-center text-gray-600">
                    <span className="text-xl">➕</span> Attachments
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

export default WorkExperience;