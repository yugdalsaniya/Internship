import { useState, useEffect } from "react";
import { BiTime } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { IoCheckmark } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";
import Select from "react-select";
import { fetchSectionData, mUpdate } from "../../Utils/api";
import { toast } from "react-toastify";

const CompanyDetails = ({ userData, updateCompletionStatus, onBack }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cdesignation: "",
    mobile: "",
    organisationcollege: "",
    post: "",
  });
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [postOptions, setPostOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userRoleId, setUserRoleId] = useState(null);

  // Custom styles for react-select to match BasicDetails
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      border: "1px solid #d1d5db",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      minHeight: "2.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
      "&:focus-within": {
        borderColor: "#3b82f6",
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#dbeafe"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: state.isSelected ? "#1e40af" : "#374151",
      "&:hover": {
        backgroundColor: "#f3f4f6",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  // Fetch user data, institute options, and post options when component mounts
  useEffect(() => {
    const fetchUserDataAndOptions = async () => {
      try {
        if (typeof window === "undefined") return;

        const userString = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");

        if (!userString || !accessToken) {
          setError("Please log in to view your details.");
          toast.error("Please log in to view your details.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(null), 5000);
          return;
        }

        let userId, roleId;
        try {
          const user = JSON.parse(userString);
          userId = user.userid;
          roleId = user.roleId; // Assuming roleId is stored in user object
          setUserRoleId(roleId);
        } catch (parseError) {
          setError("Invalid user data. Please log in again.");
          toast.error("Invalid user data. Please log in again.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(null), 5000);
          return;
        }

        // Fetch user data
        const response = await fetchSectionData({
          dbName: "internph",
          collectionName: "appuser",
          query: { _id: userId },
          projection: { "sectionData.appuser": 1, _id: 0 },
        });

        if (!response || (Array.isArray(response) && response.length === 0)) {
          setError("User data not found. Please contact support.");
          toast.error("User data not found. Please contact support.", {
            position: "top-right",
            autoClose: 5000,
          });
          setTimeout(() => setError(null), 5000);
          return;
        }

        const appuser = Array.isArray(response)
          ? response[0]?.sectionData?.appuser || {}
          : response.sectionData?.appuser || {};

        const newData = {
          name: appuser.legalname || "",
          email: appuser.email || "",
          cdesignation: appuser.cdesignation || "",
          mobile: appuser.mobile ? appuser.mobile.replace("+63", "") : "",
          organisationcollege: appuser.organisationcollege || "",
          post: appuser.post || "",
        };

        setFormData(newData);
        const isFormComplete =
          !!newData.name &&
          !!newData.email &&
          !!newData.mobile &&
          (roleId !== "1747903042943" ||
            (!!newData.organisationcollege && !!newData.post));
        setIsCompleted(isFormComplete);
        if (updateCompletionStatus) {
          updateCompletionStatus("Company Details", isFormComplete);
        }

        // Fetch institute options
        setIsLoadingOptions(true);
        const instituteData = await fetchSectionData({
          dbName: "internph",
          collectionName: "institute",
          query: {},
        });

        if (!Array.isArray(instituteData)) {
          throw new Error("Institute data is not an array");
        }

        const institutes = instituteData
          .map((item) => {
            if (!item.sectionData?.institute?.institutionname) {
              console.warn("Missing institutionname in item:", item);
              return null;
            }
            return {
              _id: item._id,
              name: item.sectionData.institute.institutionname,
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setInstituteOptions(institutes);

        // Fetch post options
        const postData = await fetchSectionData({
          dbName: "internph",
          collectionName: "post",
          query: {},
        });

        if (!Array.isArray(postData)) {
          throw new Error("Post data is not an array");
        }

        const posts = postData
          .map((item) => {
            if (!item.sectionData?.post?.name) {
              console.warn("Missing post name in item:", item);
              return null;
            }
            return {
              _id: item._id,
              name: item.sectionData.post.name.trim(),
            };
          })
          .filter((item) => item !== null)
          .sort((a, b) => a.name.localeCompare(b.name));

        setPostOptions(posts);
      } catch (err) {
        setError(err.message || "Failed to load user data or options.");
        toast.error(err.message || "Failed to load user data or options.", {
          position: "top-right",
          autoClose: 5000,
        });
        console.error("Error fetching data:", err);
        setTimeout(() => setError(null), 5000);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchUserDataAndOptions();
  }, [updateCompletionStatus]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle institute selection
  const handleInstituteChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      organisationcollege: selected ? selected.value : "",
    }));
  };

  // Handle post selection
  const handlePostChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      post: selected ? selected.value : "",
    }));
  };

  // Validate form before saving
  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.mobile) {
      return "Please fill all required fields.";
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      return "Mobile number must be 10 digits.";
    }
    if (
      userRoleId === "1747903042943" &&
      (!formData.organisationcollege || !formData.post)
    ) {
      return "Please select a valid institute and post.";
    }
    return "";
  };

  // Handle form submission to update data
  const handleSave = async () => {
    if (isProcessing) return;

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, {
        position: "top-right",
        autoClose: 5000,
      });
      setTimeout(() => setError(null), 5000);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (typeof window === "undefined")
        throw new Error("Browser environment required");

      const userString = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");

      if (!userString || !accessToken) {
        throw new Error("Please log in to save your details.");
      }

      let userId;
      try {
        const user = JSON.parse(userString);
        userId = user.userid;
      } catch (parseError) {
        throw new Error("Invalid user data. Please log in again.");
      }

      const existingUser = await fetchSectionData({
        dbName: "internph",
        collectionName: "appuser",
        query: { _id: userId },
      });

      if (
        !existingUser ||
        (Array.isArray(existingUser) && existingUser.length === 0)
      ) {
        setError(
          "User not found in database. Please sign up or contact support."
        );
        toast.error(
          "User not found in database. Please sign up or contact support.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );
        setTimeout(() => {
          setError(null);
          onBack?.();
        }, 2000);
        return;
      }

      const updateData = {
        $set: {
          "sectionData.appuser.legalname": formData.name.trim(),
          "sectionData.appuser.email": formData.email,
          "sectionData.appuser.cdesignation": formData.cdesignation,
          "sectionData.appuser.mobile": `+63${formData.mobile}`,
          "sectionData.appuser.organisationcollege":
            userRoleId === "1747903042943" ? formData.organisationcollege : "",
          "sectionData.appuser.post":
            userRoleId === "1747903042943" ? formData.post : "",
          "sectionData.appuser.lastUpdated": new Date().toISOString(),
        },
      };

      const response = await mUpdate({
        appName: "app8657281202648",
        collectionName: "appuser",
        query: { _id: userId },
        update: updateData,
        options: { upsert: false, writeConcern: { w: "majority" } },
      });

      if (
        response &&
        (response.success ||
          response.modifiedCount > 0 ||
          response.matchedCount > 0)
      ) {
        if (response.matchedCount === 0) {
          throw new Error("Failed to update profile: User not found.");
        }
        if (response.upsertedId) {
          throw new Error(
            "Unexpected error: New user created instead of updating. Please contact support."
          );
        }
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus("Company Details", true);
        }
      } else {
        throw new Error("Failed to update profile in database.");
      }
    } catch (err) {
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = "API endpoint not found. Please contact support.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        setTimeout(() => onBack?.(), 2000);
      }
      setError(errorMessage || "Failed to update profile. Please try again.");
      toast.error(
        errorMessage || "Failed to update profile. Please try again.",
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      console.error("Error updating profile:", err);
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-600 text-xl" />
          )}
          Company Details
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Legal Name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-10 bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </label>
          <input
            type="text"
            name="cdesignation"
            value={formData.cdesignation}
            onChange={handleInputChange}
            placeholder="Designation"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg p-2 bg-white w-20 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value="+63"
              disabled
            >
              <option value="+63">+63</option>
            </select>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setFormData((prev) => ({ ...prev, mobile: value }));
                }
              }}
              placeholder="Mobile Number"
              className="flex-1 border border-gray-300 rounded-lg p-2 h-10 min-w-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isProcessing}
            />
          </div>
        </div>

        {userRoleId === "1747903042943" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institute Name <span className="text-red-500">*</span>
              </label>
              <Select
                options={instituteOptions.map((option) => ({
                  value: option._id,
                  label: option.name,
                }))}
                value={instituteOptions
                  .filter((option) => option._id === formData.organisationcollege)
                  .map((option) => ({ value: option._id, label: option.name }))}
                onChange={handleInstituteChange}
                styles={customSelectStyles}
                isDisabled={isProcessing }
                placeholder="Search for your organisation/college..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
              />
             
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post <span className="text-red-500">*</span>
              </label>
              <Select
                options={postOptions.map((option) => ({
                  value: option._id,
                  label: option.name,
                }))}
                value={postOptions
                  .filter((option) => option._id === formData.post)
                  .map((option) => ({ value: option._id, label: option.name }))}
                onChange={handlePostChange}
                styles={customSelectStyles}
                isDisabled={isProcessing || isLoadingOptions}
                placeholder="Search for your post..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
              />
             
            </div>
          </>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-between">
          <button
            className="flex items-center gap-2 border border-gray-300 rounded-3xl px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50"
            onClick={onBack}
            disabled={isProcessing}
            aria-label="Discard Changes"
          >
            <RxCross2 className="text-gray-600" />
            Discard
          </button>

          <button
            className="flex items-center gap-2 bg-blue-600 text-white rounded-3xl px-4 py-2 hover:bg-blue-700 transition disabled:opacity-50"
            onClick={handleSave}
            disabled={isProcessing}
            aria-label="Save Company Details"
          >
            <IoCheckmark />
            {isProcessing ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetails;