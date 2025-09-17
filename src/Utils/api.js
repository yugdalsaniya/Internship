import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://crmapi.conscor.com/api";
const DB_NAME = "internph";
const API_KEY = "LHCHoE0IlCOuESA4VQuJ";

// Role ID to name mapping
const roleNames = {
  1747825619417: "student",
  1747723485001: "company",
  1747903042943: "academy",
  1747902920002: "recruiter",
  1747902955524: "mentor",
};

export const fetchSectionData = async (params) => {
  const {
    collectionName,
    query = {},
    lookups = [],
    projection = {},
    limit = 0,
    skip = 0,
    order = -1,
    sortedBy = "createdAt",
    cacheBust,
  } = params;

  try {
    const url = cacheBust
      ? `${API_URL}/general/mfind?_=${cacheBust}`
      : `${API_URL}/general/mfind`;
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.post(
      url,
      {
        dbName: DB_NAME,
        collectionName,
        query,
        lookups,
        projection,
        limit,
        skip,
        order,
        sortedBy,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      }
    );

    const raw = response.data?.data || [];
    return raw;
  } catch (error) {
    console.error(`Error fetching data for collection '${collectionName}':`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    return [];
  }
};

export const addGeneralData = async ({ dbName, collectionName, data }) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.post(
      `${API_URL}/general/adddata`,
      {
        dbName,
        collectionName,
        data,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error while calling the adddata API:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Failed to add data" };
  }
};

export const uploadAndStoreFile = async ({
  appName,
  moduleName,
  file,
  userId,
}) => {
  try {
    if (!file) {
      throw new Error("No file provided for upload.");
    }

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("user_id", userId);
    formData.append("folderName", moduleName);


    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await axios.post(
      `${API_URL}/v1/dynamic/uploadAndStore/upload/${appName}/${moduleName}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading file:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw (
      error.response?.data || {
        message: error.message || "Failed to upload file",
      }
    );
  }
};

export const sendEmailTemplate = async (formData, toast) => {
  try {
    const url = `${API_URL}/v1/dynamic/email/send-email`;
    const payload = {
      appName: "app8657281202648",
      username: formData.email,
      smtpId: formData.smtpId || "1750933648545",
      templateId: formData.templateId,
      data: formData.data || {},
      category: formData.category || "primary",
    };

    if (formData.subject) {
      payload.subject = formData.subject;
    }

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };


    const response = await axios.post(url, payload, { headers });

    if (response.data.success) {
      toast.success("Email sent successfully");
    } else {
      console.warn("Email sent but success flag is false:", response.data);
      toast.warn("Email sent but may not have processed correctly.");
    }
    return response.data;
  } catch (error) {
    console.error("Error sending email:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: formData,
    });
    toast.error(`Error sending email: ${error.response?.data?.message || error.message || "Unknown error"}`);
    throw error.response?.data || { message: "Failed to send email" };
  }
};

export const sendRawEmail = async (formData, toast) => {
  try {
    const url = `${API_URL}/v1/dynamic/email/sendmail`;
    const payload = {
      appName: formData.appName || "app8657281202648",
      smtpId: formData.smtpId || "1750933648545",
      to: formData.to,
      subject: formData.subject,
      html: formData.html,
    };

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    };


    const response = await axios.post(url, payload, { headers });

    if (response.data.success) {
      toast.success("Raw email sent successfully");
    } else {
      console.warn("Raw email sent but success flag is false:", response.data);
      toast.warn("Raw email sent but may not have processed correctly.");
    }
    return response.data;
  } catch (error) {
    console.error("Error sending raw email:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: formData,
    });
    toast.error(`Error sending raw email: ${error.response?.data?.message || error.message || "Unknown error"}`);
    throw error.response?.data || { message: "Failed to send raw email" };
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/signup/otp`,
      userData,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during signup:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: userData,
    });
    throw error.response?.data || { message: "Signup failed" };
  }
};

export const signupCompany = async (userData) => {
  try {
    const accessToken = localStorage.getItem(`${userData.appName}_accessToken`);
    const response = await axios.post(
      `${API_URL}/v1/auth/hana/signup`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during company signup:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: userData,
    });
    if (error.response && error.response.status === 400) {
      throw (
        error.response.data || {
          message: "User with this email already exists.",
        }
      );
    }
    throw error.response?.data || { message: "Company signup failed" };
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/verify-otp`,
      otpData,
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "OTP verification failed" };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/login`,
      {
        appName: "app8657281202648",
        username: credentials.username.toLowerCase().trim(),
        password: credentials.password,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const decodedToken = jwtDecode(response.data.accessToken);
    const roleId = decodedToken.roleId || "";

    let normalizedUser = { ...response.data.user };
    if (
      normalizedUser.role &&
      normalizedUser.role.role === "user" &&
      roleId === "1747825619417"
    ) {
      normalizedUser.role.role = "1747825619417";
    } else if (normalizedUser.role && roleNames[roleId]) {
      normalizedUser.role.role = roleId;
    }

    const normalizedResponse = {
      ...response.data,
      user: normalizedUser,
    };

    return normalizedResponse;
  } catch (error) {
    console.error("Error during login:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Invalid email or password" };
  }
};

export const forgotPassword = async (username, appName) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/forgot-password`,
      {
        appName,
        username,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data.message;
    }
  } catch (error) {
    console.error("Error during forgot password:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw (
      error.response?.data || { message: "Failed to initiate password reset." }
    );
  }
};

export const resetPassword = async (token, newPassword, appName) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/reset-password`,
      {
        appName,
        token,
        newPassword,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data.message;
    }
  } catch (error) {
    console.error("Error during reset password:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Failed to reset password." };
  }
};

export const mUpdate = async ({
  appName,
  collectionName,
  query,
  update,
  options,
}) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }
    
    const response = await axios.post(
      `${API_URL}/v1/dynamic/mupdate`,
      {
        appName,
        collectionName,
        query,
        update,
        options,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
   
    return response.data;
  } catch (error) {
    console.error("Error in mUpdate:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Failed to update data" };
  }
};

export const updateSectionData = async ({ dbName, collectionName, id, updateData }) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("Authorization token is missing. Please log in again.");
    }

    const response = await mUpdate({
      appName: "app8657281202648",
      collectionName,
      query: { _id: id },
      update: { $set: updateData },
      options: { upsert: false },
    });

  

    return response;
  } catch (error) {
    console.error("Error in updateSectionData:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Failed to update internship status" };
  }
};

const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const sendOtp = async (email) => {
  try {
    const otpValue = generateOtp();
    localStorage.setItem("generatedOtp", otpValue);

    const response = await axios.post(
      `${API_URL}/v1/dynamic/email/send-otp`,
      {
        otp: otpValue,
        email,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, message: "OTP sent to your email.", otp: otpValue };
  } catch (error) {
    console.error("Error sending OTP:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: "Failed to send OTP" };
  }
};