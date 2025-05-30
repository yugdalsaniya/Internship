import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaMale, FaFemale } from 'react-icons/fa';
import { MdTransgender, MdOutlineWc } from 'react-icons/md';
import { PiGenderIntersexBold } from 'react-icons/pi';
import { TbGenderBigender } from 'react-icons/tb';
import { BsEyeSlash } from 'react-icons/bs';
import { fetchSectionData, mUpdate, uploadAndStoreFile } from '../../Utils/api';

const genderOptions = [
  { label: 'Female', icon: <FaFemale size={20} /> },
  { label: 'Male', icon: <FaMale size={20} /> },
  { label: 'Transgender', icon: <MdTransgender size={20} /> },
  { label: 'Intersex', icon: <PiGenderIntersexBold size={20} /> },
  { label: 'Non-binary', icon: <TbGenderBigender size={20} /> },
  { label: 'Prefer not to say', icon: <BsEyeSlash size={20} /> },
  { label: 'Others', icon: <MdOutlineWc size={20} /> },
];

const typeOptions = ['College Students', 'Professional', 'Others', 'Fresher'];
const yearOptions = ['2020', '2021', '2022', '2023', '2024'];
const differentlyAbledOptions = ['No', 'Yes'];
const specializationOptions = ['Computer Science', 'Mechanical', 'Marketing'];

const ApplyInternshipForm = () => {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    gender: '',
    organization: '',
    type: '',
    passoutYear: '',
    course: '', // Will store course ID
    specialization: '',
    duration: '',
    differentlyAbled: 'No',
    location: '',
    consent: false,
  });
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [extendedLocation, setExtendedLocation] = useState({
    country: '',
    state: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]); // Dynamic course options
  const [courseMap, setCourseMap] = useState({}); // Map course ID to name for display

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.userid;

  // Fetch user data and course data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('User not logged in. Please log in to continue.');
        return;
      }

      try {
        setLoading(true);

        // Fetch user data
        const userResponse = await fetchSectionData({
          collectionName: 'appuser',
          query: { _id: userId },
          projection: { sectionData: 1 },
        });

        if (userResponse.length > 0) {
          const userData = userResponse[0].sectionData.appuser;
          const [firstName, ...lastNameParts] = userData.legalname.split(' ');
          const duration =
            userData.startyear && userData.endyear
              ? `${parseInt(userData.endyear) - parseInt(userData.startyear)} years`
              : '';

          setFormData({
            email: userData.email || '',
            mobile: userData.mobile || '',
            firstName: firstName || '',
            lastName: lastNameParts.join(' ') || '',
            gender: userData.Gender || '',
            organization: userData.organisationcollege || '',
            type: userData.usertype || '',
            passoutYear: userData.endyear || '',
            course: userData.course || '', // Stores course ID
            specialization: userData.coursespecialization || '',
            duration: duration,
            differentlyAbled: userData.differentlyAbled || 'No',
            location: userData.location || '',
            consent: false,
          });

          setFileName(userData.resume ? userData.resume.split('/').pop() : '');
        } else {
          setError('User data not found.');
        }

        // Fetch course data
        const courseResponse = await fetchSectionData({
          collectionName: 'course',
          query: {},
          projection: { sectionData: 1, _id: 1 },
        });

        const courses = courseResponse.map((item) => ({
          id: item._id,
          name: item.sectionData.course.name,
        }));

        // Create course map for ID-to-name lookup
        const map = {};
        courses.forEach((course) => {
          map[course.id] = course.name;
        });

        setCourseMap(map);
        setCourseOptions(courses);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error('Fetch Data Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile?.name || '');
  };

  const handleExtendedLocationChange = (e) => {
    const { name, value } = e.target;
    setExtendedLocation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateFirstForm = () => {
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.mobile.trim()) return 'Mobile number is required.';
    if (!formData.firstName.trim()) return 'First name is required.';
    if (!formData.gender) return 'Gender is required.';
    if (!formData.organization.trim()) return 'Organization name is required.';
    if (!formData.type) return 'Type is required.';
    if (!formData.passoutYear) return 'Passout year is required.';
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.consent) return 'You must agree to the terms and conditions.';
    return '';
  };

  const handleNext = (e) => {
    e.preventDefault();
    const validationError = validateFirstForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setPage(2);
  };

  const handleBack = () => {
    setPage(1);
  };

  const handleSubmit = async () => {
    if (!file && !fileName) {
      alert('Please upload your CV/Resume.');
      return;
    }
    if (!extendedLocation.country || !extendedLocation.state || !extendedLocation.city) {
      alert('Please fill out all location fields.');
      return;
    }

    try {
      setLoading(true);
      let resumeUrl = formData.resume;

      if (file) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'appuser',
          file,
          userId,
        });
        resumeUrl = uploadResponse.data?.fileUrl || '';
      }

      const updateData = {
        sectionData: {
          appuser: {
            email: formData.email,
            mobile: formData.mobile,
            legalname: `${formData.firstName} ${formData.lastName}`.trim(),
            Gender: formData.gender,
            organisationcollege: formData.organization,
            usertype: formData.type,
            endyear: formData.passoutYear,
            course: formData.course, // Stores course ID
            coursespecialization: formData.specialization,
            duration: formData.duration,
            differentlyAbled: formData.differentlyAbled,
            location: formData.location,
            resume: resumeUrl,
            country: extendedLocation.country,
            state: extendedLocation.state,
            city: extendedLocation.city,
          },
        },
      };

      await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });

      alert('Form submitted successfully!');
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOptionButtons = (options, selected, onSelect) => {
    return (
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const label = typeof option === 'object' ? option.label : option;
          const icon = typeof option === 'object' ? option.icon : null;
          const isSelected = selected === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(label)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-blue-100 text-blue-700 border-blue-500 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {icon && <span>{icon}</span>}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          {page === 1 ? 'Candidate Details' : 'Extended Form'}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {loading && <p className="text-blue-500 text-sm mb-4 text-center">Loading...</p>}

        {page === 1 && (
          <form onSubmit={handleNext} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g., example@domain.com"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="e.g., +91 1234567890"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g., John"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name (Optional)
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g., Doe"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                {renderOptionButtons(genderOptions, formData.gender, (val) =>
                  setFormData((prev) => ({ ...prev, gender: val }))
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g., ABC University"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                {renderOptionButtons(typeOptions, formData.type, (val) =>
                  setFormData((prev) => ({ ...prev, type: val }))
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Passout Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Course (Optional)
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course</option>
                  {courseOptions.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialization (Optional)
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Specialization</option>
                  {specializationOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 6 months"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Differently Abled <span className="text-red-500">*</span>
                </label>
                {renderOptionButtons(
                  differentlyAbledOptions,
                  formData.differentlyAbled,
                  (val) => setFormData((prev) => ({ ...prev, differentlyAbled: val }))
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai, India"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                id="consent"
                required
                className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I agree to terms and conditions
              </label>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
                disabled={loading}
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <span
                className={`h-3 w-3 rounded-full mx-1 ${
                  page === 1 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></span>
              <span
                className={`h-3 w-3 rounded-full mx-1 ${
                  page === 2 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></span>
            </div>
          </form>
        )}

        {page === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CV/Resume Submission <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Remark: Submit your resume in doc, docx, pdf
              </p>
              <label
                htmlFor="resume-upload"
                className="flex flex-col items-center justify-center border border-dashed border-gray-400 bg-gray-50 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-all"
              >
                <FaCloudUploadAlt className="text-4xl text-blue-500 mb-2" />
                <span className="text-blue-600 font-medium text-sm">
                  Click to Upload file
                </span>
                <span className="text-xs text-gray-500">
                  Maximum file size is 50 MB{' '}
                  <span className="text-red-500">(File type: pdf, doc, docx)</span>
                </span>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                />
              </label>
              {fileName && (
                <p className="mt-2 text-sm text-gray-600">Uploaded: {fileName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Location <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-2">Remark: Enter Your Location</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={extendedLocation.country}
                    onChange={handleExtendedLocationChange}
                    placeholder="e.g., India"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={extendedLocation.state}
                    onChange={handleExtendedLocationChange}
                    placeholder="e.g., Maharashtra"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={extendedLocation.city}
                    onChange={handleExtendedLocationChange}
                    placeholder="e.g., Mumbai"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 border border-gray-400 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-100"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-purple-700 transition-all"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="flex justify-center mt-4">
              <span
                className={`h-3 w-3 rounded-full mx-1 ${
                  page === 1 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></span>
              <span
                className={`h-3 w-3 rounded-full mx-1 ${
                  page === 2 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyInternshipForm;