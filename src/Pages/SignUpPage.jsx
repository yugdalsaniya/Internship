import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import rightImage from '../assets/SignUp/wallpaper.jpg';
import logo from '../assets/Navbar/logo.png';
import student from '../assets/SignUp/student.png';
import linkedin from '../assets/SignUp/linkedin.png';
import facebook from '../assets/SignUp/facebook.png';
import company from '../assets/SignUp/company.png';
import { signup } from '../Utils/api';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: null,
    email: '',
    password: '',
    mobile: '',
    role: '', // Role is no longer hardcoded
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Role options for selection
  const roleOptions = [
    { id: '1747825619417', label: 'Student' },
    { id: 'companyRoleId', label: 'Company' }, // Replace with actual ID
    { id: 'academyRoleId', label: 'Academy' }, // Replace with actual ID
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dob: date });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formattedDob = formData.dob
        ? formData.dob.toISOString().split('T')[0]
        : '';
      const payload = {
        appName: 'app8657281202648',
        type: 'otp',
        legalname: formData.name.trim(),
        username: formData.email.toLowerCase().trim(),
        password: formData.password,
        mobile: formData.mobile.trim() || '',
        role: "1747825619417",
        dob: formattedDob,
      };
      console.log('Sending signup payload:', payload);
      const response = await signup(payload);
      console.log('Signup response:', response);
      if (response.success) {
        localStorage.setItem('pendingUser', JSON.stringify({
          legalname: formData.name,
          email: formData.email.toLowerCase().trim(),
          role: formData.role,
        }));
        navigate('/otp');
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
      });
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during signup';
      if (errorMessage.includes('User with this username already exists')) {
        setError('This email is already registered. Please use a different email or sign in.');
      } else {
        setError(`${errorMessage}. Please try again or contact support@conscor.com.`);
      }
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-4">
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

        <div className="flex gap-10 mb-10">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src={student} alt="Student" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Student</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src={company} alt="Company" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Company</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-xl border shadow-sm">
              <img src="https://img.icons8.com/color/48/google-logo.png" alt="Academy" className="w-10 h-10" />
            </div>
            <span className="text-sm mt-2 font-medium">Academy</span>
          </div>
        </div>

        <div className="w-full max-w-xs sm:max-w-sm">
          <h2 className="text-2xl font-bold mb-1 text-black">Sign up</h2>
          <p className="text-sm text-gray-500 mb-6">Sign up to enjoy the feature of Revolutie</p>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div className="relative">
              <DatePicker
                selected={formData.dob}
                onChange={handleDateChange}
                placeholderText="Date of Birth"
                className="w-full px-4 py-2 border rounded-md outline-none text-sm"
                dateFormat="yyyy-MM-dd"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                maxDate={new Date()}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              className="w-full px-4 py-2 border rounded-md outline-none text-sm"
              value={formData.mobile}
              onChange={handleChange}
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
            <button
              type="submit"
              className="w-full bg-[#3D7EFF] text-white py-2 rounded-md font-semibold text-xs"
            >
              Sign up
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t" />
            <span className="mx-3 text-sm text-gray-500">or</span>
            <hr className="flex-grow border-t" />
          </div>

          <div className="flex justify-center gap-6 mb-6">
            <button className="border p-2 rounded-md">
              <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
              <img src={facebook} alt="Facebook" className="w-6 h-6" />
            </button>
            <button className="border p-2 rounded-md">
              <img src={linkedin} alt="LinkedIn" className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3D7EFF] font-semibold">Sign in</Link>
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

export default SignUpPage;