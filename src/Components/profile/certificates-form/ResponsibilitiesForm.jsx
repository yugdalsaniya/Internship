import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import {
  fetchSectionData,
  mUpdate,
  uploadAndStoreFile,
} from "../../../Utils/api";
import { toast } from "react-toastify";

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
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get today's date for validation (YYYY-MM-DD format)
  const today = new Date().toISOString().split("T")[0];

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
        responsibilitystartdate: existingResponsibility.responsibilitystartdate
          ? new Date(existingResponsibility.responsibilitystartdate)
              .toISOString()
              .split("T")[0]
          : "",
        responsibilityenddate: existingResponsibility.responsibilityenddate
          ? new Date(existingResponsibility.responsibilityenddate)
              .toISOString()
              .split("T")[0]
          : "",
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
      resetForm();
    }

    // Fetch user ID from localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user.userid);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        toast.error("Invalid user data. Please log in again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      console.error("No user data in localStorage");
      toast.error("Please log in to manage your responsibilities.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [isEditing, existingResponsibility]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset end date if start date changes to a later date
      if (
        field === "responsibilitystartdate" &&
        !newData.currentlyworking &&
        newData.responsibilityenddate &&
        newData.responsibilityenddate <= value
      ) {
        newData.responsibilityenddate = "";
      }
      return newData;
    });
  };

  const handleCurrentlyWorkingChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      currentlyworking: checked,
      responsibilityenddate: checked ? "" : prev.responsibilityenddate,
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an image (JPEG, PNG, GIF) or PDF file.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setUploading(true);
    try {
      const response = await uploadAndStoreFile({
        appName: "app8657281202648",
        moduleName: "appuser",
        file,
        userId,
      });

      if (!response || !response.filePath) {
        throw new Error("Failed to upload file: No file path returned.");
      }

      setFormData((prev) => ({
        ...prev,
        responsibilityattachment: [
          ...prev.responsibilityattachment,
          response.filePath,
        ],
      }));
      toast.success("File uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("File upload error:", err);
      toast.error(err.message || "Failed to upload file.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      responsibilityattachment: prev.responsibilityattachment.filter(
        (_, i) => i !== index
      ),
    }));
    toast.info("Attachment removed.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.positionofresponsibility.trim())
      errors.push("Position of responsibility is required.");
    if (!formData.responsibilityorganization.trim())
      errors.push("Organization is required.");
    if (!formData.responsibilitylocation.trim() && !formData.remote)
      errors.push("Location is required when not working remotely.");
    if (!formData.responsibilitystartdate)
      errors.push("Start date is required.");
    else if (formData.responsibilitystartdate > today)
      errors.push("Start date cannot be in the future.");
    if (!formData.currentlyworking && !formData.responsibilityenddate)
      errors.push(
        "End date is required when not currently working in this role."
      );
    else if (
      !formData.currentlyworking &&
      formData.responsibilityenddate &&
      formData.responsibilityenddate <= formData.responsibilitystartdate
    )
      errors.push("End date must be after start date.");
    else if (
      !formData.currentlyworking &&
      formData.responsibilityenddate > today
    )
      errors.push("End date cannot be in the future.");

    if (errors.length > 0) {
      toast.error(errors.join(" "), {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        throw new Error("Please log in to save responsibilities.");
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
      resetForm();
      setTimeout(() => onBack(), 500); // Delay onBack to ensure toast renders
    } catch (error) {
      console.error("Error saving responsibility:", error);
      toast.error(
        error.message || "Failed to save responsibility. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
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
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
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
              disabled={isLoading || uploading}
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
              disabled={isLoading || uploading}
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
                  disabled={isLoading || uploading}
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
              disabled={formData.remote || isLoading || uploading}
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
                  disabled={isLoading || uploading}
                />
                Currently working in this role
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.responsibilitystartdate}
                onChange={(e) =>
                  handleDateChange("responsibilitystartdate", e.target.value)
                }
                max={today}
                className="w-1/2 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                disabled={isLoading || uploading}
              />
              <input
                type="date"
                value={formData.responsibilityenddate}
                onChange={(e) =>
                  handleDateChange("responsibilityenddate", e.target.value)
                }
                disabled={formData.currentlyworking || isLoading || uploading}
                min={formData.responsibilitystartdate || undefined}
                max={today}
                className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
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
              disabled={isLoading || uploading}
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
              disabled={isLoading || uploading}
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachments
            </label>
            <div className="w-full border border-dashed border-gray-400 rounded-md p-4">
              <label
                htmlFor="file-upload"
                className={`flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-100 transition ${
                  uploading || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FaPlus />
                <span>{uploading ? "Uploading..." : "Add Attachment"}</span>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || isLoading}
                />
              </label>
            </div>
            {formData.responsibilityattachment.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.responsibilityattachment.map((fileUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border rounded-md p-2"
                  >
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[80%]"
                    >
                      {fileUrl.split("/").pop()}
                    </a>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isLoading || uploading}
                    >
                      <RxCross2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between mt-4">
            {/* Discard/Cancel Button */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 cursor-pointer hover:bg-gray-100 transition">
              <RxCross2 className="text-gray-600" />
              <button
                onClick={onBack}
                className="text-gray-700 font-medium"
                disabled={isLoading || uploading}
              >
                {isEditing ? "Cancel" : "Discard"}
              </button>
            </div>

            {/* Save Button */}
            <div
              className={`flex items-center gap-2 bg-sky-500 rounded-3xl px-4 py-2 cursor-pointer hover:bg-sky-600 transition ${
                isLoading || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <IoCheckmark className="text-white" />
              <button
                onClick={handleSave}
                disabled={isLoading || uploading}
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
