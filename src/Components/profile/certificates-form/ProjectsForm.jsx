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

const ProjectsForm = ({ onBack, existingProject, isEditing }) => {
  const [formData, setFormData] = useState({
    titleofproject: "",
    projecttype: "",
    projectstartdate: "",
    projectenddate: "",
    ongoing: false,
    projectdescription: "",
    projectskill: "",
    projectattachment: [],
  });

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const projectTypes = ["Full time", "Part time", "Freelance"];
  // Get today's date for validation (YYYY-MM-DD format)
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    console.log(
      "ProjectsForm useEffect: isEditing=",
      isEditing,
      "existingProject=",
      existingProject
    );
    // Populate form data if editing an existing project
    if (isEditing && existingProject) {
      setFormData({
        titleofproject: existingProject.titleofproject || "",
        projecttype: existingProject.projecttype || "",
        projectstartdate: existingProject.projectstartdate
          ? new Date(existingProject.projectstartdate)
              .toISOString()
              .split("T")[0]
          : "",
        projectenddate: existingProject.projectenddate
          ? new Date(existingProject.projectenddate).toISOString().split("T")[0]
          : "",
        ongoing: existingProject.ongoing || false,
        projectdescription: existingProject.projectdescription || "",
        projectskill: existingProject.projectskill
          ? existingProject.projectskill.join(", ")
          : "",
        projectattachment: existingProject.projectattachment || [],
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
        console.log("User ID set:", user.userid);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        toast.error("Invalid user data. Please log in again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      console.error("No user data in localStorage");
      toast.error("Please log in to manage your projects.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [isEditing, existingProject]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeSelect = (type) => {
    handleChange("projecttype", type);
  };

  const handleDateChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset end date if start date changes to a later date
      if (
        field === "projectstartdate" &&
        !newData.ongoing &&
        newData.projectenddate &&
        newData.projectenddate <= value
      ) {
        newData.projectenddate = "";
      }
      return newData;
    });
  };

  const handleOngoingChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      ongoing: checked,
      projectenddate: checked ? "" : prev.projectenddate,
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
        projectattachment: [...prev.projectattachment, response.filePath],
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
      // Reset file input
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      projectattachment: prev.projectattachment.filter((_, i) => i !== index),
    }));
    toast.info("Attachment removed.", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.titleofproject.trim())
      errors.push("Project title is required.");
    if (!formData.projecttype) errors.push("Project type is required.");
    if (!formData.projectstartdate) errors.push("Start date is required.");
    else if (formData.projectstartdate > today)
      errors.push("Start date cannot be in the future.");
    if (!formData.ongoing && !formData.projectenddate)
      errors.push("End date is required when project is not ongoing.");
    else if (
      !formData.ongoing &&
      formData.projectenddate &&
      formData.projectenddate <= formData.projectstartdate
    )
      errors.push("End date must be after start date.");
    else if (!formData.ongoing && formData.projectenddate > today)
      errors.push("End date cannot be in the future.");

    if (errors.length > 0) {
      console.log("Validation errors:", errors);
      toast.error(errors.join(" "), {
        position: "top-right",
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log("handleSave called with formData:", formData);
    try {
      setIsLoading(true);

      if (!userId) {
        throw new Error("Please log in to save projects.");
      }

      if (!validateForm()) {
        return;
      }

      const projectData = {
        titleofproject: formData.titleofproject.trim(),
        projecttype: formData.projecttype,
        projectstartdate: formData.projectstartdate,
        projectenddate: formData.ongoing ? null : formData.projectenddate,
        ongoing: formData.ongoing,
        projectdescription: formData.projectdescription.trim(),
        projectskill: formData.projectskill
          ? formData.projectskill
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        projectattachment: formData.projectattachment,
        createdAt:
          isEditing && existingProject
            ? existingProject.createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Project data to save:", projectData);

      const existingUserData = await fetchSectionData({
        collectionName: "appuser",
        query: { _id: userId },
        dbName: "internph",
      });
      const currentProjects =
        existingUserData[0]?.sectionData?.appuser?.projectdetails || [];

      let updatedProjects;
      if (isEditing) {
        updatedProjects = currentProjects.map((project) =>
          project.createdAt === existingProject.createdAt
            ? projectData
            : project
        );
      } else {
        updatedProjects = [...currentProjects, projectData];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.projectdetails": updatedProjects,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      console.log("Project saved successfully");
      toast.success(
        isEditing
          ? "Project updated successfully!"
          : "Project added successfully!",
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
      console.error("Error saving project:", error);
      toast.error(
        error.message || "Failed to save project. Please try again.",
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
      titleofproject: "",
      projecttype: "",
      projectstartdate: "",
      projectenddate: "",
      ongoing: false,
      projectdescription: "",
      projectskill: "",
      projectattachment: [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>{isEditing ? "Edit Project" : "Add Project"}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Add/Edit Project Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h3>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Project name"
              value={formData.titleofproject}
              onChange={(e) => handleChange("titleofproject", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              disabled={isLoading || uploading}
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {projectTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`border rounded-3xl px-4 py-2 transition ${
                    formData.projecttype === type
                      ? "border-blue-500 text-blue-500 hover:bg-blue-50"
                      : "border-gray-300 border-dashed text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleTypeSelect(type)}
                  disabled={isLoading || uploading}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Project Duration */}
          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Duration<span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.ongoing}
                  onChange={(e) => handleOngoingChange(e.target.checked)}
                  disabled={isLoading || uploading}
                />
                Ongoing
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.projectstartdate}
                onChange={(e) =>
                  handleDateChange("projectstartdate", e.target.value)
                }
                max={today}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
                disabled={isLoading || uploading}
              />
              <input
                type="date"
                value={formData.projectenddate}
                onChange={(e) =>
                  handleDateChange("projectenddate", e.target.value)
                }
                disabled={formData.ongoing || isLoading || uploading}
                min={formData.projectstartdate || undefined}
                max={today}
                className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
                  formData.ongoing ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              placeholder="Describe the project you contributed to, your responsibilities, the abilities you developed or learned, and the major takeaways or results of your participation."
              value={formData.projectdescription}
              onChange={(e) =>
                handleChange("projectdescription", e.target.value)
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
              value={formData.projectskill}
              onChange={(e) => handleChange("projectskill", e.target.value)}
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
            {/* Display uploaded attachments */}
            {formData.projectattachment.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.projectattachment.map((fileUrl, index) => (
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

export default ProjectsForm;
