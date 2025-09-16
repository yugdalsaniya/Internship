import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/Navbar/logo.png';
import wallpaper1 from '../assets/SignUp/wallpaper1.png';
import wallpaper2 from '../assets/SignUp/wallpaper2.png';
import wallpaper3 from '../assets/SignUp/wallpaper3.jpg';
import wallpaper4 from '../assets/SignUp/wallpaper4.png';
import wallpaper5 from '../assets/SignUp/wallpaper5.png';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [wallpaper1, wallpaper2, wallpaper3, wallpaper4, wallpaper5];

  const roleDescriptions = {
    student: [
      "Find internships, OJTs, and entry-level jobs",
      "Apply directly with a smart Inturnshp profile",
      "Learn with free workshops and short courses",
      "Get career-ready through real-world experiences",
    ],
    company: [
      "Post internships and job openings",
      "Search from a pool of pre-screened candidates",
      "Build your employer brand on campus",
      "Manage hiring with simple, effective tools",
    ],
    academy: [
      "Track internship activity & student growth",
      "Connect with verified industry partners",
      "Monitor performance and placement metrics",
      "Enable smooth campus-to-industry transition",
    ],
    mentor: [
      "Offer 1-on-1 mentorship or group sessions",
      "Share insights via talks, webinars, or Q&As",
      "Help students build their career roadmap",
      "Boost your professional visibility and impact",
    ],
    recruiter: [
      "Post internships and job openings",
      "Search from a pool of pre-screened candidates",
      "Build your employer brand on campus",
      "Manage hiring with simple, effective tools",
    ],
  };

  const roleOrder = ['student', 'company', 'academy', 'mentor', 'recruiter'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (formData.email.trim().length > 100) {
      newErrors.email = 'Email must be 100 characters or less.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length > 20) {
      newErrors.password = 'Password must be 20 characters or less.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const response = await login({
        appName: 'app8657281202648',
        username: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (response.success) {
        const roleId = response.user.role?.role || '';
        const roleName = roleNames[roleId];

        if (!roleName) {
          setErrors({ general: 'Invalid or unrecognized role. Please contact support@conscor.com.' });
          setLoading(false);
          return;
        }

        const decodedToken = jwtDecode(response.accessToken);
        if (decodedToken.roleId !== roleId) {
          console.warn('Role ID mismatch between API response and JWT:', {
            apiRoleId: roleId,
            jwtRoleId: decodedToken.roleId,
          });
          setErrors({ general: 'Role verification failed. Please contact support@conscor.com.' });
          setLoading(false);
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
        } else if (roleName === 'company' || roleName === 'academy') {
          userData.companyId = response.user.companyId || '';
          userData.userid = response.user._id || '';
        }else(roleName === 'mentor')
        {userData.userid = response.user._id;}

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        const isBasicDetailsFilled = response.user.legalname && response.user.legalname !== response.user.email;
        const redirectTo = isBasicDetailsFilled ? '/' : '/editprofile';
        const from = location.state?.from || redirectTo;

        navigate(from, { replace: true });
      } else {
        setErrors({ general: response.message || 'Login failed. Please check your credentials.' });
        setLoading(false);
      }
    } catch (err) {
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setErrors({ 
        general: errorMessage,
        email: ' ',
        password: ' '
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
          <div className="mb-3 flex flex-col items-center">
            <div className="flex items-center mb-3">
              <img src={logo} alt="Internship-OJT Logo" className="h-20 w-auto mr-2" />
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">Sign in</h2>
            <p className="text-xs xs:text-sm text-gray-500 mb-2">Please login to continue to your account.</p>
            {errors.general && (
              <p className="text-red-500 text-xs xs:text-sm mb-2" aria-live="polite">
                {errors.general}
              </p>
            )}
            <form className="space-y-2" onSubmit={handleSubmit} aria-busy={loading}>
              <div className="relative flex flex-col">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                />
                {errors.email && errors.email.trim() !== ' ' && (
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
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    maxLength={20}
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
                {errors.password && errors.password.trim() !== ' ' && (
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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            {user.role !== 'company' && (
              <>
                <div className="flex items-center my-2">
                  <hr className="flex-grow border-t" />
                  <span className="mx-2 text-xs xs:text-sm text-gray-500">or</span>
                  <hr className="flex-grow border-t" />
                </div>
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
      <div className="hidden lg:flex w-1/2 p-2 relative">
        <div className="w-full h-full overflow-hidden rounded-3xl">
          <div
            className="flex h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="min-w-full h-full bg-cover bg-center opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, #F9DCDF, #B5D9D3), url(${image})`,
                  backgroundBlendMode: 'multiply',
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center'
                }}
              ></div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-between p-20">
          <ul className="text-[#050748] text-lg font-semibold list-disc pl-6">
            {roleDescriptions[roleOrder[currentImageIndex]].map((description, index) => (
              <li key={index} className="mb-2">
                {description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignIn;