import React, { useState, useEffect, useRef } from 'react';
import { BiTime } from 'react-icons/bi';
import { BsEye, BsLightbulb } from 'react-icons/bs';
import { AiFillFilePdf } from 'react-icons/ai';
import { MdDelete, MdEdit } from 'react-icons/md';
import { ChevronDown, Plus } from 'lucide-react';
import { fetchSectionData, mUpdate, uploadAndStoreFile } from '../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Education = () => {
  const [formData, setFormData] = useState({
    qualification: '',
    course: '',
    specialization: '',
    stream: '',
    board: '',
    college: '',
    startYear: '',
    endYear: '',
    courseType: '',
    percentage: '',
    cgpa: '',
    rollNumber: '',
    lateralEntry: '',
    skills: '',
    description: '',
    fileUrl: '',
  });
  const [educationList, setEducationList] = useState([]);
  const [intermediateEducationList, setIntermediateEducationList] = useState([]);
  const [highSchoolEducationList, setHighSchoolEducationList] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingIntermediateIndex, setEditingIntermediateIndex] = useState(null);
  const [editingHighSchoolIndex, setEditingHighSchoolIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isQualificationLocked, setIsQualificationLocked] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) {
      toast.error('Please log in to view your details.', { position: 'top-right', autoClose: 5000 });
      return;
    }
    try {
      const user = JSON.parse(userString);
      setUserId(user.userid);
    } catch (parseError) {
      toast.error('Invalid user data. Please log in again.', { position: 'top-right', autoClose: 5000 });
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsProcessing(true);
        console.log('Fetching courses from database...');
        const response = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'course',
          query: {},
          projection: { _id: 1, 'sectionData.course.name': 1 },
        });

        console.log('fetchCourses raw response:', response);

        if (!response || !Array.isArray(response)) {
          console.error('Response is not an array or is null:', response);
          toast.error('Invalid response from server while fetching courses.', { position: 'top-right', autoClose: 5000 });
          return;
        }

        if (response.length === 0) {
          console.warn('No courses found in the database.');
          toast.error('No courses found in the database. Please add courses to continue.', { position: 'top-right', autoClose: 5000 });
          return;
        }

        const courses = response.map((item, index) => {
          if (!item._id) {
            console.warn(`Course at index ${index} missing _id:`, item);
            return null;
          }
          if (!item.sectionData?.course?.name) {
            console.warn(`Course at index ${index} missing sectionData.course.name:`, item);
            return null;
          }
          return {
            id: item._id,
            name: item.sectionData.course.name,
          };
        }).filter(Boolean);

        console.log('Processed courses:', courses);

        if (courses.length === 0) {
          toast.error('No valid courses found in the database.', { position: 'top-right', autoClose: 5000 });
          return;
        }

        setCourseOptions(courses);
        
      } catch (err) {
        console.error('fetchCourses error:', err);
        toast.error(`Failed to load course data: ${err.message}`, { position: 'top-right', autoClose: 5000 });
      } finally {
        setIsProcessing(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserEducation = async () => {
      try {
        setIsProcessing(true);
        const response = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'appuser',
          query: { _id: userId },
          projection: {
            'sectionData.appuser.education': 1,
            'sectionData.appuser.intermediateeducation': 1,
            'sectionData.appuser.highschooleducation': 1,
          },
        });

        console.log('Fetched education data:', response);

        const fetchedEducation = response && response[0] && response[0].sectionData?.appuser?.education
          ? response[0].sectionData.appuser.education
          : [];
        const fetchedIntermediateEducation = response && response[0] && response[0].sectionData?.appuser?.intermediateeducation
          ? response[0].sectionData.appuser.intermediateeducation
          : [];
        const fetchedHighSchoolEducation = response && response[0] && response[0].sectionData?.appuser?.highschooleducation
          ? response[0].sectionData.appuser.highschooleducation
          : [];

        setEducationList(fetchedEducation);
        setIntermediateEducationList(fetchedIntermediateEducation);
        setHighSchoolEducationList(fetchedHighSchoolEducation);
        setShowForm(fetchedEducation.length === 0 && fetchedIntermediateEducation.length === 0 && fetchedHighSchoolEducation.length === 0);
      } catch (err) {
        toast.error('Failed to load education data.', { position: 'top-right', autoClose: 5000 });
      } finally {
        setIsProcessing(false);
      }
    };

    fetchUserEducation();
  }, [userId]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFormData({ ...formData, fileUrl: '' });
  };

  const handleRemoveFileFromForm = () => {
    setSelectedFile(null);
    setFormData({ ...formData, fileUrl: '' });
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('Please log in to save education details.', { position: 'top-right', autoClose: 5000 });
      return;
    }

    console.log('formData before saving:', formData);

    const requiredFields = ['qualification', 'board', 'college', 'startYear', 'endYear'];
    const isIntermediate = formData.qualification === 'Intermediate (12th)';
    if (isIntermediate) {
      requiredFields.push('stream');
    } else if (formData.qualification !== 'High School (10th)') {
      requiredFields.push('course');
    }

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field} field.`, { position: 'top-right', autoClose: 5000 });
        return;
      }
    }

    if (formData.qualification !== 'High School (10th)' && formData.qualification !== 'Intermediate (12th)') {
      const validCourse = courseOptions.find((course) => course.id === formData.course);
      if (!validCourse) {
        toast.error('Please select a valid course from the list.', { position: 'top-right', autoClose: 5000 });
        return;
      }
    }

    try {
      setIsProcessing(true);
      let fileUrl = formData.fileUrl;

      if (selectedFile) {
        const uploadResponse = await uploadAndStoreFile({
          appName: 'app8657281202648',
          moduleName: 'appuser',
          file: selectedFile,
          userId,
        });

        fileUrl = uploadResponse?.filePath || uploadResponse?.fileUrl || uploadResponse?.data?.fileUrl;
        if (!fileUrl) {
          throw new Error('Failed to upload file: No file path returned in response.');
        }
      }

      let updatePayload = {};
      const isHighSchool = formData.qualification === 'High School (10th)';

      if (isHighSchool) {
        const highSchoolData = {
          qualification3: formData.qualification,
          board3: formData.board,
          college3: formData.college,
          startyear3: formData.startYear,
          endyear3: formData.endYear,
          coursetype3: formData.courseType,
          percentage3: formData.percentage,
          cgpa3: formData.cgpa,
          rollnumber3: formData.rollNumber,
          files3: fileUrl,
        };

        if (editingHighSchoolIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.highschooleducation.${editingHighSchoolIndex}`]: highSchoolData,
          };
          const updatedHighSchoolList = [...highSchoolEducationList];
          updatedHighSchoolList[editingHighSchoolIndex] = highSchoolData;
          setHighSchoolEducationList(updatedHighSchoolList);
        } else {
          const updatedHighSchoolList = [...highSchoolEducationList, highSchoolData];
          updatePayload = {
            'sectionData.appuser.highschooleducation': updatedHighSchoolList,
          };
          setHighSchoolEducationList(updatedHighSchoolList);
        }
      } else if (isIntermediate) {
        const intermediateData = {
          qualification2: formData.qualification,
          steam2: formData.stream,
          board2: formData.board,
          college2: formData.college,
          startyear2: formData.startYear,
          endyear2: formData.endYear,
          coursetype2: formData.courseType,
          percentage2: formData.percentage,
          cgpa2: formData.cgpa,
          rollnumber2: formData.rollNumber,
          files2: fileUrl,
        };

        if (editingIntermediateIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.intermediateeducation.${editingIntermediateIndex}`]: intermediateData,
          };
          const updatedIntermediateList = [...intermediateEducationList];
          updatedIntermediateList[editingIntermediateIndex] = intermediateData;
          setIntermediateEducationList(updatedIntermediateList);
        } else {
          const updatedIntermediateList = [...intermediateEducationList, intermediateData];
          updatePayload = {
            'sectionData.appuser.intermediateeducation': updatedIntermediateList,
          };
          setIntermediateEducationList(updatedIntermediateList);
        }
      } else {
        const educationData = {
          assetname1: formData.qualification,
          course1: formData.course,
          specialization1: formData.specialization,
          stream1: formData.stream,
          board1: formData.board,
          college1: formData.college,
          startyear1: formData.startYear,
          endyear1: formData.endYear,
          'Course type1': formData.courseType,
          percentage1: formData.percentage,
          cgpa1: formData.cgpa,
          rollnumber1: formData.rollNumber,
          areyoualateralentrystudent1: formData.lateralEntry,
          skills1: formData.skills,
          description1: formData.description,
          files1: fileUrl,
        };

        console.log('educationData:', educationData);

        if (editingIndex !== null) {
          updatePayload = {
            [`sectionData.appuser.education.${editingIndex}`]: educationData,
          };
          const updatedEducationList = [...educationList];
          updatedEducationList[editingIndex] = educationData;
          setEducationList(updatedEducationList);
        } else {
          const updatedEducationList = [...educationList, educationData];
          updatePayload = {
            'sectionData.appuser.education': updatedEducationList,
          };
          setEducationList(updatedEducationList);
        }
      }

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (response && response.success) {
        toast.success(
          editingIndex !== null || editingIntermediateIndex !== null || editingHighSchoolIndex !== null
            ? 'Education details updated successfully!'
            : 'Education details saved successfully!',
          { position: 'top-right', autoClose: 3000 }
        );
        setFormData({
          qualification: '',
          course: '',
          specialization: '',
          stream: '',
          board: '',
          college: '',
          startYear: '',
          endYear: '',
          courseType: '',
          percentage: '',
          cgpa: '',
          rollNumber: '',
          lateralEntry: '',
          skills: '',
          description: '',
          fileUrl: '',
        });
        setSelectedFile(null);
        setEditingIndex(null);
        setEditingIntermediateIndex(null);
        setEditingHighSchoolIndex(null);
        setShowForm(false);
        setIsQualificationLocked(false);
      } else {
        throw new Error('Failed to save education data to database.');
      }
    } catch (error) {
      console.error('Failed to save education data:', error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to save education details', { position: 'top-right', autoClose: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditEducation = (index, type) => {
    if (type === 'highschool') {
      const edu = highSchoolEducationList[index];
      setFormData({
        qualification: edu.qualification3 || '',
        course: '',
        specialization: '',
        stream: '',
        board: edu.board3 || '',
        college: edu.college3 || '',
        startYear: edu.startyear3 || '',
        endYear: edu.endyear3 || '',
        courseType: edu.coursetype3 || '',
        percentage: edu.percentage3 || '',
        cgpa: edu.cgpa3 || '',
        rollNumber: edu.rollnumber3 || '',
        lateralEntry: '',
        skills: '',
        description: '',
        fileUrl: edu.files3 || '',
      });
      setEditingHighSchoolIndex(index);
      setEditingIntermediateIndex(null);
      setEditingIndex(null);
      setIsQualificationLocked(true);
    } else if (type === 'intermediate') {
      const edu = intermediateEducationList[index];
      setFormData({
        qualification: edu.qualification2 || '',
        course: '',
        specialization: '',
        stream: edu.steam2 || '',
        board: edu.board2 || '',
        college: edu.college2 || '',
        startYear: edu.startyear2 || '',
        endYear: edu.endyear2 || '',
        courseType: edu.coursetype2 || '',
        percentage: edu.percentage2 || '',
        cgpa: edu.cgpa2 || '',
        rollNumber: edu.rollnumber2 || '',
        lateralEntry: '',
        skills: '',
        description: '',
        fileUrl: edu.files2 || '',
      });
      setEditingIntermediateIndex(index);
      setEditingHighSchoolIndex(null);
      setEditingIndex(null);
      setIsQualificationLocked(true);
    } else {
      const edu = educationList[index];
      const courseValue = courseOptions.find((c) => c.id === edu.course1 || c.name === edu.course1)?.id || edu.course1 || '';
      setFormData({
        qualification: edu.assetname1 || '',
        course: courseValue,
        specialization: edu.specialization1 || '',
        stream: edu.stream1 || '',
        board: edu.board1 || '',
        college: edu.college1 || '',
        startYear: edu.startyear1 || '',
        endYear: edu.endyear1 || '',
        courseType: edu['Course type1'] || '',
        percentage: edu.percentage1 || '',
        cgpa: edu.cgpa1 || '',
        rollNumber: edu.rollnumber1 || '',
        lateralEntry: edu.areyoualateralentrystudent1 || '',
        skills: edu.skills1 || '',
        description: edu.description1 || '',
        fileUrl: edu.files1 || '',
      });
      setEditingIndex(index);
      setEditingIntermediateIndex(null);
      setEditingHighSchoolIndex(null);
      setIsQualificationLocked(false);
    }
    setSelectedFile(null);
    setShowForm(true);
    setShowDropdown(false);
  };

  const handleRemoveEducation = async (index, type) => {
    if (!userId) {
      toast.error('Please log in to remove education details.', { position: 'top-right', autoClose: 5000 });
      return;
    }

    try {
      setIsProcessing(true);
      let updatePayload = {};
      let updatedEducationList = [...educationList];
      let updatedIntermediateList = [...intermediateEducationList];
      let updatedHighSchoolList = [...highSchoolEducationList];

      if (type === 'highschool') {
        updatedHighSchoolList.splice(index, 1);
        updatePayload = {
          'sectionData.appuser.highschooleducation': updatedHighSchoolList,
        };
        setHighSchoolEducationList(updatedHighSchoolList);
        if (editingHighSchoolIndex === index) {
          setEditingHighSchoolIndex(null);
        }
      } else if (type === 'intermediate') {
        updatedIntermediateList.splice(index, 1);
        updatePayload = {
          'sectionData.appuser.intermediateeducation': updatedIntermediateList,
        };
        setIntermediateEducationList(updatedIntermediateList);
        if (editingIntermediateIndex === index) {
          setEditingIntermediateIndex(null);
        }
      } else {
        updatedEducationList.splice(index, 1);
        updatePayload = {
          'sectionData.appuser.education': updatedEducationList,
        };
        setEducationList(updatedEducationList);
        if (editingIndex === index) {
          setEditingIndex(null);
        }
      }

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (response && response.success) {
        toast.success('Education entry removed successfully!', { position: 'top-right', autoClose: 3000 });
        setFormData({
          qualification: '',
          course: '',
          specialization: '',
          stream: '',
          board: '',
          college: '',
          startYear: '',
          endYear: '',
          courseType: '',
          percentage: '',
          cgpa: '',
          rollNumber: '',
          lateralEntry: '',
          skills: '',
          description: '',
          fileUrl: '',
        });
        setSelectedFile(null);
        setShowForm(updatedEducationList.length === 0 && updatedIntermediateList.length === 0 && updatedHighSchoolList.length === 0);
        setIsQualificationLocked(false);
      } else {
        throw new Error('Failed to remove education entry from database.');
      }
    } catch (error) {
      console.error('Failed to remove education data:', error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to remove education entry', { position: 'top-right', autoClose: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFile = async (index, type) => {
    if (!userId) {
      toast.error('Please log in to remove file.', { position: 'top-right', autoClose: 5000 });
      return;
    }

    try {
      setIsProcessing(true);
      let updatePayload = {};

      if (type === 'highschool') {
        updatePayload = {
          [`sectionData.appuser.highschooleducation.${index}.files3`]: '',
        };
        const updatedHighSchoolList = [...highSchoolEducationList];
        updatedHighSchoolList[index] = { ...updatedHighSchoolList[index], files3: '' };
        setHighSchoolEducationList(updatedHighSchoolList);
      } else if (type === 'intermediate') {
        updatePayload = {
          [`sectionData.appuser.intermediateeducation.${index}.files2`]: '',
        };
        const updatedIntermediateList = [...intermediateEducationList];
        updatedIntermediateList[index] = { ...updatedIntermediateList[index], files2: '' };
        setIntermediateEducationList(updatedIntermediateList);
      } else {
        updatePayload = {
          [`sectionData.appuser.education.${index}.files1`]: '',
        };
        const updatedEducationList = [...educationList];
        updatedEducationList[index] = { ...updatedEducationList[index], files1: '' };
        setEducationList(updatedEducationList);
      }

      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: {
          $set: updatePayload,
        },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      if (response && response.success) {
        toast.success('File removed successfully!', { position: 'top-right', autoClose: 3000 });
        if (type === 'education' && editingIndex === index) {
          setFormData({ ...formData, fileUrl: '' });
          setSelectedFile(null);
        } else if (type === 'intermediate' && editingIntermediateIndex === index) {
          setFormData({ ...formData, fileUrl: '' });
          setSelectedFile(null);
        } else if (type === 'highschool' && editingHighSchoolIndex === index) {
          setFormData({ ...formData, fileUrl: '' });
          setSelectedFile(null);
        }
      } else {
        throw new Error('Failed to remove file from database.');
      }
    } catch (error) {
      console.error('Failed to remove file:', error);
      let errorMessage = error.message;
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to remove file', { position: 'top-right', autoClose: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
    setFormData({
      qualification: 'Bachelor',
      course: '',
      specialization: '',
      stream: '',
      board: '',
      college: '',
      startYear: '',
      endYear: '',
      courseType: '',
      percentage: '',
      cgpa: '',
      rollNumber: '',
      lateralEntry: '',
      skills: '',
      description: '',
      fileUrl: '',
    });
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setIsQualificationLocked(false);
  };

  const handleAddIntermediate = () => {
    setShowForm(true);
    setFormData({
      qualification: 'Intermediate (12th)',
      course: '',
      specialization: '',
      stream: '',
      board: '',
      college: '',
      startYear: '',
      endYear: '',
      courseType: '',
      percentage: '',
      cgpa: '',
      rollNumber: '',
      lateralEntry: '',
      skills: '',
      description: '',
      fileUrl: '',
    });
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setIsQualificationLocked(true);
  };

  const handleAddHighSchool = () => {
    setShowForm(true);
    setFormData({
      qualification: 'High School (10th)',
      course: '',
      specialization: '',
      stream: '',
      board: '',
      college: '',
      startYear: '',
      endYear: '',
      courseType: '',
      percentage: '',
      cgpa: '',
      rollNumber: '',
      lateralEntry: '',
      skills: '',
      description: '',
      fileUrl: '',
    });
    setSelectedFile(null);
    setEditingIndex(null);
    setEditingIntermediateIndex(null);
    setEditingHighSchoolIndex(null);
    setShowDropdown(false);
    setIsQualificationLocked(true);
  };

  const dropdownOptions = {
    qualification: ['High School (10th)', 'Intermediate (12th)', 'Bachelor', 'Master', 'PhD'],
    stream: ['Science', 'Commerce', 'Arts'],
    board: ['CBSE', 'ICSE', 'State Board'],
    courseType: ['Full Time', 'Part Time', 'Distance Learning'],
    specialization: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Business Administration', 'Other'],
    lateralEntry: ['Yes', 'No'],
  };

  const getCourseNameById = (id) => {
    const course = courseOptions.find((c) => c.id === id || c.name === id);
    return course ? course.name : id || 'Unknown Course';
  };

  const renderSelect = (label, field, options, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={formData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className={`w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
            isProcessing || (field === 'qualification' && isQualificationLocked) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isProcessing || (field === 'qualification' && isQualificationLocked)}
        >
          <option value="" disabled>
            Select {label}
          </option>
          {field === 'course' ? (
            <>
              {options.length === 0 ? (
                <option value="" disabled>
                  No courses available
                </option>
              ) : (
                options.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))
              )}
            </>
          ) : (
            options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );

  const renderInput = (label, field, type = 'text', required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={label}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isProcessing}
      />
    </div>
  );

  const renderTextarea = (label, field) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        placeholder={label}
        value={formData[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isProcessing}
        rows="4"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Education</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <BsEye className="cursor-pointer hover:text-blue-600" />
          <BsLightbulb className="cursor-pointer hover:text-yellow-500" />
          <button
            onClick={handleAddNew}
            className="text-green-600 hover:text-green-700 cursor-pointer"
            title="Add New Education"
            aria-label="Add New Education"
          >
            <Plus className="text-xl" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isProcessing && (
          <div className="text-center text-gray-600">Loading...</div>
        )}
        {showForm ? (
          <div className="space-y-4">
            {renderSelect(
              'Qualification',
              'qualification',
              dropdownOptions.qualification,
              true
            )}
            {formData.qualification !== 'High School (10th)' &&
              formData.qualification !== 'Intermediate (12th)' && (
                <>
                  {renderSelect('Course', 'course', courseOptions, true)}
                  {renderSelect('Specialization', 'specialization', dropdownOptions.specialization)}
                </>
              )}
            {formData.qualification === 'Intermediate (12th)' &&
              renderSelect('Stream', 'stream', dropdownOptions.stream, true)}
            {renderSelect('Board', 'board', dropdownOptions.board, true)}
            {renderInput('College', 'college', 'text', true)}

            <div className="grid md:grid-cols-2 gap-4">
              {renderInput('Start Year', 'startYear', 'text', true)}
              {renderInput('End Year', 'endYear', 'text', true)}
            </div>

            {renderSelect('Course Type', 'courseType', dropdownOptions.courseType)}
            <div className="grid md:grid-cols-2 gap-4">
              {renderInput('Percentage', 'percentage')}
              {renderInput('CGPA', 'cgpa')}
            </div>

            {renderInput('Roll Number', 'rollNumber')}

            {formData.qualification !== 'High School (10th)' &&
              formData.qualification !== 'Intermediate (12th)' && (
                <>
                  {renderSelect('Are You A Lateral Entry Student?', 'lateralEntry', dropdownOptions.lateralEntry)}
                  {renderInput('Skills', 'skills')}
                  {renderTextarea('Description', 'description')}
                </>
              )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
              {(formData.fileUrl || selectedFile) ? (
                <div className="flex items-center justify-between border border-gray-300 rounded-md p-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <AiFillFilePdf className="text-gray-500 text-lg" aria-label="PDF file icon" />
                    {formData.fileUrl ? (
                      <a
                        href={formData.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 truncate max-w-[200px]"
                      >
                        {formData.fileUrl.split('/').pop()}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowDropdown(!showDropdown)}
                      aria-label="More options"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {formData.fileUrl && (
                          <a
                            href={formData.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Preview
                          </a>
                        )}
                        <label
                          htmlFor="educationFileUpload"
                          className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          Edit
                          <input
                            type="file"
                            id="educationFileUpload"
                            className="hidden"
                            accept=".doc,.docx,.pdf"
                            onChange={(e) => {
                              handleFileUpload(e);
                              setShowDropdown(false);
                            }}
                            disabled={isProcessing}
                          />
                        </label>
                        <button
                          onClick={() => {
                            if (editingIndex !== null || editingIntermediateIndex !== null || editingHighSchoolIndex !== null) {
                              const type = editingHighSchoolIndex !== null ? 'highschool' : editingIntermediateIndex !== null ? 'intermediate' : 'education';
                              const idx = editingHighSchoolIndex !== null ? editingHighSchoolIndex : editingIntermediateIndex !== null ? editingIntermediateIndex : editingIndex;
                              handleDeleteFile(idx, type);
                            } else {
                              handleRemoveFileFromForm();
                            }
                            setShowDropdown(false);
                          }}
                          className=" w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a2 2 0 00-2 2v1h8V5a2 2 0 00-2-2zm-3 4h6"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <label htmlFor="educationFileUpload" className="cursor-pointer block">
                  <div className="border-dashed border-2 border-gray-300 rounded-md px-4 py-6 text-center text-gray-600">
                    <span className="text-xl">+</span> Attachments
                  </div>
                  <input
                    type="file"
                    id="educationFileUpload"
                    className="hidden"
                    accept=".doc,.docx,.pdf"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </label>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                  disabled={isProcessing}
                  aria-label={editingIndex !== null || editingIntermediateIndex !== null || editingHighSchoolIndex !== null ? 'Update Education' : 'Save Education'}
                >
                  <span className="text-lg">✓</span> {editingIndex !== null || editingIntermediateIndex !== null || editingHighSchoolIndex !== null ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Saved Education</p>
            {(educationList.length === 0 && intermediateEducationList.length === 0 && highSchoolEducationList.length === 0) ? (
              <p className="text-gray-600">No education details saved yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {educationList.map((edu, index) => (
                  <div
                    key={`education-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college1?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{edu.college1}</p>
                          <p className="text-sm text-gray-600">{edu.assetname1}</p>
                          {edu.course1 && <p className="text-sm text-gray-600">{getCourseNameById(edu.course1)}</p>}
                          {edu.specialization1 && <p className="text-sm text-gray-600">{edu.specialization1}</p>}
                          {edu.areyoualateralentrystudent1 && <p className="text-sm text-gray-600">Lateral Entry: {edu.areyoualateralentrystudent1}</p>}
                          {edu.skills1 && <p className="text-sm text-gray-600">Skills: {edu.skills1}</p>}
                          {edu.description1 && <p className="text-sm text-gray-600">Description: {edu.description1}</p>}
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">{edu.stream1}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">{`${edu.startyear1} - ${edu.endyear1}`}</p>
                          </div>
                          {(edu.percentage1 || edu.cgpa1) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage1 && `Percentage: ${edu.percentage1}%`}
                              {edu.percentage1 && edu.cgpa1 && ' | '}
                              {edu.cgpa1 && `CGPA: ${edu.cgpa1}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files1 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf className="text-red-500 text-lg" aria-label="PDF file icon" />
                              <a
                                href={edu.files1}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files1.split('/').pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() => handleDeleteFile(index, 'education')}
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() => handleEditEducation(index, 'education')}
                          disabled={isProcessing}
                          aria-label="Edit Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() => handleRemoveEducation(index, 'education')}
                          disabled={isProcessing}
                          aria-label="Delete Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {intermediateEducationList.map((edu, index) => (
                  <div
                    key={`intermediate-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college2?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{edu.college2}</p>
                          <p className="text-sm text-gray-600">{edu.qualification2}</p>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-600">{edu.steam2}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">{`${edu.startyear2} - ${edu.endyear2}`}</p>
                          </div>
                          {(edu.percentage2 || edu.cgpa2) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage2 && `Percentage: ${edu.percentage2}%`}
                              {edu.percentage2 && edu.cgpa2 && ' | '}
                              {edu.cgpa2 && `CGPA: ${edu.cgpa2}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files2 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf className="text-red-500 text-lg" aria-label="PDF file icon" />
                              <a
                                href={edu.files2}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files2.split('/').pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() => handleDeleteFile(index, 'intermediate')}
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() => handleEditEducation(index, 'intermediate')}
                          disabled={isProcessing}
                          aria-label="Edit Intermediate Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() => handleRemoveEducation(index, 'intermediate')}
                          disabled={isProcessing}
                          aria-label="Delete Intermediate Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {highSchoolEducationList.map((edu, index) => (
                  <div
                    key={`highschool-${index}`}
                    className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {edu.college3?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{edu.college3}</p>
                          <p className="text-sm text-gray-600">{edu.qualification3}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <BiTime className="text-gray-500" />
                            <p className="text-sm text-gray-600">{`${edu.startyear3} - ${edu.endyear3}`}</p>
                          </div>
                          {(edu.percentage3 || edu.cgpa3) && (
                            <p className="text-sm text-gray-600 mt-1">
                              {edu.percentage3 && `Percentage: ${edu.percentage3}%`}
                              {edu.percentage3 && edu.cgpa3 && ' | '}
                              {edu.cgpa3 && `CGPA: ${edu.cgpa3}`}
                            </p>
                          )}
                          <span className="text-gray-600">Attachment</span>
                          {edu.files3 && (
                            <div className="flex items-center space-x-2 mt-1">
                              <AiFillFilePdf className="text-red-500 text-lg" aria-label="PDF file icon" />
                              <a
                                href={edu.files3}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 underline"
                              >
                                {edu.files3.split('/').pop()}
                              </a>
                              <MdDelete
                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                onClick={() => handleDeleteFile(index, 'highschool')}
                                title="Delete File"
                                aria-label="Delete File"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MdEdit
                          className="text-blue-600 text-xl cursor-pointer hover:text-blue-800"
                          onClick={() => handleEditEducation(index, 'highschool')}
                          disabled={isProcessing}
                          aria-label="Edit High School Education"
                        />
                        <MdDelete
                          className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                          onClick={() => handleRemoveEducation(index, 'highschool')}
                          disabled={isProcessing}
                          aria-label="Delete High School Education"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              {intermediateEducationList.length === 0 && (
                <button
                  onClick={handleAddIntermediate}
                  className="text-blue-600 hover:underline text-sm font-medium"
                  aria-label="Add Intermediate Education"
                >
                  Add Intermediate
                </button>
              )}
              {intermediateEducationList.length === 0 && highSchoolEducationList.length === 0 && <br />}
              {highSchoolEducationList.length === 0 && (
                <button
                  onClick={handleAddHighSchool}
                  className="text-blue-600 hover:underline text-sm font-medium"
                  aria-label="Add High School Education"
                >
                  Add High School
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;