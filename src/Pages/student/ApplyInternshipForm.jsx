import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaCloudUploadAlt, FaMale, FaFemale } from 'react-icons/fa';
import { MdOutlineWc } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSectionData, mUpdate, uploadAndStoreFile } from '../../Utils/api';

const genderOptions = [
  { label: 'Female', icon: <FaFemale size={20} /> },
  { label: 'Male', icon: <FaMale size={20} /> },
  { label: 'Others', icon: <MdOutlineWc size={20} /> },
];

const typeOptions = ['College Students', 'Professional', 'Others', 'Fresher'];
const yearOptions = ['2020', '2021', '2022', '2023', '2024'];
const differentlyAbledOptions = ['No', 'Yes'];
const specializationOptions = ['Computer Science', 'Mechanical', 'Marketing'];

const ApplyInternshipForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    course: '',
    specialization: '',
    duration: '',
    differentlyAbled: 'No',
    consent: false,
    resume: '',
  });
  const [existingUserData, setExistingUserData] = useState({});
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [instituteOptions, setInstituteOptions] = useState([]);
  const [instituteMap, setInstituteMap] = useState({});
  const [isResumeUploaded, setIsResumeUploaded] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user.userid;

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
          setExistingUserData(userData);
          const [firstName, ...lastNameParts] = userData.legalname?.split(' ') || [''];
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
            organization: userData.organisationcollege || '', // Stores institute ID
            type: userData.usertype || '',
            passoutYear: userData.endyear || '',
            course: userData.course || '',
            specialization: userData.coursespecialization || '',
            duration: duration,
            differentlyAbled: userData.differentlyAbled || 'No',
            consent: false,
            resume: userData.resume || '',
          });

          setFileName(userData.resume ? userData.resume.split('/').pop() : '');
          setIsResumeUploaded(!!userData.resume);
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

        const courseMap = {};
        courses.forEach((course) => {
          courseMap[course.id] = course.name;
        });

        setCourseMap(courseMap);
        setCourseOptions(courses);

        // Fetch institute data
        const instituteResponse = await fetchSectionData({
          collectionName: 'institute',
          query: {},
          projection: { sectionData: 1, _id: 1 },
        });

        const institutes = instituteResponse.map((item) => ({
          id: item._id,
          name: item.sectionData.institute.institutionname,
        }));

        const instituteMap = {};
        institutes.forEach((institute) => {
          instituteMap[institute.id] = institute.name;
        });

        setInstituteMap(instituteMap);
        setInstituteOptions(institutes);
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
    setIsResumeUploaded(false); // Allow re-upload
  };

  const validateFirstForm = () => {
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.mobile.trim()) return 'Mobile number is required.';
    if (!formData.firstName.trim()) return 'First name is required.';
    if (!formData.gender) return 'Gender is required.';
    if (!formData.organization) return 'Institution name is required.';
    if (!formData.type) return 'Type is required.';
    if (!formData.passoutYear) return 'Passout year is required.';
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
    if (!file && !formData.resume) {
      toast.error('Please upload your CV/Resume.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
      return;
    }

    try {
      setLoading(true);
      let resumeUrl = formData.resume;

      // Upload new resume if a file is selected
      if (file) {
        console.log('Uploading new resume for userId:', userId);
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'appuser',
          file,
          userId,
        });
        console.log('Upload response:', uploadResponse);
        resumeUrl = uploadResponse.filePath || '';
        if (!resumeUrl) {
          throw new Error('Failed to retrieve resume URL from upload response.');
        }
        setFormData((prev) => ({ ...prev, resume: resumeUrl }));
        setFileName(resumeUrl.split('/').pop());
        setIsResumeUploaded(true);
      }

      console.log('Resume URL to be saved:', resumeUrl);

      // Prepare user data update
      const updateData = {
        sectionData: {
          appuser: {
            ...existingUserData,
            name: formData.email,
            fname: '',
            lname: '',
            email: formData.email,
            mobile: formData.mobile,
            legalname: `${formData.firstName} ${formData.lastName}`.trim(),
            Gender: formData.gender,
            organisationcollege: formData.organization, // Stores institute ID
            usertype: formData.type,
            endyear: formData.passoutYear,
            course: formData.course,
            coursespecialization: formData.specialization,
            duration: formData.duration,
            differentlyAbled: formData.differentlyAbled,
            resume: resumeUrl,
            password: existingUserData.password || '',
            role: existingUserData.role || user.role,
            isOtpVerify: existingUserData.isOtpVerify || false,
            academyname: existingUserData.academyname || '',
            growinmycurrentcareer: existingUserData.growinmycurrentcareer || false,
            location: existingUserData.location || '',
            purpose: existingUserData.purpose || [],
            role1: existingUserData.role1 || [],
            startyear: existingUserData.startyear || '',
            stream: existingUserData.stream || '',
            teammember: existingUserData.teammember || '',
            transitioninnewcareer: existingUserData.transitioninnewcareer || false,
          },
        },
      };

      console.log('Updating appuser with data:', JSON.stringify(updateData, null, 2));

      // Update user data in appuser collection
      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: updateData },
        options: { upsert: false },
      });
      console.log('Update response:', updateResponse);

      // Record application in applications collection
      const applicationResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'applications',
        query: { userId, jobId: id },
        update: {
          $set: {
            userId,
            jobId: id,
            appliedAt: new Date().toISOString(),
            organisationcollege: formData.organization, // Store institute ID
          },
        },
        options: { upsert: true },
      });
      console.log('Application recorded:', applicationResponse);

      // Update jobpost to add userId to applicants array
      const jobPostUpdateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'jobpost',
        query: { _id: id },
        update: {
          $push: {
            'sectionData.jobpost.applicants': { text: userId },
          },
        },
        options: { upsert: false },
      });
      console.log('Job post applicants updated:', jobPostUpdateResponse);

      // Scroll to top before showing toast
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Show success toast and delay navigation
      toast.success('Form submitted successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        onClose: () => navigate('/my-applications'),
      });
    } catch (err) {
      console.error('Submit Error:', err);
      window.scrollTo({ top: 0, behavior: 'instant' });
      toast.error(`Failed to submit form: ${err.message || 'Please try again.'}`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
      });
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
      <ToastContainer />
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl md:text-2xl font-bold text-[#050748] mb-4 text-center">
          {page === 1 ? 'Candidate Details' : 'Resume Submission'}
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
                  Institution Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Institution</option>
                  {instituteOptions.map((institute) => (
                    <option key={institute.id} value={institute.id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
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
              {isResumeUploaded ? (
                <div className="text-sm text-gray-600">
                  <p>Uploaded Resume:</p>
                  <a
                    href={formData.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {fileName || 'View Resume'}
                  </a>
                </div>
              ) : (
                <>
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
                    <p className="mt-2 text-sm text-gray-600">Selected: {fileName}</p>
                  )}
                </>
              )}
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