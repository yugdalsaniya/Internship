import React, { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { FaPlus, FaEye, FaRegLightbulb } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { fetchSectionData, mUpdate } from "../../../Utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CertificatesForm = ({ onBack }) => {
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

  const [certificates, setCertificates] = useState([]);
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
          setError("Please log in to view your certificates.");
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

        if (data.length > 0 && data[0].sectionData?.appuser?.certificatesdetails) {
          setCertificates(data[0].sectionData.appuser.certificatesdetails);
        }
      } catch (error) {
        console.error("Error fetching certificates data:", error);
        setError("Failed to load certificates data. Please try again.");
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

  const handleExpiryDateChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      hasexpirydate: checked,
      certificateenddate: checked ? prev.certificateenddate : "",
    }));
  };

  const validateForm = () => {
    if (!formData.titleofcertificates.trim()) {
      setError("Certificate title is required.");
      return false;
    }
    if (!formData.issuingorganization.trim()) {
      setError("Issuing organization is required.");
      return false;
    }
    if (!formData.certificatestartdate) {
      setError("Start date is required.");
      return false;
    }
    if (formData.hasexpirydate && !formData.certificateenddate) {
      setError("End date is required when expiry date is selected.");
      return false;
    }
    if (
      formData.hasexpirydate &&
      formData.certificateenddate &&
      new Date(formData.certificateenddate) <=
        new Date(formData.certificatestartdate)
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
        setError("Please log in to save certificates.");
        return;
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
        certificateattachment: formData.certificateattachment || [],
        createdAt: isEditing
          ? certificates[editingIndex].createdAt
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      let updatedCertificates;
      if (isEditing) {
        updatedCertificates = [...certificates];
        updatedCertificates[editingIndex] = certificateData;
      } else {
        updatedCertificates = [...certificates, certificateData];
      }

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.certificatesdetails": updatedCertificates, // Corrected field name here
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setCertificates(updatedCertificates);
      resetForm();

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
    } catch (error) {
      console.error("Error saving certificate:", error);
      setError(
        error.message || "Failed to save certificate. Please try again."
      );
      toast.error("Failed to save certificate. Please try again.", {
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
    const cert = certificates[index];
    setFormData({
      titleofcertificates: cert.titleofcertificates || "",
      issuingorganization: cert.issuingorganization || "",
      certificatestartdate: cert.certificatestartdate || "",
      certificateenddate: cert.certificateenddate || "",
      hasexpirydate: cert.hasexpirydate || false,
      certificatelink: cert.certificatelink || "",
      certificateskill: cert.certificateskill
        ? cert.certificateskill.join(", ")
        : "",
      certificatedescription: cert.certificatedescription || "",
      certificateattachment: cert.certificateattachment || [],
    });
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      setIsLoading(true);
      const updatedCertificates = certificates.filter((_, i) => i !== index);

      await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: {
          $set: {
            "sectionData.appuser.certificatesdetails": updatedCertificates, // Corrected field name here
            editedAt: new Date().toISOString(),
          },
        },
        options: { upsert: false },
      });

      setCertificates(updatedCertificates);
      toast.success("Certificate deleted successfully!");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate. Please try again.");
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
    setIsEditing(false);
    setEditingIndex(-1);
    setError("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
          <span>Certificates</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        {/* Existing Certificates */}
        {certificates.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Your Certificates
            </h3>
            {certificates.map((cert, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {cert.titleofcertificates}
                    </h4>
                    <p className="text-gray-600">{cert.issuingorganization}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(cert.certificatestartdate)}
                      {cert.hasexpirydate &&
                        cert.certificateenddate &&
                        ` - ${formatDate(cert.certificateenddate)}`}
                      {!cert.hasexpirydate && " - No Expiry"}
                    </p>
                    {cert.certificateskill &&
                      cert.certificateskill.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cert.certificateskill.map((skill, i) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    {cert.certificatedescription && (
                      <p className="text-sm text-gray-600 mt-2">
                        {cert.certificatedescription}
                      </p>
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

        {/* Add/Edit Certificate Form */}
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Certificate" : "Add New Certificate"}
          </h3>

          {/* Title */}
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
            />
          </div>

          {/* Issuing Organization */}
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
                  checked={formData.hasexpirydate}
                  onChange={(e) => handleExpiryDateChange(e.target.checked)}
                />
                Has Expiry date
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={formData.certificatestartdate}
                onChange={(e) =>
                  handleChange("certificatestartdate", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2"
              />
              <input
                type="date"
                value={formData.certificateenddate}
                onChange={(e) =>
                  handleChange("certificateenddate", e.target.value)
                }
                disabled={!formData.hasexpirydate}
                className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 w-1/2 ${
                  !formData.hasexpirydate
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>
          </div>

          {/* Link Certificate */}
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
            />
          </div>

          {/* Skills */}
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
            />
          </div>

          {/* Description */}
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

export default CertificatesForm;