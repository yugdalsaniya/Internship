import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { fetchSectionData, mUpdate } from "../../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResponsibilitiesForm = ({
  onBack,
  existingResponsibility = null,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    positionofresponsibility: "",
    responsibilityorganization: "",
    responsibilitylocation: "",
    remote: false,
    responsibilitystartdate: "",
    responsibilityenddate: "",
    currentlyworking: false,
    responsibilityskill: "",
    responsibilitydescription: "",
    responsibilityattachment: [],
  });

  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Populate form data if editing an existing responsibility
    if (isEditing && existingResponsibility) {
      setFormData({
        positionofresponsibility:
          existingResponsibility.positionofresponsibility || "",
        responsibilityorganization:
          existingResponsibility.responsibilityorganization || "",
        responsibilitylocation:
          existingResponsibility.responsibilitylocation || "",
        remote: existingResponsibility.remote || false,
        responsibilitystartdate:
          existingResponsibility.responsibilitystartdate || "",
        responsibilityenddate:
          existingResponsibility.responsibilityenddate || "",
        currentlyworking: existingResponsibility.currentlyworking || false,
        responsibilityskill: existingResponsibility.responsibilityskill
          ? existingResponsibility.responsibilityskill.join(", ")
          : "",
        responsibilitydescription:
          existingResponsibility.responsibilitydescription || "",
        responsibilityattachment:
          existingResponsibility.responsibilityattachment || [],
      });
    } else {
      // Reset form if not editing or if existingResponsibility is null
      resetForm();
    }

    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user.userid);
      } catch (parseError) {
        setError("Invalid user data. Please log in again.");
      }
    } else {
      setError("Please log in to manage your responsibilities.");
    }
  }, [isEditing, existingResponsibility]);

  const handleChange = (field, value) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCurrentlyWorkingChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      currentlyworking: checked,
      responsibilityenddate: checked ? "" : prev.responsibilityenddate,
    }));
  };

  const validateForm = () => {
    if (!formData.positionofresponsibility.trim()) {
      setError("Position of responsibility is required.");
      return false;
    }
    if (!formData.responsibilityorganization.trim()) {
      setError("Organization is required.");
      return false;
    }
    if (!formData.responsibilitylocation.trim() && !formData.remote) {
      setError("Location is required when not working remotely.");
      return false;
    }
    if (!formData.responsibilitystartdate) {
      setError("Start date is required.");
      return false;
    }
    if (!formData.currentlyworking && !formData.responsibilityenddate) {
      setError("End date is required when not currently working in this role.");
      return false;
    }
    if (
      !formData.currentlyworking &&
      formData.responsibilityenddate &&
      new Date(formData.responsibilityenddate) <=
        new Date(formData.responsibilitystartdate)
    ) {
      setError("End date must be after start date.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        setError("Please log in to save responsibilities.");
        return;
      }

      if (!validateForm()) {
        return;
      }

      const responsibilityData = {
        positionofresponsibility: formData.positionofresponsibility.trim(),
        responsibilityorganization: formData.responsibilityorganization.trim(),
        responsibilitylocation: formData.remote
          ? ""
          : formData.responsibilitylocation.trim(),
        remote: formData.remote,
        responsibilitystartdate: formData.responsibilitystartdate,
        responsibilityenddate: formData.currentlyworking
          ? null
          : formData.responsibilityenddate,
        currentlyworking: formData.currentlyworking,
        responsibilityskill: formData.responsibilityskill
          ? formData.responsibilityskill
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        responsibilitydescription: formData.responsibilitydescription.trim(),
        responsibilityattachment: formData.responsibilityattachment || [],
        createdAt:
          isEditing && existingResponsibility
            ? existingResponsibility.createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Fetch current responsibilities to update the array
      const existingUserData = await fetchSectionData({
        collectionName: "appuser",
        query: { _id: userId },
        dbName: "internph",
      });
      const currentResponsibilities =
        existingUserData[0]?.sectionData?.appuser?.responsibilitydetails || [];

      let updatedResponsibilities;
      if (isEditing) {
        updatedResponsibilities = currentResponsibilities.map(
          (responsibility) =>
            responsibility.createdAt === existingResponsibility.createdAt
              ? responsibilityData
              : responsibility
        );
      } else {
        updatedResponsibilities = [
          ...currentResponsibilities,
          responsibilityData,
        ];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.responsibilitydetails":
              updatedResponsibilities,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      resetForm();
      onBack(); // Go back to the previous page after saving

      toast.success(
        isEditing
          ? "Responsibility updated successfully!"
          : "Responsibility added successfully!",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      console.error("Error saving responsibility:", error);
      setError(
        error.message || "Failed to save responsibility. Please try again."
      );
      toast.error("Failed to save responsibility. Please try again.", {
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

  const resetForm = () => {
    setFormData({
      positionofresponsibility: "",
      responsibilityorganization: "",
      responsibilitylocation: "",
      remote: false,
      responsibilitystartdate: "",
      responsibilityenddate: "",
      currentlyworking: false,
      responsibilityskill: "",
      responsibilitydescription: "",
      responsibilityattachment: [],
    });
    setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />

      {/* Error Message */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}

      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>
            {isEditing ? "Edit Responsibility" : "Add Responsibility"}
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Add/Edit Responsibility Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Responsibility" : "Add New Responsibility"}
          </h3>

          {/* Position of Responsibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position of Responsibility<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Designation"
              value={formData.positionofresponsibility}
              onChange={(e) =>
                handleChange("positionofresponsibility", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Select Organisation"
              value={formData.responsibilityorganization}
              onChange={(e) =>
                handleChange("responsibilityorganization", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Location */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location<span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.remote}
                  onChange={(e) => handleChange("remote", e.target.checked)}
                />
                Remote
              </label>
            </div>
            <input
              type="text"
              placeholder="Select Location"
              value={formData.responsibilitylocation}
              onChange={(e) =>
                handleChange("responsibilitylocation", e.target.value)
              }
              disabled={formData.remote}
              className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 ${
                formData.remote ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Duration */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration<span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.currentlyworking}
                  onChange={(e) =>
                    handleCurrentlyWorkingChange(e.target.checked)
                  }
                />
                Currently working in this role
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.responsibilitystartdate}
                onChange={(e) =>
                  handleChange("responsibilitystartdate", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
              />
              <input
                type="date"
                value={formData.responsibilityenddate}
                onChange={(e) =>
                  handleChange("responsibilityenddate", e.target.value)
                }
                disabled={formData.currentlyworking}
                className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
                  formData.currentlyworking
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Summarize the tasks you handled in your roles, the core competencies you applied or enhanced, and notable experiences or accomplishments gained through these efforts."
              value={formData.responsibilitydescription}
              onChange={(e) =>
                handleChange("responsibilitydescription", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              rows={5}
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skills
            </label>
            <input
              type="text"
              placeholder="Add skills (comma-separated)"
              value={formData.responsibilityskill}
              onChange={(e) =>
                handleChange("responsibilityskill", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Attachments */}
          <div className="w-full border border-dashed border-gray-400 rounded-md">
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700">
              <FaPlus />
              Attachments
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between mt-4">
            {/* Discard/Cancel Button */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition">
              <RxCross2 className="text-gray-600" />
              <button onClick={onBack} className="text-gray-700 font-medium">
                {isEditing ? "Cancel" : "Discard"}
              </button>
            </div>

            {/* Save Button */}
            <div
              className={`flex items-center gap-2 bg-sky-500 rounded-3xl px-4 py-2 cursor-pointer hover:bg-sky-600 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <IoCheckmark className="text-white" />
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="text-white font-medium"
              >
                {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsibilitiesForm;
