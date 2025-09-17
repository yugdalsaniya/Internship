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
import 'react-toastify/dist/ReactToastify.css';

const CertificatesForm = ({ onBack, existingCertificate, isEditing }) => {
  const [formData, setFormData] = useState({
    titleofcertificates: "",
    issuingorganization: "",
    certificatestartdate: "",
    certificateenddate: "",
    hasexpirydate: false,
    certificatelink: "",
    certificateskill: "",
    certificatedescription: "",
    certificateattachment: [],
  });

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get today's date for validation (YYYY-MM-DD format)
  const today = new Date().toISOString().split("T")[0];
  // Set minimum date as January 1, 1900
  const minDate = "1900-01-01";

  useEffect(() => {
   
    // Populate form data if editing an existing certificate
    if (isEditing && existingCertificate) {
      setFormData({
        titleofcertificates: existingCertificate.titleofcertificates || "",
        issuingorganization: existingCertificate.issuingorganization || "",
        certificatestartdate: existingCertificate.certificatestartdate
          ? new Date(existingCertificate.certificatestartdate)
              .toISOString()
              .split("T")[0]
          : "",
        certificateenddate: existingCertificate.certificateenddate
          ? new Date(existingCertificate.certificateenddate)
              .toISOString()
              .split("T")[0]
          : "",
        hasexpirydate: existingCertificate.hasexpirydate || false,
        certificatelink: existingCertificate.certificatelink || "",
        certificateskill: existingCertificate.certificateskill
          ? existingCertificate.certificateskill.join(", ")
          : "",
        certificatedescription:
          existingCertificate.certificatedescription || "",
        certificateattachment: existingCertificate.certificateattachment || [],
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
      toast.error("Please log in to manage your certificates.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [isEditing, existingCertificate]);

  const isValidDate = (dateStr) => {
    if (!dateStr) return true; // Allow empty dates for initial state
    const date = new Date(dateStr);
    const minYear = 1900;
    const todayDate = new Date(today);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return false;
    }

    // Extract year, month, day
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-based
    const day = date.getDate();

    // Check year (not before 1900, not in future)
    if (year < minYear || date > todayDate) {
      return false;
    }

    // Check month (1-12)
    if (month < 1 || month > 12) {
      return false;
    }

    // Check day based on month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
      return false;
    }

    return true;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field, value) => {
    if (value && !isValidDate(value)) {
      toast.error(
        field === "certificatestartdate"
          ? "Please enter a valid start date (1900 or later, not in the future)."
          : "Please enter a valid end date (after start date, not in the future).",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      return;
    }

    // Additional validation for end date to ensure it's after start date
    if (field === "certificateenddate" && value && formData.certificatestartdate) {
      if (value <= formData.certificatestartdate) {
        toast.error("End date must be after start date.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
    }

    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset end date if start date changes to a later date
      if (
        field === "certificatestartdate" &&
        newData.hasexpirydate &&
        newData.certificateenddate &&
        newData.certificateenddate <= value
      ) {
        newData.certificateenddate = "";
        toast.info("End date reset as it was earlier than the new start date.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return newData;
    });
  };

  const handleExpiryDateChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      hasexpirydate: checked,
      certificateenddate: checked ? prev.certificateenddate : "",
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
        certificateattachment: [
          ...prev.certificateattachment,
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
      // Reset file input
      e.target.value = null;
    }
  };

  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      certificateattachment: prev.certificateattachment.filter(
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
    if (!formData.titleofcertificates.trim())
      errors.push("Certificate title is required.");
    if (!formData.issuingorganization.trim())
      errors.push("Issuing organization is required.");
    if (!formData.certificatestartdate) {
      errors.push("Start date is required.");
    } else if (!isValidDate(formData.certificatestartdate)) {
      errors.push("Invalid start date. Must be a valid date from 1900 to today.");
    } else if (formData.certificatestartdate > today) {
      errors.push("Start date cannot be in the future.");
    }
    if (formData.hasexpirydate && !formData.certificateenddate) {
      errors.push("End date is required when expiry date is selected.");
    } else if (
      formData.hasexpirydate &&
      formData.certificateenddate &&
      !isValidDate(formData.certificateenddate)
    ) {
      errors.push("Invalid end date. Must be a valid date.");
    } else if (
      formData.hasexpirydate &&
      formData.certificateenddate &&
      formData.certificateenddate <= formData.certificatestartdate
    ) {
      errors.push("End date must be after start date.");
    } else if (
      formData.hasexpirydate &&
      formData.certificateenddate &&
      formData.certificateenddate > today
    ) {
      errors.push("End date cannot be in the future.");
    }
    if (
      formData.certificatelink &&
      !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(formData.certificatelink)
    ) {
      errors.push("Invalid URL format for certificate link.");
    }

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
        throw new Error("Please log in to save certificates.");
      }

      if (!validateForm()) {
        return;
      }

      const certificateData = {
        titleofcertificates: formData.titleofcertificates.trim(),
        issuingorganization: formData.issuingorganization.trim(),
        certificatestartdate: formData.certificatestartdate,
        certificateenddate: formData.hasexpirydate
          ? formData.certificateenddate
          : null,
        hasexpirydate: formData.hasexpirydate,
        certificatelink: formData.certificatelink.trim(),
        certificateskill: formData.certificateskill
          ? formData.certificateskill
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill)
          : [],
        certificatedescription: formData.certificatedescription.trim(),
        certificateattachment: formData.certificateattachment,
        createdAt:
          isEditing && existingCertificate
            ? existingCertificate.createdAt
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };


      const existingUserData = await fetchSectionData({
        collectionName: "appuser",
        query: { _id: userId },
        dbName: "internph",
      });
      const currentCertificates =
        existingUserData[0]?.sectionData?.appuser?.certificatesdetails || [];

      let updatedCertificates;
      if (isEditing) {
        updatedCertificates = currentCertificates.map((cert) =>
          cert.createdAt === existingCertificate.createdAt
            ? certificateData
            : cert
        );
      } else {
        updatedCertificates = [...currentCertificates, certificateData];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.certificatesdetails": updatedCertificates,
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      toast.success(
        isEditing
          ? "Certificate updated successfully!"
          : "Certificate added successfully!",
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
      console.error("Error saving certificate:", error);
      toast.error(
        error.message || "Failed to save certificate. Please try again.",
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
      titleofcertificates: "",
      issuingorganization: "",
      certificatestartdate: "",
      certificateenddate: "",
      hasexpirydate: false,
      certificatelink: "",
      certificateskill: "",
      certificatedescription: "",
      certificateattachment: [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>{isEditing ? "Edit Certificate" : "Add Certificate"}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Certificate" : "Add New Certificate"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title Of Certificate<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Title of Certificate"
              value={formData.titleofcertificates}
              onChange={(e) =>
                handleChange("titleofcertificates", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              disabled={isLoading || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Organisation"
              value={formData.issuingorganization}
              onChange={(e) =>
                handleChange("issuingorganization", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              disabled={isLoading || uploading}
            />
          </div>

          <div>
            <div className="flex justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration<span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.hasexpirydate}
                  onChange={(e) => handleExpiryDateChange(e.target.checked)}
                  disabled={isLoading || uploading}
                />
                Has Expiry date
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.certificatestartdate}
                onChange={(e) =>
                  handleDateChange("certificatestartdate", e.target.value)
                }
                min={minDate}
                max={today}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
                disabled={isLoading || uploading}
              />
              <input
                type="date"
                value={formData.certificateenddate}
                onChange={(e) =>
                  handleDateChange("certificateenddate", e.target.value)
                }
                disabled={!formData.hasexpirydate || isLoading || uploading}
                min={formData.certificatestartdate || minDate}
                max={today}
                className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
                  !formData.hasexpirydate
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link this Certificate
            </label>
            <input
              type="url"
              placeholder="https://example.com/certificate"
              value={formData.certificatelink}
              onChange={(e) => handleChange("certificatelink", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              disabled={isLoading || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill
            </label>
            <input
              type="text"
              placeholder="Add skills (comma-separated)"
              value={formData.certificateskill}
              onChange={(e) => handleChange("certificateskill", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              disabled={isLoading || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Detail the expertise and insights you acquired, and explain how this certification enhanced your career growth and professional journey."
              value={formData.certificatedescription}
              onChange={(e) =>
                handleChange("certificatedescription", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              rows={5}
              disabled={isLoading || uploading}
            />
          </div>

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
            {formData.certificateattachment.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.certificateattachment.map((fileUrl, index) => (
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

          <div className="flex justify-between mt-4">
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

            <div
              className={`flex items-center gap-2 bg-sky-500 rounded-3xl px-4 py-2 transition ${
                isLoading || uploading
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:bg-sky-600"
              }`}
              onClick={() => {
                if (!isLoading && !uploading) {
                  handleSave();
                }
              }}
            >
              <IoCheckmark className="text-white" />
              <span className="text-white font-medium">
                {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatesForm;