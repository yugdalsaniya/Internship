import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import rightImage from '../assets/SignUp/wallpaper.jpg';
import logo from '../assets/Navbar/logo.png';
import student from '../assets/SignUp/student.png';
import linkedin from '../assets/SignUp/linkedin.png';
import facebook from '../assets/SignUp/facebook.png';
import company from '../assets/SignUp/company.png';
import academy from '../assets/SignUp/academy.png';
import recruiter from '../assets/SignUp/recruiter.png';
import mentor from '../assets/SignUp/mentor.png';
import { signup, signupCompany } from '../Utils/api';

const SignUpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    academyName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Role IDs
  const roleIds = {
    student: '1747825619417',
    company: '1747723485001',
    academy: '1747903042943',
    recruiter: '1747902920002',
    mentor: '1747902955524',
  };

  // Handle role based on URL
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const validRoles = ['student', 'company', 'academy', 'recruiter', 'mentor'];
    if (validRoles.includes(path)) {
      setRole(path);
    } else if (location.pathname === '/signup') {
      setRole(null);
    } else {
      navigate('/signup', { replace: true });
    }
  }, [location.pathname, navigate]);

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

  const validatePassword = (password) => {
    const passwordRegex = /^.{6,}$/;
    return passwordRegex.test(password);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^\d*$/;
    return mobileRegex.test(mobile);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    navigate(`/signup/${newRole}`);
    setFormData({
      firstName: '',
      lastName: '',
      companyName: '',
      academyName: '',
      mobile: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First Name and Last Name are required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!validateMobile(formData.mobile)) {
      setError('Mobile number must contain only digits or be empty.');
      return;
    }
    if (role === 'company' && !formData.companyName.trim()) {
      setError('Company Name is required.');
      return;
    }
    if (role === 'academy' && !formData.academyName.trim()) {
      setError('Academy Name is required.');
      return;
    }

    try {
      let payload;
      let response;

      if (role === 'company') {
        payload = {
          appName: 'app8657281202648',
          companyName: formData.companyName.trim(),
          mobile: formData.mobile.trim() || '',
          legalname: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          role: roleIds[role],
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        };
        console.log('Company Signup Payload:', payload);
        response = await signupCompany(payload);
      } else {
        payload = {
          appName: 'app8657281202648',
          type: 'otp',
          name: formData.email.toLowerCase().trim(),
          username: formData.email.toLowerCase().trim(),
          password: formData.password,
          role: roleIds[role],
          legalname: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
          email: formData.email.toLowerCase().trim(),
          mobile: formData.mobile.trim() || '',
          ...(role === 'academy' && { academyname: formData.academyName.trim() }),
        };
        console.log('Signup Payload:', payload);
        response = await signup(payload);
      }

      if (response.success) {
        if (role === 'company') {
          setFormData({
            firstName: '',
            lastName: '',
            companyName: '',
            academyName: '',
            mobile: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          localStorage.setItem('user', JSON.stringify({
            legalname: `${formData.firstName} ${formData.lastName}`.trim(),
            role: roleIds[role],
            email: formData.email.toLowerCase().trim(),
          }));
          navigate('/');
        } else {
          localStorage.setItem('pendingUser', JSON.stringify({
            legalname: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email.toLowerCase().trim(),
            role,
            ...(role === 'academy' && { academyname: formData.academyName.trim() }),
          }));
          navigate('/otp');
        }
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred during signup';
      console.error('Signup Error Response:', err.response?.data);
      if (errorMessage.includes('User with this username already exists') || errorMessage.includes('User with this email already exists')) {
        setError('This email is already registered. Please use a different email or sign in.');
      } else {
        setError(`${errorMessage}. Please try again or contact support@conscor.com.`);
      }
    }
  };

  const formFields = {
    student: [
      { name: 'firstName', placeholder: 'First Name', type: 'text', required: true },
      { name: 'lastName', placeholder: 'Last Name', type: 'text', required: true },
      { name: 'mobile', placeholder: 'Mobile (e.g., 9979737457)', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    company: [
      { name: 'firstName', placeholder: 'First Name', type: 'text', required: true },
      { name: 'lastName', placeholder: 'Last Name', type: 'text', required: true },
      { name: 'companyName', placeholder: 'Company Name', type: 'text', required: true },
      { name: 'mobile', placeholder: 'Mobile (e.g., 9979737457)', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    academy: [
      { name: 'firstName', placeholder: 'First Name', type: 'text', required: true },
      { name: 'lastName', placeholder: 'Last Name', type: 'text', required: true },
      { name: 'academyName', placeholder: 'Academy Name', type: 'text', required: true },
      { name: 'mobile', placeholder: 'Mobile (e.g., 9979737457)', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    recruiter: [
      { name: 'firstName', placeholder: 'First Name', type: 'text', required: true },
      { name: 'lastName', placeholder: 'Last Name', type: 'text', required: true },
      { name: 'mobile', placeholder: 'Mobile (e.g., 9979737457)', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    mentor: [
      { name: 'firstName', placeholder: 'First Name', type: 'text', required: true },
      { name: 'lastName', placeholder: 'Last Name', type: 'text', required: true },
      { name: 'mobile', placeholder: 'Mobile (e.g., 9979737457)', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Password', type: showPassword ? 'text' : 'password', required: true },
    ],
  };

  return (
    <div className="flex min-h-screen font-sans lg:overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-4 sm:px-6 md:px-8 lg:h-screen lg:overflow-hidden">
        <div className="w-full max-w-md mx-auto lg:flex lg:flex-col lg:justify-center lg:min-h-[600px]">
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center space-x-3 mb-2">
              <img src={logo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-1 mb-1" />
                <p className="text-xs sm:text-sm text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4">
            {['student', 'company', 'academy', 'recruiter', 'mentor'].map((r) => (
              <div
                key={r}
                className={`flex flex-col items-center cursor-pointer p-1.5 ${
                  role === r ? 'border-b-2 border-[#3D7EFF]' : ''
                }`}
                onClick={() => handleRoleChange(r)}
              >
                <div className="p-1.5 rounded-lg border shadow-sm">
                  <img
                    src={
                      r === 'student' ? student :
                      r === 'company' ? company :
                      r === 'academy' ? academy :
                      r === 'recruiter' ? recruiter :
                      r === 'mentor' ? mentor :
                      'https://img.icons8.com/ios-filled/50/000000/user-male.png'
                    }
                    alt={r}
                    className="w-5 h-5 sm:w-6 sm:h-6"
                  />
                </div>
                <span className="text-xs font-medium capitalize">{r}</span>
              </div>
            ))}
          </div>

          {role && (
            <div className="w-full min-h-[350px] lg:min-h-[400px]">
              <h2 className="text-base sm:text-lg font-bold mb-1 text-black">Sign up</h2>
              <p className="text-xs text-gray-500 mb-3">Sign up to enjoy the feature of Revolutie</p>
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

              <form className="space-y-2" onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      className="w-full px-3 py-1.5 border rounded-md outline-none text-xs"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      className="w-full px-3 py-1.5 border rounded-md outline-none text-xs"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {formFields[role].filter(field => field.name !== 'firstName' && field.name !== 'lastName').map((field) => (
                  <div key={field.name} className="relative">
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      className="w-full px-3 py-1.5 border rounded-md outline-none text-xs"
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                    />
                    {(field.name === 'password' || field.name === 'confirmPassword') && (
                      showPassword ? (
                        <MdVisibility
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <MdVisibilityOff
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-500 cursor-pointer text-sm"
                          onClick={togglePasswordVisibility}
                        />
                      )
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full bg-[#3D7EFF] text-white py-1.5 rounded-md font-semibold text-xs"
                >
                  Sign up
                </button>
                {role === 'company' && (
                  <p className="text-xs text-center mt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#3D7EFF] font-semibold">Sign in</Link>
                  </p>
                )}
              </form>

              {role !== 'company' && (
                <>
                  <div className="flex items-center my-3 min-h-[24px]">
                    <hr className="flex-grow border-t" />
                    <span className="mx-2 text-xs text-gray-500">or</span>
                    <hr className="flex-grow border-t" />
                  </div>

                  <div className="flex justify-center gap-3 mb-3 min-h-[28px]">
                    <button className="border p-1 rounded-md">
                      <img src="https://img.icons8.com/color/48/google-logo.png" alt="Google" className="w-4 h-4" />
                    </button>
                    <button className="border p-1 rounded-md">
                      <img src={facebook} alt="Facebook" className="w-4 h-4" />
                    </button>
                    <button className="border p-1 rounded-md">
                      <img src={linkedin} alt="LinkedIn" className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#3D7EFF] font-semibold">Sign in</Link>
                  </p>
                </>
              )}
            </div>
          )}
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