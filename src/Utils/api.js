import axios from 'axios';

const API_URL = 'https://crmapi.conscor.com/api';
const DB_NAME = 'internph';
const API_KEY = 'LHCHoE0IlCOuESA4VQuJ';

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
    console.log('Login API response:', response.data);
    return response.data;
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