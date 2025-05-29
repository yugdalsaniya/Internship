import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/Navbar/logo.png';
import rightImage from '../assets/SignUp/wallpaper.jpg';
import facebook from '../assets/SignUp/facebook.png';
import linkedin from '../assets/SignUp/linkedin.png';
import { login } from '../Utils/api';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  // Role IDs to names mapping
  const roleNames = {
    '1747825619417': 'student',
    '1747723485001': 'company',
    '1747903042943': 'academy',
    '1747902920002': 'recruiter',
    '1747902955524': 'mentor',
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  if (!validateEmail(formData.email)) {
    setError('Please enter a valid email address.');
    setLoading(false);
    return;
  }

  try {
    const response = await login({
      appName: 'app8657281202648',
      username: formData.email.toLowerCase().trim(),
      password: formData.password,
    });

    if (response.success) {
      console.log('API Response User:', response.user);
      // Use roleId from response.user.role.role (normalized by api.js)
      const roleId = response.user.role?.role || '';
      const roleName = roleNames[roleId] || '';

        // Verify roleId with JWT as a fallback
        const decodedToken = jwtDecode(response.accessToken);
        if (decodedToken.roleId !== roleId) {
          console.warn('Role ID mismatch between API response and JWT:', { apiRoleId: roleId, jwtRoleId: decodedToken.roleId });
        }

        if (!roleName) {
          setError('Invalid or unrecognized role. Please contact support@conscor.com.');
          setLoading(false);
          return;
        }

        const userData = {
          userid:response.user._id,
          legalname: response.user.legalname || response.user.email,
          email: response.user.email,
          role: roleName, // e.g., 'student'
          roleId: roleId, // e.g., '1747825619417'
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        if (roleName === 'company') {
          navigate('/');
        } else {
          navigate('/');
        }
      } else {
        setError(response.message || 'Login failed');
      }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password';
    console.error('Login Error:', err.response?.data);
    if (errorMessage.includes('OTP not verified')) {
      setError('Please verify your email with OTP before logging in.');
    } else if (errorMessage.includes('Invalid credentials')) {
      setError('Incorrect email or password. Please try again.');
    } else if (err.response?.status === 401) {
      setError('Unauthorized access. Please check your credentials.');
    } else {
      setError(`${errorMessage}. Please try again or contact support@conscor.com.`);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-4">
        <div className="max-w-xs sm:max-w-sm mx-auto w-full">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-2">
              <img src={logo} alt="Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
                <p className="text-xs text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-xl font-bold mb-1 text-black">Sign in</h2>
            <p className="text-xs text-gray-500 mb-4">Please login to continue to your account.</p>
            {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-3 py-2 border rounded-md outline-none text-xs"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded-md pr-8 text-xs"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {showPassword ? (
                  <MdVisibility
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
                    onClick={togglePasswordVisibility}
                  />
                ) : (
                  <MdVisibilityOff
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
                    onClick={togglePasswordVisibility}
                  />
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Keep me logged in
                </label>
                <Link to="/forgotpassword" className="text-[#3D7EFF]">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            {user.role !== 'company' && (
              <>
                <div className="flex items-center my-4">
                  <hr className="flex-grow border-t" />
                  <span className="mx-2 text-xs text-gray-500">or</span>
                  <hr className="flex-grow border-t" />
                </div>
                <div className="flex justify-center gap-4 mb-4">
                  <button className="border p-1 rounded-md">
                    <img
                      src="https://img.icons8.com/color/48/google-logo.png"
                      alt="Google"
                      className="w-5 h-5"
                    />
                  </button>
                  <button className="border p-1 rounded-md">
                    <img src={facebook} alt="Facebook" className="w-5 h-5" />
                  </button>
                  <button className="border p-1 rounded-md">
                    <img src={linkedin} alt="LinkedIn" className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
            <p className="text-xs text-center">
              Need an account?{' '}
              <Link to="/signup" className="text-[#3D7EFF] font-semibold">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 p-4">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${rightImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default SignIn;