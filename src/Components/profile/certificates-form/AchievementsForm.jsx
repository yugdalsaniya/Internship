import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { fetchSectionData, mUpdate } from "../../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AchievementsForm = ({ onBack, existingAchievement, isEditing }) => {
  const [formData, setFormData] = useState({
    titleofachievement: "",
    achievementdescription: "",
    achievementskill: "",
    achievementattachment: [],
  });

  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Populate form data if editing an existing achievement
    if (isEditing && existingAchievement) {
      setFormData({
        titleofachievement: existingAchievement.titleofachievement || "",
        achievementdescription:
          existingAchievement.achievementdescription || "",
        achievementskill: existingAchievement.achievementskill
          ? existingAchievement.achievementskill.join(", ")
          : "",
        achievementattachment: existingAchievement.achievementattachment || [],
      });
    } else {
      // Reset form if not editing or if existingAchievement is null
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
      setError("Please log in to manage your achievements.");
    }
  }, [isEditing, existingAchievement]);

  const handleChange = (field, value) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.titleofachievement.trim()) {
      setError("Achievement title is required.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        setError("Please log in to save achievements.");
        return;
      }

      if (!validateForm()) {
        return;
      }

      const achievementData = {
        titleofachievement: formData.titleofachievement.trim(),
        achievementdescription: formData.achievementdescription.trim(),
        achievementskill: formData.achievementskill
          ? formData.achievementskill
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        achievementattachment: formData.achievementattachment || [],
        createdAt:
          isEditing && existingAchievement
            ? existingAchievement.createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Fetch current achievements to update the array
      const existingUserData = await fetchSectionData({
        collectionName: "appuser",
        query: { _id: userId },
        dbName: "internph",
      });
      const currentAchievements =
        existingUserData[0]?.sectionData?.appuser?.achievementsdetails || [];

      let updatedAchievements;
      if (isEditing) {
        // Find the index of the achievement being edited and replace it
        updatedAchievements = currentAchievements.map((achievement) =>
          achievement.createdAt === existingAchievement.createdAt
            ? achievementData
            : achievement
        );
      } else {
        updatedAchievements = [...currentAchievements, achievementData];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.achievementsdetails": updatedAchievements,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      resetForm();
      onBack(); // Go back to the previous page after saving

      toast.success(
        isEditing
          ? "Achievement updated successfully!"
          : "Achievement added successfully!",
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
      console.error("Error saving achievement:", error);
      setError(
        error.message || "Failed to save achievement. Please try again."
      );
      toast.error("Failed to save achievement. Please try again.", {
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
      titleofachievement: "",
      achievementdescription: "",
      achievementskill: "",
      achievementattachment: [],
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
          <span>{isEditing ? "Edit Achievement" : "Add Achievement"}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Add/Edit Achievement Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Achievement" : "Add New Achievement"}
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title Of Achievement<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Title of Achievement"
              value={formData.titleofachievement}
              onChange={(e) =>
                handleChange("titleofachievement", e.target.value)
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
              placeholder="Outline your accomplishment, highlighting the abilities you gained, obstacles you tackled, and the importance or influence this had on your career path."
              value={formData.achievementdescription}
              onChange={(e) =>
                handleChange("achievementdescription", e.target.value)
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
              value={formData.achievementskill}
              onChange={(e) => handleChange("achievementskill", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Attachments */}
          <div className="w-full border border-dashed border-gray-400 rounded-md">
            <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-gray-700">
              <FaPlus />
              Attachment
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

export default AchievementsForm;
