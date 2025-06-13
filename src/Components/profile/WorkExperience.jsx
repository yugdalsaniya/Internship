import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { BiTime } from 'react-icons/bi';
import { FaCrosshairs } from 'react-icons/fa';
import { MdDelete, MdEdit } from 'react-icons/md';
import { AiFillFilePdf } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSectionData, mUpdate, uploadAndStoreFile } from '../../Utils/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const WorkExperience = () => {
    const [formData, setFormData] = useState({
        designation4: { id: '', name: '' },
        organisation4: '',
        employmenttype4: '',
        gotFromInternph4: false,
        startdate4: '',
        enddate4: '',
        currentlyworking4: false,
        location4: '',
        remote4: false,
        skills4: [],
        description4: '',
        files4: '',
    });
    const [designations, setDesignations] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [filteredInstituteNames, setFilteredNames] = useState([]);
    const [skillInput, setSkillInput] = useState('');
    const [instituteInput, setInstituteInput] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false);
    const [isInstitutesDropdownOpen, setIsInstitutesDropdownOpen] = useState(false);
    const [workExperienceList, setWorkExperienceList] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const skillInputRef = useRef(null);
    const skillDropdownRef = useRef(null);
    const instituteInputRef = useRef(null);
    const instituteDropdownRef = useRef(null);
    const locationInputRef = useRef(null);
    const autocompleteRef = useRef(null);
    const dropdownRef = useRef(null);

    // Sync instituteInput with formData.organisation4
    useEffect(() => {
        setInstituteInput(formData.organisation4);
    }, [formData.organisation4]);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userString = localStorage.getItem('user');
                if (!userString) {
                    toast.error('Please log in to view your details.', {
                        position: 'top-right',
                        autoClose: 5000,
                    });
                    return;
                }
                const user = JSON.parse(userString);
                const userId = user.userid;

                setIsProcessing(true);
                const response = await fetchSectionData({
                    dbName: 'internph',
                    collectionName: 'appuser',
                    query: { _id: userId },
                    projection: { 'sectionData.appuser.workexperience2': 1 },
                });

                const fetchedWorkExperience =
                    response && response[0] && response[0].sectionData?.appuser?.workexperience2
                        ? response[0].sectionData.appuser.workexperience2
                        : [];
                setWorkExperienceList(fetchedWorkExperience);
                setShowForm(fetchedWorkExperience.length === 0);
            } catch (err) {
                toast.error('Failed to load work experience data.', {
                    position: 'top-right',
                    autoClose: 5000,
                });
            } finally {
                setIsProcessing(false);
            }
        };

        fetchUserData();
    }, []);

    // Fetch designations
    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                const params = {
                    collectionName: 'designation',
                    projection: { 'sectionData.designation': 1, '_id': 1 },
                    cacheBust: new Date().getTime(),
                };
                const response = await fetchSectionData(params);
                const designationData = response.map(item => ({
                    id: item._id,
                    name: item.sectionData.designation.name,
                }));
                setDesignations(designationData);
                setError('');
            } catch (err) {
                console.error('Failed to fetch designations:', err);
                setError('Failed to load designations. Please try again later.');
                setTimeout(() => setError(''), 5000);
                setDesignations([]);
            }
        };
        fetchDesignations();
    }, []);

    // Fetch institutes
    useEffect(() => {
        const fetchInstitutes = async () => {
            try {
                const params = {
                    collectionName: 'institute',
                    projection: { 'sectionData.institute.institutionname': 1 },
                    cacheBust: new Date().getTime(),
                };
                const response = await fetchSectionData(params);
                const instituteNames = response
                    .filter(item => item.sectionData?.institute?.institutionname)
                    .map(item => item.sectionData.institute.institutionname);
                setInstitutes(instituteNames);
                setError('');
            } catch (err) {
                console.error('Failed to fetch institutes:', err);
                setError('Failed to load institutes. Please try again later.');
                setTimeout(() => setError(''), 5000);
                setInstitutes([]);
            }
        };
        fetchInstitutes();
    }, []);

    // Fetch skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const params = {
                    collectionName: 'skills',
                    projection: { 'sectionData.skills.name': 1, '_id': 1 },
                    cacheBust: new Date().getTime(),
                };
                const response = await fetchSectionData(params);
                const skillData = response.map(item => ({
                    id: item._id,
                    name: item.sectionData.skills.name,
                }));
                setAllSkills(skillData);
                setError('');
            } catch (err) {
                console.error('Failed to fetch skills:', err);
                setError('Failed to load skills. Please try again later.');
                setTimeout(() => setError(''), 5000);
                setAllSkills([]);
            }
        };
        fetchSkills();
    }, []);

    // Handle click outside for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                skillInputRef.current &&
                !skillInputRef.current.contains(event.target) &&
                skillDropdownRef.current &&
                !skillDropdownRef.current.contains(event.target)
            ) {
                setIsSkillsDropdownOpen(false);
            }
            if (
                instituteInputRef.current &&
                !instituteInputRef.current.contains(event.target) &&
                instituteDropdownRef.current &&
                !instituteDropdownRef.current.contains(event.target)
            ) {
                setIsInstitutesDropdownOpen(false);
            }
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Google Maps Autocomplete
    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            console.error('Google Maps API key is missing.');
            toast.error('Location suggestions unavailable: API key missing.', { autoClose: 5000 });
            setError('Location suggestions unavailable: API key missing.');
            setTimeout(() => setError(''), 5000);
            return;
        }

        const loadGoogleMapsScript = () => {
            return new Promise((resolve, reject) => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    resolve();
                    return;
                }
                const existingScript = document.querySelector(
                    `script[src*="maps.googleapis.com/maps/api/js"]`
                );
                if (existingScript) {
                    existingScript.addEventListener('load', resolve);
                    return;
                }
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.async = true;
                script.defer = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load Google Maps API'));
                document.head.appendChild(script);
            });
        };

        if (!showForm || !locationInputRef.current) {
            return;
        }

        loadGoogleMapsScript()
            .then(() => {
                if (!window.google?.maps?.places) {
                    console.error('Google Maps places library not loaded.');
                    toast.error('Location suggestions unavailable: Places library not loaded.', { autoClose: 5000 });
                    setError('Location suggestions unavailable: Places library not loaded.');
                    setTimeout(() => setError(''), 5000);
                    return;
                }
                
                autocompleteRef.current = new window.google.maps.places.Autocomplete(
                    locationInputRef.current,
                    {
                        types: ['(cities)'],
                        fields: ['formatted_address', 'name'],
                        componentRestrictions: { country: 'ph' }
                    }
                );
                autocompleteRef.current.addListener('place_changed', () => {
                    const place = autocompleteRef.current.getPlace();
                    if (!place.formatted_address && !place.name) {
                        console.warn('No valid place selected:', place);
                        return;
                    }
                    const location = place.formatted_address || place.name || '';
                    console.log('Place selected:', location);
                    setFormData((prev) => ({ ...prev, location4: location }));
                });
            })
            .catch((err) => {
                console.error('Error loading Google Maps:', err);
                toast.error('Location suggestions unavailable: Failed to load Google Maps API.', { autoClose: 5000 });
                setError('Location suggestions unavailable: Failed to load Google Maps API.');
                setTimeout(() => setError(''), 5000);
            });

        return () => {
            if (autocompleteRef.current && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [showForm, GOOGLE_MAPS_API_KEY]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const fetchFilteredSkills = useCallback(
        debounce((query) => {
            if (!query.trim()) {
                setFilteredSkills([]);
                setIsSkillsDropdownOpen(false);
                return;
            }
            const filtered = allSkills.filter(
                (skill) =>
                    skill.name.toLowerCase().includes(query.toLowerCase()) &&
                    !formData.skills4.some((s) => s.id === skill.id)
            );
            setFilteredSkills(filtered);
            setIsSkillsDropdownOpen(filtered.length > 0);
        }, 500),
        [allSkills, formData.skills4]
    );

    const fetchFilteredInstitutes = useCallback(
        debounce((query) => {
            if (!query.trim()) {
                setFilteredNames([]);
                setIsInstitutesDropdownOpen(false);
                return;
            }
            const filtered = institutes.filter((institute) =>
                institute.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredNames(filtered);
            setIsInstitutesDropdownOpen(filtered.length > 0);
        }, 500),
        [institutes]
    );

    const handleSkillInputChange = (value) => {
        setSkillInput(value);
        fetchFilteredSkills(value);
    };

    const handleInstituteInputChange = (value) => {
        setInstituteInput(value);
        fetchFilteredInstitutes(value);
    };

    const handleSkillSelect = (skill) => {
        setFormData({
            ...formData,
            skills4: [...formData.skills4, { id: skill.id, name: skill.name }],
        });
        setSkillInput('');
        setIsSkillsDropdownOpen(false);
    };

    const handleInstituteSelect = (institute) => {
        setFormData({ ...formData, organisation4: institute });
        setInstituteInput(institute);
        setIsInstitutesDropdownOpen(false);
    };

    const handleSkillRemove = (skillId) => {
        setFormData({
            ...formData,
            skills4: formData.skills4.filter((s) => s.id !== skillId),
        });
    };

    const handleDesignationSelect = (designation) => {
        setFormData({
            ...formData,
            designation4: { id: designation.id, name: designation.name },
        });
    };

    const handleChange = (field, value) => {
        if (field === 'remote4' && value) {
            setFormData({ ...formData, [field]: value, location4: '' });
        } else {
            setFormData({ ...formData, [field]: value });
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setFormData({ ...formData, files4: '' });
    };

    const handleRemoveFileFromForm = () => {
        setSelectedFile(null);
        setFormData({ ...formData, files4: '' });
    };

    const handleSave = async () => {
        if (isProcessing) return;

        const trimmedFormData = {
            ...formData,
            organisation4: formData.organisation4.trim(),
            employmenttype4: formData.employmenttype4.trim(),
        };

        const errors = [];
        if (!trimmedFormData.designation4.id) errors.push('Designation is required.');
        if (!trimmedFormData.organisation4) errors.push('Organisation is required.');
        if (!trimmedFormData.employmenttype4) errors.push('Employment Type is required.');
        if (!formData.startdate4) errors.push('Start Date is required.');
        if (!formData.remote4 && !formData.location4.trim()) errors.push('Location is required or mark as remote.');
        if (!formData.currentlyworking4 && !formData.enddate4) errors.push('End Date is required or mark as currently working.');

        if (errors.length > 0) {
            const errorMessage = errors.join(' ');
            setError(errorMessage);
            toast.error(errorMessage, { autoClose: 5000 });
            setTimeout(() => setError(''), 5000);
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            if (typeof window === 'undefined') {
                throw new Error('Browser environment required');
            }

            const userString = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (!userString || !accessToken) {
                throw new Error('Please log in to save your work experience.');
            }

            let userId;
            try {
                const user = JSON.parse(userString);
                userId = user.userid;
            } catch (parseError) {
                throw new Error('Invalid user data. Please log in again.');
            }

            const existingUser = await fetchSectionData({
                dbName: 'internph',
                collectionName: 'appuser',
                query: { _id: userId },
            });

            if (!existingUser || (Array.isArray(existingUser) && existingUser.length === 0)) {
                setError('User not found in database. Please sign up or contact support.');
                toast.error('User not found in database. Please sign up or contact support.');
                setTimeout(() => setError(''), 5000);
                setIsProcessing(false);
                return;
            }

            let fileUrl = formData.files4;
            if (selectedFile) {
                const uploadResponse = await uploadAndStoreFile({
                    appName: 'app8657281202648',
                    moduleName: 'appuser',
                    file: selectedFile,
                    userId,
                });

                fileUrl =
                    uploadResponse?.filePath ||
                    uploadResponse?.fileUrl ||
                    uploadResponse?.data?.fileUrl;
                if (!fileUrl) {
                    throw new Error('Failed to upload file: No file path returned in response.');
                }
            }

            const workExperienceEntry = {
                designation4: trimmedFormData.designation4.id,
                organisation4: trimmedFormData.organisation4,
                employmenttype4: trimmedFormData.employmenttype4,
                currentlyworking4: formData.currentlyworking4,
                startdate4: formData.startdate4,
                enddate4: formData.currentlyworking4 ? '' : formData.enddate4,
                remote4: formData.remote4,
                location4: formData.remote4 ? '' : formData.location4,
                skills4: formData.skills4.map((s) => s.id),
                description4: formData.description4,
                gotFromInternph4: formData.gotFromInternph4,
                files4: fileUrl,
            };

            let updatePayload;
            if (editingIndex !== null) {
                updatePayload = {
                    $set: {
                        [`sectionData.appuser.workexperience2.${editingIndex}`]: workExperienceEntry,
                        'sectionData.appuser.lastUpdated': new Date().toISOString(),
                    },
                };
                const updatedList = [...workExperienceList];
                updatedList[editingIndex] = workExperienceEntry;
                setWorkExperienceList(updatedList);
            } else {
                updatePayload = {
                    $push: { 'sectionData.appuser.workexperience2': workExperienceEntry },
                    $set: { 'sectionData.appuser.lastUpdated': new Date().toISOString() },
                };
                setWorkExperienceList([...workExperienceList, workExperienceEntry]);
            }

            const response = await mUpdate({
                appName: 'app8657281202648',
                dbName: 'internph',
                collectionName: 'appuser',
                query: { _id: userId },
                update: updatePayload,
                options: { upsert: false },
            });

            if (response && response.success) {
                if (response.matchedCount === 0) {
                    throw new Error('Failed to update work experience.');
                }
                toast.success(
                    editingIndex !== null
                        ? 'Work experience updated successfully!'
                        : 'Work experience saved successfully!',
                    { position: 'top-right', autoClose: 3000 }
                );
                setFormData({
                    designation4: { id: '', name: '' },
                    organisation4: '',
                    employmenttype4: '',
                    gotFromInternph4: false,
                    startdate4: '',
                    enddate4: '',
                    currentlyworking4: false,
                    location4: '',
                    remote4: false,
                    skills4: [],
                    description4: '',
                    files4: '',
                });
                setInstituteInput('');
                setSkillInput('');
                setSelectedFile(null);
                setEditingIndex(null);
                setShowForm(false);
            } else {
                throw new Error('Failed to update work experience in database.');
            }
        } catch (error) {
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = 'API endpoint not found. Please contact support.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.message.includes('User not found')) {
                errorMessage = 'User not found in database. Please sign up or contact support.';
            }
            setError(errorMessage);
            toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
            console.error('Error updating work experience:', error);
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleEdit = (index) => {
        const work = workExperienceList[index];
        const designation = designations.find(d => d.id === work.designation4) || { id: '', name: '' };
        setFormData({
            designation4: { id: designation.id, name: designation.name },
            organisation4: work.organisation4 || '',
            employmenttype4: work.employmenttype4 || '',
            gotFromInternph4: work.gotFromInternph4 || false,
            startdate4: work.startdate4 || '',
            enddate4: work.enddate4 || '',
            currentlyworking4: work.currentlyworking4 || false,
            location4: work.location4 || '',
            remote4: work.remote4 || false,
            skills4: work.skills4.map(skillId => {
                const skill = allSkills.find(s => s.id === skillId) || { id: skillId, name: 'Unknown Skill' };
                return { id: skill.id, name: skill.name };
            }),
            description4: work.description4 || '',
            files4: work.files4 || '',
        });
        setInstituteInput(work.organisation4 || '');
        setEditingIndex(index);
        setShowForm(true);
        setSelectedFile(null);
    };

    const handleRemove = async (index) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const userString = localStorage.getItem('user');
            if (!userString) {
                throw new Error('Please log in to remove work experience.');
            }
            const user = JSON.parse(userString);
            const userId = user.userid;

            const updatedList = [...workExperienceList];
            updatedList.splice(index, 1);

            const response = await mUpdate({
                appName: 'app8657281202648',
                dbName: 'internph',
                collectionName: 'appuser',
                query: { _id: userId },
                update: {
                    $set: { 'sectionData.appuser.workexperience2': updatedList },
                },
                options: { upsert: false },
            });

            if (response && response.success) {
                toast.success('Work experience removed successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                setWorkExperienceList(updatedList);
                setEditingIndex(null);
                setShowForm(updatedList.length === 0);
                setFormData({
                    designation4: { id: '', name: '' },
                    organisation4: '',
                    employmenttype4: '',
                    gotFromInternph4: false,
                    startdate4: '',
                    enddate4: '',
                    currentlyworking4: false,
                    location4: '',
                    remote4: false,
                    skills4: [],
                    description4: '',
                    files4: '',
                });
                setInstituteInput('');
                setSelectedFile(null);
            } else {
                throw new Error('Failed to remove work experience from database.');
            }
        } catch (error) {
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = 'API endpoint not found. Please contact support.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            }
            setError(errorMessage);
            toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteFile = async (index) => {
        if (isProcessing) return;

        try {
            setIsProcessing(true);
            const userString = localStorage.getItem('user');
            if (!userString) {
                throw new Error('Please log in to remove file.');
            }
            const user = JSON.parse(userString);
            const userId = user.userid;

            const updatedList = [...workExperienceList];
            updatedList[index] = { ...updatedList[index], files4: '' };

            const response = await mUpdate({
                appName: 'app8657281202648',
                dbName: 'internph',
                collectionName: 'appuser',
                query: { _id: userId },
                update: {
                    $set: { [`sectionData.appuser.workexperience2.${index}.files4`]: '' },
                },
                options: { upsert: false },
            });

            if (response && response.success) {
                toast.success('File removed successfully!', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                setWorkExperienceList(updatedList);
                if (editingIndex === index) {
                    setFormData({ ...formData, files4: '' });
                    setSelectedFile(null);
                }
            } else {
                throw new Error('Failed to remove file from database.');
            }
        } catch (error) {
            let errorMessage = error.message;
            if (error.response?.status === 404) {
                errorMessage = 'API endpoint not found. Please contact support.';
            } else if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.';
            }
            setError(errorMessage);
            toast.error(errorMessage, { position: 'top-right', autoClose: 5000 });
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddNew = () => {
        setShowForm(true);
        setFormData({
            designation4: { id: '', name: '' },
            organisation4: '',
            employmenttype4: '',
            gotFromInternph4: false,
            startdate4: '',
            enddate4: '',
            currentlyworking4: false,
            location4: '',
            remote4: false,
            skills4: [],
            description4: '',
            files4: '',
        });
        setInstituteInput('');
        setSkillInput('');
        setEditingIndex(null);
        setSelectedFile(null);
    };

    const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Freelance'];

    const getDesignationNameById = (id) => {
        const designation = designations.find(d => d.id === id || d.name === id);
        return designation ? designation.name : id || 'Unknown Designation';
    };

    const getSkillNameById = (id) => {
        const skill = allSkills.find(s => s.id === id);
        return skill ? skill.name : 'Unknown Skill';
    };

    const renderSelect = (label, field, options, required = false) => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </p>
            <div className="relative">
                <select
                    value={field === 'designation4' ? formData[field]?.name || '' : formData[field] || ''}
                    onChange={(e) => {
                        if (field === 'designation4') {
                            const selectedDesignation = options.find(d => d.name === e.target.value) || { id: '', name: '' };
                            handleDesignationSelect(selectedDesignation);
                        } else {
                            handleChange(field, e.target.value);
                        }
                    }}
                    className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    disabled={isProcessing}
                >
                    <option value="" aria-label={`Select ${label}`}>Select {label}</option>
                    {options.map((opt) => (
                        <option key={opt.id || opt} value={opt.name || opt}>
                            {opt.name || opt}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
        </div>
    );

    const renderInput = (label, field, type = 'text', required = false) => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </p>
            <input
                type={type}
                placeholder={label}
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
            />
        </div>
    );

    const renderInstituteInput = () => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
                Organisation <span className="text-red-500">*</span>
            </p>
            <div className="relative">
                <input
                    ref={instituteInputRef}
                    type="text"
                    placeholder="Search organisation..."
                    value={instituteInput}
                    onChange={(e) => handleInstituteInputChange(e.target.value)}
                    onFocus={() => instituteInput.trim() && filteredInstituteNames.length > 0 && setIsInstitutesDropdownOpen(true)}
                    className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                />
                {isInstitutesDropdownOpen && filteredInstituteNames.length > 0 && (
                    <div
                        ref={instituteDropdownRef}
                        className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                    >
                        {filteredInstituteNames.map((institute, index) => (
                            <button
                                key={index}
                                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                                onClick={() => handleInstituteSelect(institute)}
                                disabled={isProcessing}
                            >
                                {institute}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderSkillsInput = () => (
        <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Skills</p>
            <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills4.map((skill) => (
                    <button
                        key={skill.id}
                        onClick={() => handleSkillRemove(skill.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1"
                        disabled={isProcessing}
                    >
                        {skill.name}
                        <span className="text-sm">✕</span>
                    </button>
                ))}
            </div>
            <div className="relative">
                <input
                    ref={skillInputRef}
                    type="text"
                    placeholder="Search skills..."
                    value={skillInput}
                    onChange={(e) => handleSkillInputChange(e.target.value)}
                    onFocus={() => skillInput.trim() && filteredSkills.length > 0 && setIsSkillsDropdownOpen(true)}
                    className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isProcessing}
                />
                {isSkillsDropdownOpen && filteredSkills.length > 0 && (
                    <div
                        ref={skillDropdownRef}
                        className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
                    >
                        {filteredSkills.map((skill) => (
                            <button
                                key={skill.id}
                                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
                                onClick={() => handleSkillSelect(skill)}
                                disabled={isProcessing}
                            >
                                {skill.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderSkeletonCard = () => (
        <div
            className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm w-full animate-pulse"
            aria-hidden="true"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                    <div className="flex gap-2 mt-2">
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSkeletonForm = () => (
        <div className="space-y-4 animate-pulse">
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded w-full border-dashed"></div>
            </div>
            <div className="flex justify-end">
                <div className="h-10 bg-gray-200 rounded-full w-32"></div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-md">
            <style>{`
                @keyframes shimmer {
                    0% {
                        background-position: -468px 0;
                    }
                    100% {
                        background-position: 468px 0;
                    }
                }
                .animate-pulse {
                    animation: shimmer 1.5s infinite;
                    background: linear-gradient(
                        to right,
                        #f6f7f8 8%,
                        #edeef1 18%,
                        #f6f7f8 33%
                    );
                    background-size: 800px 104px;
                }
                .pac-container {
                    z-index: 10000 !important;
                }
            `}</style>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
            <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
                    <BiTime className="text-xl" />
                    <span>Work Experience</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600 text-xl">
                    <button
                        onClick={handleAddNew}
                        className="text-green-600 hover:text-green-700 cursor-pointer"
                        title="Add New Work Experience"
                        aria-label="Add New Work Experience"
                        disabled={isProcessing}
                    >
                        <Plus className="text-xl" />
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {error && (
                    <div className="text-red-500 text-sm mb-4">{error}</div>
                )}
                {isProcessing ? (
                    showForm ? (
                        renderSkeletonForm()
                    ) : (
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i}>{renderSkeletonCard()}</div>
                            ))}
                        </div>
                    )
                ) : showForm ? (
                    <div className="space-y-6">
                        <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                            <input
                                type="checkbox"
                                checked={formData.gotFromInternph4}
                                onChange={(e) => handleChange('gotFromInternph4', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                disabled={isProcessing}
                            />
                            Got this job from InternPH
                        </label>

                        {renderSelect('Designation', 'designation4', designations, true)}
                        {renderInstituteInput()}
                        {renderSelect('Employment Type', 'employmenttype4', employmentTypes, true)}

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Duration <span className="text-red-500">*</span>
                                </p>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.currentlyworking4}
                                        onChange={(e) => handleChange('currentlyworking4', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                    Currently working in this role
                                </label>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </p>
                                    <input
                                        type="date"
                                        value={formData.startdate4}
                                        onChange={(e) => handleChange('startdate4', e.target.value)}
                                        className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                        End Date {formData.currentlyworking4 ? '' : <span className="text-red-500">*</span>}
                                    </p>
                                    <input
                                        type="date"
                                        value={formData.enddate4}
                                        onChange={(e) => handleChange('enddate4', e.target.value)}
                                        disabled={formData.currentlyworking4 || isProcessing}
                                        className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm font-medium text-gray-700">
                                    Location {formData.remote4 ? '' : <span className="text-red-500">*</span>}
                                </p>
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.remote4}
                                        onChange={(e) => handleChange('remote4', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        disabled={isProcessing}
                                    />
                                    Remote
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.location4}
                                    onChange={(e) => handleChange('location4', e.target.value)}
                                    ref={locationInputRef}
                                    placeholder="Enter Location"
                                    className={`w-full border rounded-lg p-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.remote4 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    disabled={formData.remote4 || isProcessing}
                                />
                                <FaCrosshairs className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {renderSkillsInput()}

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                            <textarea
                                placeholder="Describe your role here..."
                                value={formData.description4}
                                onChange={(e) => handleChange('description4', e.target.value)}
                                rows={5}
                                className="w-full border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isProcessing}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Attachments
                            </label>
                            {formData.files4 || selectedFile ? (
                                <div className="flex items-center justify-between border border-gray-300 rounded-md p-2 mb-2">
                                    <div className="flex items-center space-x-2">
                                        <AiFillFilePdf
                                            className="text-gray-500 text-lg"
                                            aria-label="PDF file icon"
                                        />
                                        {formData.files4 ? (
                                            <a
                                                href={formData.files4}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-gray-600 truncate max-w-[200px]"
                                            >
                                                {formData.files4.split('/').pop()}
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
                                                {formData.files4 && (
                                                    <a
                                                        href={formData.files4}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
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
                                                    htmlFor="workFileUpload"
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
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
                                                        id="workFileUpload"
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
                                                        if (editingIndex !== null) {
                                                            handleDeleteFile(editingIndex);
                                                        } else {
                                                            handleRemoveFileFromForm();
                                                        }
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
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
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M5 7h14M5 7l1-4h6l1 4"
                                                        />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <label
                                    htmlFor="workFileId"
                                    className="cursor-pointer block"
                                >
                                    <div className="border-dashed border-2 border-gray-300 rounded-md px-4 py-6 text-center text-gray-600">
                                        <span className="text-xl">+</span> Attachments
                                    </div>
                                    <input
                                        type="file"
                                        id="workFileId"
                                        className="hidden"
                                        accept=".doc,.docx,.pdf"
                                        onChange={handleFileUpload}
                                        disabled={isProcessing}
                                    />
                                </label>
                            )}
                        </div>

                        <button
                            type="button"
                            className="flex items-center gap-2 border rounded-full px-4 py-2 text-blue-600 border-blue-600 hover:bg-blue-50 w-fit"
                            disabled={isProcessing}
                        >
                            <span aria-label="sparkle">🔮</span> Generate with AI
                        </button>

                        <div className="sticky bottom-0 bg-white border-t p-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSave}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                    disabled={isProcessing}
                                    aria-label={editingIndex !== null ? 'Update Work Experience' : 'Save Work Experience'}
                                >
                                    <span className="text-lg">✓</span> {editingIndex !== null ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            Saved Work Experience
                        </p>
                        {workExperienceList.length === 0 ? (
                            <p className="text-gray-600">No work experience details saved yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-4">
                                {workExperienceList.map((work, index) => (
                                    <div
                                        key={`work-${index}`}
                                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm w-full"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                                                    {work.organisation4?.charAt(0) || 'W'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {work.organisation4}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {getDesignationNameById(work.designation4)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {work.employmenttype4}
                                                    </p>
                                                    {work.gotFromInternph4 && (
                                                        <p className="text-sm text-gray-600">
                                                            Got this job from InternPH
                                                        </p>
                                                    )}
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <BiTime className="text-gray-500" />
                                                        <p className="text-sm text-gray-600">
                                                            {`${work.startdate4} - ${work.currentlyworking4 ? 'Present' : work.enddate4}`}
                                                        </p>
                                                    </div>
                                                    {work.location4 && (
                                                        <p className="text-sm text-gray-600">
                                                            Location: {work.location4}
                                                        </p>
                                                    )}
                                                    {work.remote4 && (
                                                        <p className="text-sm text-gray-600">
                                                            Remote
                                                        </p>
                                                    )}
                                                    {work.skills4.length > 0 && (
                                                        <p className="text-sm text-gray-600">
                                                            Skills: {work.skills4.map(id => getSkillNameById(id)).join(', ')}
                                                        </p>
                                                    )}
                                                    {work.description4 && (
                                                        <p className="text-sm text-gray-600">
                                                            Description: {work.description4}
                                                        </p>
                                                    )}
                                                    {work.files4 && (
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <AiFillFilePdf
                                                                className="text-red-500 text-lg"
                                                                aria-label="PDF file icon"
                                                            />
                                                            <a
                                                                href={work.files4}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-blue-600 underline"
                                                            >
                                                                {work.files4.split('/').pop()}
                                                            </a>
                                                            <MdDelete
                                                                className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                                                onClick={() => handleDeleteFile(index)}
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
                                                    onClick={() => handleEdit(index)}
                                                    disabled={isProcessing}
                                                    aria-label="Edit Work Experience"
                                                />
                                                <MdDelete
                                                    className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                                                    onClick={() => handleRemove(index)}
                                                    disabled={isProcessing}
                                                    aria-label="Delete Work Experience"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkExperience;