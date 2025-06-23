import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const roleNames = {
    '1747825619417': 'student',
    '1747723485001': 'company',
    '1747903042943': 'academy',
    '1747902920002': 'recruiter',
    '1747902955524': 'mentor',
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '' }));
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
    const newErrors = {};

    // Validate fields
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'Email must be 100 characters or less.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length > 20) { // Changed from 8 to 20
      newErrors.password = 'Password must be 20 characters or less.';
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        appName: 'app8657281202648',
        username: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (response.success) {
        console.log('API Response User:', response.user);

        const roleId = response.user.role?.role || '';
        const roleName = roleNames[roleId];

        if (!roleName) {
          setErrors({ general: 'Invalid or unrecognized role. Please contact support@conscor.com.' });
          return;
        }

        const decodedToken = jwtDecode(response.accessToken);
        if (decodedToken.roleId !== roleId) {
          console.warn('Role ID mismatch between API response and JWT:', {
            apiRoleId: roleId,
            jwtRoleId: decodedToken.roleId,
          });
          setErrors({ general: 'Role verification failed. Please contact support@conscor.com.' });
          return;
        }

        const userData = {
          legalname: response.user.legalname || response.user.email,
          email: response.user.email,
          role: roleName,
          roleId: roleId,
        };

        if (roleName === 'student') {
          userData.userid = response.user._id;
        } else if (roleName === 'company') {
          userData.companyId = response.user.companyId || '';
          userData.userid = response.user._id || '';
        }
        else if (roleName === 'academy') {
        userData.companyId = response.user.companyId || '';
          userData.userid = response.user._id || '';
        }

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        const from = location.state?.from || '/editprofile';
        navigate(from, { replace: true });
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password';
      console.error('Login Error:', err.response?.data);
      if (errorMessage.includes('OTP not verified')) {
        setErrors({ general: 'Please verify your email with OTP before logging in.' });
      } else if (errorMessage.includes('Invalid credentials')) {
        setErrors({
          email: 'Invalid email address. Please check and try again.',
          password: 'Incorrect password. Please try again.',
        });
      } else if (err.response?.status === 401) {
        setErrors({
          email: 'Unauthorized access. Please check your email.',
          password: 'Unauthorized access. Please check your password.',
        });
      } else {
        setErrors({ general: `${errorMessage}. Please try again or contact support@conscor.com.` });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
          <div className="mb-3 flex flex-col items-center">
             <div className="flex items-center mb-3">
                          <img
                            src={logo}
                            alt="Internship-OJT Logo"
                            className="h-10 w-auto mr-2"
                          />
                        </div>
          </div>
          <div className="w-full">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">Sign in</h2>
            <p className="text-xs xs:text-sm text-gray-500 mb-2">Please login to continue to your account.</p>
            {errors.general && <p className="text-red-500 text-xs xs:text-sm mb-2" aria-live="polite">{errors.general}</p>}
            <form className="space-y-2" onSubmit={handleSubmit} aria-busy={loading}>
              <div className="relative flex flex-col">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && (
                  <p id="error-email" className="text-red-500 text-xs xs:text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="relative flex flex-col">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                      errors.password ? 'border-red-500' : ''
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    maxLength={20} // Changed from 8 to 20
                    aria-describedby={errors.password ? 'error-password' : undefined}
                  />
                  {showPassword ? (
                    <MdVisibility
                      className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <MdVisibilityOff
                      className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </div>
                {errors.password && (
                  <p id="error-password" className="text-red-500 text-xs xs:text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs xs:text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-1 w-3.5 h-3.5 xs:w-4 xs:h-4" />
                  Keep me logged in
                </label>
                <Link to="/forgotpassword" className="text-[#3D7EFF] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                className={`w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors flex items-center justify-center ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    Signing in...
                  </>
                  
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
            {user.role !== 'company' && (
              <>
                <div className="flex items-center my-2">
                  <hr className="flex-grow border-t" />
                  <span className="mx-2 text-xs xs:text-sm text-gray-500">or</span>
                  <hr className="flex-grow border-t" />
                </div>
                {/* <div className="flex justify-center gap-3 xs:gap-4 mb-2">
                  <button className="border p-1.5 rounded-md hover:bg-gray-100">
                    <img
                      src="https://img.icons8.com/color/48/google-logo.png"
                      alt="Google"
                      className="w-4 h-4 xs:w-5 xs:h-5"
                    />
                  </button>
                  <button className="border p-1.5 rounded-md hover:bg-gray-100">
                    <img src={facebook} alt="Facebook" className="w-4 h-4 xs:w-5 xs:h-5" />
                  </button>
                  <button className="border p-1.5 rounded-md hover:bg-gray-100">
                    <img src={linkedin} alt="LinkedIn" className="w-4 h-4 xs:w-5 xs:h-5" />
                  </button>
                </div> */}
              </>
            )}
            <p className="text-sm xs:text-sm text-center">
              Need an account?{' '}
              <Link to="/signup" className="text-[#3D7EFF] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 p-2">
        <div
          className="w-full h-full bg-cover bg-center rounded-3xl"
          style={{ backgroundImage: `url(${rightImage})` }}
        ></div>
      </div>
    </div>
  );
};

export default SignIn;