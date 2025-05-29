import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://crmapi.conscor.com/api';
const DB_NAME = 'internph';
const API_KEY = 'LHCHoE0IlCOuESA4VQuJ';

// Role ID to name mapping (for normalizing login response)
const roleNames = {
  '1747825619417': 'student',
  '1747723485001': 'company',
  '1747903042943': 'academy',
  '1747902920002': 'recruiter',
  '1747902955524': 'mentor',
};

export const fetchSectionData = async (params) => {
  const {
    collectionName,
    query = {},
    projection = {},
    limit = 0,
    skip = 0,
    order = -1,
    sortedBy = 'createdAt',
    cacheBust,
  } = params;

  try {
    const url = cacheBust ? `${API_URL}/general/mfind?_=${cacheBust}` : `${API_URL}/general/mfind`;
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(
      url,
      {
        dbName: DB_NAME,
        collectionName,
        query,
        projection,
        limit,
        skip,
        order,
        sortedBy,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
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
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${API_URL}/general/adddata`,
      {
        dbName,
        collectionName,
        data,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      }
    );

    console.log('addGeneralData API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error while calling the adddata API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: 'Failed to add data' };
  }
};

export const uploadAndStoreFile = async ({ appName, moduleName, file, userId }) => {
  try {
    if (!file) {
      throw new Error('No file provided for upload.');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('user_id', userId);
    formData.append('folderName', moduleName);

    console.log('Uploading File:', file.name);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authorization token is missing. Please log in again.');
    }

    const response = await axios.post(
      `${API_URL}/v1/dynamic/uploadAndStore/upload/${appName}/${moduleName}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': API_KEY,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log('Upload Response (Raw):', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: error.message || 'Failed to upload file' };
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/signup/otp`,
      userData,
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Signup API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error during signup:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: userData,
    });
    throw error.response?.data || { message: 'Signup failed' };
  }
};

export const signupCompany = async (userData) => {
  try {
    const accessToken = localStorage.getItem(`${userData.appName}_accessToken`);
    const response = await axios.post(
      'https://crmapi.conscor.com/api/v1/auth/hana/signup',
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log('Company Signup API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error during company signup:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      requestData: userData,
    });
    if (error.response && error.response.status === 400) {
      throw error.response.data || { message: 'User with this email already exists.' };
    }
    throw error.response?.data || { message: 'Company signup failed' };
  }
};

export const verifyOtp = async (otpData) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/verify-otp`,
      otpData,
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Verify OTP API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: 'OTP verification failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${API_URL}/v1/auth/login`,
      {
        appName: 'app8657281202648',
        username: credentials.username.toLowerCase().trim(),
        password: credentials.password,
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    // Decode JWT to get roleId
    const decodedToken = jwtDecode(response.data.accessToken);
    const roleId = decodedToken.roleId || '';

    // Normalize user role
    let normalizedUser = { ...response.data.user };
    if (normalizedUser.role && normalizedUser.role.role === 'user' && roleId === '1747825619417') {
      normalizedUser.role.role = '1747825619417'; // Map 'user' to student role ID
    } else if (normalizedUser.role && roleNames[roleId]) {
      normalizedUser.role.role = roleId; // Ensure role is the ID
    }

    const normalizedResponse = {
      ...response.data,
      user: normalizedUser,
    };

    console.log('Login API response:', normalizedResponse);
    return normalizedResponse;
  } catch (error) {
    console.error('Error during login:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: 'Invalid email or password' };
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
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      return response.data.message;
    }
  } catch (error) {
    console.error('Error during forgot password:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: 'Failed to initiate password reset.' };
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
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      return response.data.message;
    }
  } catch (error) {
    console.error('Error during reset password:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error.response?.data || { message: 'Failed to reset password.' };
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
    console.log(
      'mUpdate request:',
      'appName:', appName,
      'collectionName:', collectionName,
      'query:', query,
      'update:', update
    );
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
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      }
    );
    console.log('mUpdate response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in mUpdate:', error.response?.data || error.message);
    throw error;
  }
};
window.mUpdate = mUpdate;