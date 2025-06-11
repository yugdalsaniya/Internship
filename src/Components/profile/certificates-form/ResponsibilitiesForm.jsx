import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { fetchSectionData, mUpdate } from "../../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResponsibilitiesForm = ({ onBack }) => {
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

  const [responsibilities, setResponsibilities] = useState([]);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = localStorage.getItem("user");
        let userIdLocal;

        if (!userString) {
          setError("Please log in to view your responsibilities.");
          return;
        }

        try {
          const user = JSON.parse(userString);
          userIdLocal = user.userid;
          setUserId(userIdLocal);
        } catch (parseError) {
          setError("Invalid user data. Please log in again.");
          return;
        }

        const data = await fetchSectionData({
          collectionName: "appuser",
          query: { _id: userIdLocal },
          dbName: "internph",
        });

        if (
          data.length > 0 &&
          data[0].sectionData?.appuser?.responsibilitydetails
        ) {
          setResponsibilities(
            data[0].sectionData.appuser.responsibilitydetails
          );
        }
      } catch (error) {
        console.error("Error fetching responsibilities data:", error);
        setError("Failed to load responsibilities data. Please try again.");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (field, value) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
        responsibilitylocation: formData.responsibilitylocation.trim(),
        remote: formData.remote,
        responsibilitystartdate: formData.responsibilitystartdate,
        responsibilityenddate: formData.currentlyworking
          ? ""
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
        createdAt: isEditing
          ? responsibilities[editingIndex].createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedResponsibilities;
      if (isEditing) {
        updatedResponsibilities = [...responsibilities];
        updatedResponsibilities[editingIndex] = responsibilityData;
      } else {
        updatedResponsibilities = [...responsibilities, responsibilityData];
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

      setResponsibilities(updatedResponsibilities);
      resetForm();

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

  const handleEdit = (index) => {
    const responsibility = responsibilities[index];
    setFormData({
      positionofresponsibility: responsibility.positionofresponsibility || "",
      responsibilityorganization:
        responsibility.responsibilityorganization || "",
      responsibilitylocation: responsibility.responsibilitylocation || "",
      remote: responsibility.remote || false,
      responsibilitystartdate: responsibility.responsibilitystartdate || "",
      responsibilityenddate: responsibility.responsibilityenddate || "",
      currentlyworking: responsibility.currentlyworking || false,
      responsibilityskill: responsibility.responsibilityskill
        ? responsibility.responsibilityskill.join(", ")
        : "",
      responsibilitydescription: responsibility.responsibilitydescription || "",
      responsibilityattachment: responsibility.responsibilityattachment || [],
    });
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    if (
      !window.confirm("Are you sure you want to delete this responsibility?")
    ) {
      return;
    }

    try {
      setIsLoading(true);
      const updatedResponsibilities = responsibilities.filter(
        (_, i) => i !== index
      );

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

      setResponsibilities(updatedResponsibilities);
      toast.success("Responsibility deleted successfully!");
    } catch (error) {
      console.error("Error deleting responsibility:", error);
      toast.error("Failed to delete responsibility. Please try again.");
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
    setIsEditing(false);
    setEditingIndex(-1);
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
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
          <span>Responsibilities</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Existing Responsibilities */}
        {responsibilities.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Your Responsibilities
            </h3>
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {responsibility.positionofresponsibility}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {responsibility.responsibilityorganization}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>
                        {responsibility.remote
                          ? "Remote"
                          : responsibility.responsibilitylocation}
                      </span>
                      <span>•</span>
                      <span>
                        {formatDate(responsibility.responsibilitystartdate)} -{" "}
                        {responsibility.currentlyworking
                          ? "Present"
                          : formatDate(responsibility.responsibilityenddate)}
                      </span>
                    </div>
                    {responsibility.responsibilitydescription && (
                      <p className="text-sm text-gray-600 mt-2">
                        {responsibility.responsibilitydescription}
                      </p>
                    )}
                    {responsibility.responsibilityskill &&
                      responsibility.responsibilityskill.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {responsibility.responsibilityskill.map(
                            (skill, i) => (
                              <span
                                key={i}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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
                formData.remote ? "bg-gray-100" : ""
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
                    handleChange("currentlyworking", e.target.checked)
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
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
              />
              <input
                type="date"
                value={formData.responsibilityenddate}
                onChange={(e) =>
                  handleChange("responsibilityenddate", e.target.value)
                }
                disabled={formData.currentlyworking}
                className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
                  formData.currentlyworking ? "bg-gray-100" : ""
                }`}
              />
            </div>
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

          {/* Attachments */}
          <div className="w-full border border-dashed border-gray-400 rounded-md">
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700">
              <FaPlus />
              Attachments
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between mt-4">
            {/* Discard Button */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition">
              <RxCross2 className="text-gray-600" />
              <button
                onClick={isEditing ? resetForm : onBack}
                className="text-gray-700 font-medium"
              >
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
