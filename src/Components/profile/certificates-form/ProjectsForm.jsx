import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { fetchSectionData, mUpdate } from "../../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const projectTypes = ["Full time", "Part time", "Freelance"];

  useEffect(() => {
    // Populate form data if editing an existing project
    if (isEditing && existingProject) {
      setFormData({
        titleofproject: existingProject.titleofproject || "",
        projecttype: existingProject.projecttype || "",
        projectstartdate: existingProject.projectstartdate || "",
        projectenddate: existingProject.projectenddate || "",
        ongoing: existingProject.ongoing || false,
        projectdescription: existingProject.projectdescription || "",
        projectskill: existingProject.projectskill
          ? existingProject.projectskill.join(", ")
          : "",
        projectattachment: existingProject.projectattachment || [],
      });
    } else {
      // Reset form if not editing or if existingProject is null
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
      setError("Please log in to manage your projects.");
    }
  }, [isEditing, existingProject]);

  const handleChange = (field, value) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeSelect = (type) => {
    handleChange("projecttype", type);
  };

  const handleOngoingChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      ongoing: checked,
      projectenddate: checked ? "" : prev.projectenddate,
    }));
  };

  const validateForm = () => {
    if (!formData.titleofproject.trim()) {
      setError("Project title is required.");
      return false;
    }
    if (!formData.projecttype) {
      setError("Project type is required.");
      return false;
    }
    if (!formData.projectstartdate) {
      setError("Start date is required.");
      return false;
    }
    if (!formData.ongoing && !formData.projectenddate) {
      setError("End date is required when project is not ongoing.");
      return false;
    }
    if (
      !formData.ongoing &&
      formData.projectenddate &&
      new Date(formData.projectenddate) <= new Date(formData.projectstartdate)
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
        setError("Please log in to save projects.");
        return;
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
        projectattachment: formData.projectattachment || [],
        // Keep existing createdAt for edits, otherwise set new
        createdAt:
          isEditing && existingProject
            ? existingProject.createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Fetch current projects to update the array
      const existingUserData = await fetchSectionData({
        collectionName: "appuser",
        query: { _id: userId },
        dbName: "internph",
      });
      const currentProjects =
        existingUserData[0]?.sectionData?.appuser?.projectdetails || [];

      let updatedProjects;
      if (isEditing) {
        // Find the index of the project being edited and replace it
        updatedProjects = currentProjects.map((project) =>
          project.createdAt === existingProject.createdAt // Assuming createdAt is unique for identification
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

      resetForm();
      onBack(); // Go back to accomplishments page after saving

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
    } catch (error) {
      console.error("Error saving project:", error);
      setError(error.message || "Failed to save project. Please try again.");
      toast.error("Failed to save project. Please try again.", {
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
      titleofproject: "",
      projecttype: "",
      projectstartdate: "",
      projectenddate: "",
      ongoing: false,
      projectdescription: "",
      projectskill: "",
      projectattachment: [],
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
                />
                Ongoing
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.projectstartdate}
                onChange={(e) =>
                  handleChange("projectstartdate", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
              />
              <input
                type="date"
                value={formData.projectenddate}
                onChange={(e) => handleChange("projectenddate", e.target.value)}
                disabled={formData.ongoing}
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

export default ProjectsForm;
