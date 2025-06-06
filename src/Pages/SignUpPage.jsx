import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { jwtDecode } from 'jwt-decode';
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
    name: '',
    companyName: '',
    academyName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Role IDs and names
  const roleIds = {
    student: '1747825619417',
    company: '1747723485001',
    academy: '1747903042943',
    recruiter: '1747902920002',
    mentor: '1747902955524',
  };

  const roleNames = {
    '1747825619417': 'student',
    '1747723485001': 'company',
    '1747903042943': 'academy',
    '1747902920002': 'recruiter',
    '1747902955524': 'mentor',
  };

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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
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
      name: '',
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

    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character (e.g., !@#$%^&*).');
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
          mobile: formData.mobile.trim() ? `+63${formData.mobile.trim()}` : '',
          legalname: formData.name.trim(),
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
          legalname: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          mobile: formData.mobile.trim() ? `+63${formData.mobile.trim()}` : '',
          ...(role === 'academy' && { academyname: formData.academyName.trim() }),
        };
        console.log('Signup Payload:', payload);
        response = await signup(payload);
      }

      if (response.success) {
        if (role === 'company') {
          setFormData({
            name: '',
            companyName: '',
            academyName: '',
            mobile: '',
            email: '',
            password: '',
            confirmPassword: '',
          });
          const companyId = response.user?.companyId || '';
          localStorage.setItem('user', JSON.stringify({
            legalname: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            role: roleNames[roleIds[role]],
            roleId: roleIds[role],
            companyId: companyId,
          }));
          navigate('/');
        } else {
          localStorage.setItem('pendingUser', JSON.stringify({
            legalname: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            role: roleNames[roleIds[role]],
            roleId: roleIds[role],
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
      { name: 'name', placeholder: 'Name', type: 'text', required: true },
      { name: 'mobile', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Strong Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Strong Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    company: [
      { name: 'name', placeholder: 'Name', type: 'text', required: true },
      { name: 'companyName', placeholder: 'Company Name', type: 'text', required: true },
      { name: 'mobile', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Strong Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Strong Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    academy: [
      { name: 'name', placeholder: 'Name', type: 'text', required: true },
      { name: 'academyName', placeholder: 'Academy Name', type: 'text', required: true },
      { name: 'mobile', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Strong Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Strong Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    recruiter: [
      { name: 'name', placeholder: 'Name', type: 'text', required: true },
      { name: 'mobile', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Strong Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Strong Password', type: showPassword ? 'text' : 'password', required: true },
    ],
    mentor: [
      { name: 'name', placeholder: 'Name', type: 'text', required: true },
      { name: 'mobile', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email', required: true },
      { name: 'password', placeholder: 'Strong Password', type: showPassword ? 'text' : 'password', required: true },
      { name: 'confirmPassword', placeholder: 'Confirm Strong Password', type: showPassword ? 'text' : 'password', required: true },
    ],
  };

  return (
    <div className="flex h-screen font-sans">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 py-2 xs:px-6 sm:px-8">
        <div className="max-w-[20rem] xs:max-w-[24rem] sm:max-w-[28rem] mx-auto w-full">
          <div className="mb-3 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-1">
              <img src={logo} alt="Logo" className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
              <div>
                <h1 className="text-base xs:text-lg sm:text-xl font-bold text-[#050748] tracking-wide">
                  INTERNSHIP–OJT
                </h1>
                <div className="w-full h-[2px] bg-[#050748] mt-0.5 mb-0.5" />
                <p className="text-xs xs:text-sm sm:text-base text-black font-bold text-center">
                  WORK24 PHILIPPINES
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 mb-3">
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
                      r === 'student'
                        ? student
                        : r === 'company'
                        ? company
                        : r === 'academy'
                        ? academy
                        : r === 'recruiter'
                        ? recruiter
                        : r === 'mentor'
                        ? mentor
                        : 'https://img.icons8.com/ios-filled/50/000000/user-male.png'
                    }
                    alt={r}
                    className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7"
                  />
                </div>
                <span className="text-xs xs:text-sm font-medium capitalize">{r}</span>
              </div>
            ))}
          </div>
          {role && (
            <div className="w-full">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold mb-1 text-black">Sign up</h2>
              <p className="text-xs xs:text-sm text-gray-500 mb-2">Sign up to enjoy the feature of Revolutie</p>
              {error && <p className="text-red-500 text-xs xs:text-sm mb-2">{error}</p>}
              <form className="space-y-2" onSubmit={handleSubmit}>
                {formFields[role].map((field) => (
                  <div key={field.name} className="relative flex items-center">
                    {field.name === 'mobile' && (
                      <span className="absolute left-3 text-gray-500 text-xs xs:text-sm sm:text-base">+63</span>
                    )}
                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 xs:px-4 xs:py-2.5 border rounded-md outline-none text-xs xs:text-sm sm:text-base focus:ring-2 focus:ring-[#3D7EFF] ${
                        field.name === 'mobile' ? 'pl-10' : ''
                      }`}
                      value={formData[field.name]}
                      onChange={handleChange}
                      required={field.required}
                    />
                    {(field.name === 'password' || field.name === 'confirmPassword') &&
                      (showPassword ? (
                        <MdVisibility
                          className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                          onClick={togglePasswordVisibility}
                        />
                      ) : (
                        <MdVisibilityOff
                          className="absolute top-1/2 right-2 xs:right-3 transform -translate-y-1/2 text-gray-500 cursor-pointer text-base xs:text-lg"
                          onClick={togglePasswordVisibility}
                        />
                      ))}
                  </div>
                ))}
                <button
                  type="submit"
                  className="w-full bg-[#3D7EFF] text-white py-2 xs:py-2.5 rounded-md font-semibold text-xs xs:text-sm sm:text-base hover:bg-[#2b66cc] transition-colors"
                >
                  Sign up
                </button>
                {role === 'company' && (
                  <p className="text-sm xs:text-sm text-center mt-2.5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#3D7EFF] font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                )}
              </form>
              {role !== 'company' && (
                <>
                  <p className="text-sm xs:text-sm text-center mt-2.5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#3D7EFF] font-semibold hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          )}
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

export default SignUpPage;