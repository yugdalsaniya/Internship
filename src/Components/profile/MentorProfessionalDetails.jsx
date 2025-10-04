import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { BiTime } from "react-icons/bi";
import { mUpdate, fetchSectionData } from "../../Utils/api";

const MentorProfessionalDetails = ({ userData, updateCompletionStatus }) => {
  const [areaofexperties, setAreaofexperties] = useState("");
  const [yearsofexperience, setYearsofexperience] = useState("");
  const [mentorspecializations, setMentorspecializations] = useState([]);
  const [mentoreducationbackground, setMentoreducationbackground] =
    useState("");
  const [mentorcertifications, setMentorcertifications] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch data fresh from DB
  useEffect(() => {
    if (!userData.userid) {
      toast.error("Please log in to view professional details.", {
        autoClose: 5000,
      });
      return;
    }

    const fetchDetails = async () => {
      try {
        const response = await fetchSectionData({
          appName: "app8657281202648",
          collectionName: "appuser",
          query: { _id: userData.userid },
          projection: {
            "sectionData.appuser.areaofexperties": 1,
            "sectionData.appuser.yearsofexperience": 1,
            "sectionData.appuser.mentorspecializations": 1,
            "sectionData.appuser.mentoreducationbackground": 1,
            "sectionData.appuser.mentorcertifications": 1,
          },
        });

        const apiData = response[0];
        if (!apiData) {
          updateCompletionStatus("Professional Details", false);
          return;
        }

        const user = apiData.sectionData.appuser || {};
        setAreaofexperties(user.areaofexperties || "");
        setYearsofexperience(user.yearsofexperience || "");
        setMentorspecializations(user.mentorspecializations || []);
        setMentoreducationbackground(user.mentoreducationbackground || "");
        setMentorcertifications(user.mentorcertifications || []);

        // ✅ Completion check
        if (
          user.areaofexperties &&
          user.yearsofexperience &&
          (user.mentorspecializations || []).length > 0
        ) {
          setIsFirstSaveSuccessful(true);
          updateCompletionStatus("Professional Details", true);
        } else {
          updateCompletionStatus("Professional Details", false);
        }
      } catch (err) {
        console.error("Error fetching professional details:", err);
        toast.error("Failed to load professional details.", {
          autoClose: 5000,
        });
        updateCompletionStatus("Professional Details", false);
      }
    };

    fetchDetails();
  }, [userData.userid, updateCompletionStatus]);

  const validateForm = () => {
    if (!areaofexperties.trim()) return "Area of expertise is required.";
    if (!yearsofexperience) return "Years of experience is required.";
    if (mentorspecializations.length === 0)
      return "At least one specialization is required.";
    return "";
  };

  const handleAddSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !mentorspecializations.includes(newSpecialization.trim())
    ) {
      setMentorspecializations([
        ...mentorspecializations,
        newSpecialization.trim(),
      ]);
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (index) => {
    setMentorspecializations(
      mentorspecializations.filter((_, i) => i !== index)
    );
  };

  const handleAddCertification = () => {
    if (
      newCertification.trim() &&
      !mentorcertifications.includes(newCertification.trim())
    ) {
      setMentorcertifications([
        ...mentorcertifications,
        newCertification.trim(),
      ]);
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (index) => {
    setMentorcertifications(mentorcertifications.filter((_, i) => i !== index));
  };

  const [newCertification, setNewCertification] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");

  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, { autoClose: 5000 });
      setTimeout(() => setError(""), 5000);
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const userId = userData?.userid;
      if (!userId) throw new Error("User ID not found. Please log in again.");

      const updateData = {
        $set: {
          "sectionData.appuser.areaofexperties": areaofexperties.trim(),
          "sectionData.appuser.yearsofexperience": yearsofexperience,
          "sectionData.appuser.mentorspecializations": mentorspecializations,
          "sectionData.appuser.mentoreducationbackground":
            mentoreducationbackground.trim(),
          "sectionData.appuser.mentorcertifications": mentorcertifications,
          "sectionData.appuser.editedAt": new Date().toISOString(),
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
        (updateResponse.success || updateResponse.modifiedCount > 0)
      ) {
        toast.success("Professional details updated successfully!", {
          autoClose: 3000,
        });
        if (!isFirstSaveSuccessful) setIsFirstSaveSuccessful(true);
        updateCompletionStatus("Professional Details", true);
      } else {
        throw new Error("Failed to update details in database.");
      }
    } catch (err) {
      console.error("Error saving professional details:", err);
      const msg = err.message || "Failed to update details. Please try again.";
      setError(msg);
      toast.error(msg, { autoClose: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const experienceOptions = [
    { value: "1-3 years", label: "1-3 years" },
    { value: "3-5 years", label: "3-5 years" },
    { value: "5-10 years", label: "5-10 years" },
    { value: "10+ years", label: "10+ years" },
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
        {/* Area of Expertise */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Area of Expertise <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={areaofexperties}
            onChange={(e) => setAreaofexperties(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Development, Data Science"
            disabled={isProcessing}
          />
        </div>

        {/* Years of Experience */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg p-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={yearsofexperience}
            onChange={(e) => setYearsofexperience(e.target.value)}
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

        {/* Specializations */}
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
            {mentorspecializations.map((spec, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
              >
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

        {/* Education */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Education Background
          </label>
          <input
            type="text"
            value={mentoreducationbackground}
            onChange={(e) => setMentoreducationbackground(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Bachelor's in CS, MBA"
            disabled={isProcessing}
          />
        </div>

        {/* Certifications */}
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
            {mentorcertifications.map((cert, index) => (
              <div
                key={index}
                className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center"
              >
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

export default MentorProfessionalDetails;
