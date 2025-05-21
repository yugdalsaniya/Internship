import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login({
        username: formData.email.toLowerCase().trim(),
        password: formData.password,
      });
      console.log('Login response:', response);
      if (response.success) {
        console.log('Storing user data:', {
          legalname: response.user.legalname || response.user.email,
          email: response.user.email,
          role: response.user.role?.role || '',
        });
        localStorage.setItem('user', JSON.stringify({
          legalname: response.user.legalname || response.user.email,
          email: response.user.email,
          role: response.user.role?.role || '',
        }));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        navigate('/');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      const errorMessage = err.response?.data?.message || err.message || 'Invalid email or password';
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
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-4">
        <div className="flex flex-col items-center w-full max-w-xs sm:max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
                <p className="text-[11px] sm:text-xs text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-1 text-black">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Please login to continue to your account.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md pr-10 text-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {showPassword ? (
                <MdVisibility
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <MdVisibilityOff
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm flex items-center">
                <input type="checkbox" className="mr-2" />
                Keep me logged in
              </label>
              <Link to="/forgot-password" className="text-sm text-[#3D7EFF]">
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

          <div className="flex items-center my-6 w-full">
            <hr className="flex-grow border-t" />
            <span className="mx-3 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t" />
          </div>

          <div className="flex justify-center gap-6 mb-6 w-full">
            <button className="border p-2 rounded-md">
              <img
                src="https://img.icons8.com/color/48/google-logo.png"
                alt="Google"
                className="w-6 h-6"
              />
            </button>
            <button className="border p-2 rounded-md">
              <img src={facebook} alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
              <img src={linkedin} alt="LinkedIn" className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-center">
            Need an account?{' '}
            <Link to="/signup" className="text-[#3D7EFF] font-semibold">
              Create one
            </Link>
          </p>
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