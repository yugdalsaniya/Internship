import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle, FaEye, FaRegLightbulb } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from '../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Skills({ userData, updateCompletionStatus }) {
  const [skillsText, setSkillsText] = useState('');
  const [allSkills, setAllSkills] = useState([]);
  const [allSearchableSkills, setAllSearchableSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await fetchSectionData({
          appName: 'app8657281202648',
          collectionName: 'skills',
          projection: { 'sectionData.skills': 1, '_id': 1 },
        });

        const searchableSkills = response.map(item => ({
          id: item._id,
          name: item.sectionData.skills.name,
        }));
        setAllSearchableSkills(searchableSkills);

        const suggestionSkills = response
          .filter(item => item.sectionData.skills.showinsuggestions === true)
          .map(item => ({
            id: item._id,
            name: item.sectionData.skills.name,
          }));
        setAllSkills(suggestionSkills);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load skills:', err);
        toast.error('Failed to load skills: ' + err.message, { autoClose: 5000 });
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    if (!userData.userid) {
      console.error('User ID not found in userData:', userData);
      toast.error('Please log in to view your skills.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    const fetchUserSkills = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Authentication token missing.');
        }

        const fetchWithRetry = async (fn, retries = 3, delay = 1000) => {
          for (let i = 0; i < retries; i++) {
            try {
              return await fn();
            } catch (err) {
              if (i === retries - 1) throw err;
              console.warn(`Retry ${i + 1} for fetchSectionData:`, err.message);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        };

        const response = await fetchWithRetry(() =>
          fetchSectionData({
            appName: 'app8657281202648',
            collectionName: 'appuser',
            query: { _id: userData.userid },
            projection: { 'sectionData.appuser.skills': 1 },
          })
        );

        const apiData = response[0];
        if (!apiData) {
          console.warn('No user data returned from API, setting default skills state');
          setSelectedSkillIds([]);
          setIsCompleted(false);
          if (updateCompletionStatus) {
            updateCompletionStatus('Skills', false);
          }
          return;
        }

        const existingSkills = apiData?.sectionData?.appuser?.skills || [];
        setSelectedSkillIds(existingSkills);
        setIsCompleted(!!existingSkills.length);
        if (updateCompletionStatus) {
          updateCompletionStatus('Skills', !!existingSkills.length);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load saved skills:', err);
        let errorMessage = 'Failed to load saved skills. Please try again.';
        if (err.response?.status === 404) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          navigate('/login');
        }
        toast.error(errorMessage, { autoClose: 5000 });
        setIsCompleted(false);
        if (updateCompletionStatus) {
          updateCompletionStatus('Skills', false);
        }
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [userData.userid, updateCompletionStatus, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target) &&
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

  useEffect(() => {
    if (skillsText.trim() === '') {
      setFilteredSkills([]);
      setShowDropdown(false);
      return;
    }

    const filtered = allSearchableSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(skillsText.toLowerCase()) &&
        !selectedSkillIds.includes(skill.id)
    );
    setFilteredSkills(filtered);
    setShowDropdown(filtered.length > 0);
  }, [skillsText, allSearchableSkills, selectedSkillIds]);

  const getSuggestions = () => {
    const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id));
    const startIndex = currentPage * 10;
    return availableSkills.slice(startIndex, startIndex + 10);
  };

  const handleSkillClick = (skillId, skillName) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
      const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id) || skill.id === skillId);
      const maxPage = Math.ceil(availableSkills.length / 10) - 1;
      if (currentPage > maxPage) {
        setCurrentPage(maxPage >= 0 ? maxPage : 0);
      }
    } else {
      const newSelectedSkillIds = [...selectedSkillIds, skillId];
      setSelectedSkillIds(newSelectedSkillIds);
      const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id) && skill.id !== skillId);
      const currentSuggestions = availableSkills.slice(currentPage * 10, currentPage * 10 + 10);
      if (currentSuggestions.length === 0 && availableSkills.length > 0) {
        setCurrentPage(prev => prev + 1);
      }
      if (showDropdown && skillName.toLowerCase() === skillsText.toLowerCase().trim()) {
        setSkillsText('');
        setShowDropdown(false);
      }
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setSkillsText(newText);
  };

  const handleSave = async () => {
    if (!userData.userid) {
      toast.error('Please log in to save skills.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    if (selectedSkillIds.length === 0) {
      toast.error('Please select at least one skill from suggestions or dropdown.', { autoClose: 5000 });
      return;
    }

    if (skillsText.trim() && !selectedSkillIds.includes(allSearchableSkills.find(skill => skill.name.toLowerCase() === skillsText.toLowerCase().trim())?.id)) {
      toast.error('Please choose valid skills from suggestions or dropdown.', { autoClose: 5000 });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token missing.');
      }

      const updateResponse = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userData.userid },
        update: { $set: { 'sectionData.appuser.skills': selectedSkillIds } },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });


      if (
        updateResponse &&
        (updateResponse.success ||
          updateResponse.modifiedCount > 0 ||
          updateResponse.matchedCount > 0)
      ) {
        if (updateResponse.matchedCount === 0) {
          throw new Error('Failed to update user data: User not found.');
        }
        if (updateResponse.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Skills saved successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsCompleted(true);
        if (updateCompletionStatus) {
          updateCompletionStatus('Skills', true);
        }
      } else {
        throw new Error('Failed to save skills to database.');
      }
    } catch (err) {
      console.error('Error saving skills:', err.response?.data || err.message);
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        navigate('/login');
      }
      toast.error(errorMessage || 'Failed to save skills. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
      setIsCompleted(false);
      if (updateCompletionStatus) {
        updateCompletionStatus('Skills', false);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer />
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isCompleted ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-gray-400 text-xl" />
          )}
          <span>Skills</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Skills<span className="text-red-500 ml-1">*</span>
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkillIds.map((skillId) => {
              const skill = allSearchableSkills.find(s => s.id === skillId);
              return skill ? (
                <button
                  key={skillId}
                  onClick={() => handleSkillClick(skillId, skill.name)}
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1 text-sm"
                >
                  {skill.name}
                  <span>✕</span>
                </button>
              ) : null;
            })}
          </div>

          <p className="text-gray-500 text-sm mb-2">Suggestions</p>
          {loading ? (
            <p className="text-gray-500">Loading skills...</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {getSuggestions().map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => handleSkillClick(skill.id, skill.name)}
                  className="px-3 py-1 border border-dashed rounded-full text-gray-600 hover:bg-gray-100 transition text-sm"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full border rounded-lg p-2 resize-none text-sm"
              rows="1"
              placeholder="Search for skills to add..."
              value={skillsText}
              onChange={handleTextChange}
              onFocus={() => skillsText.trim() && filteredSkills.length > 0 && setShowDropdown(true)}
            />
            {showDropdown && filteredSkills.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
              >
                {filteredSkills.map((skill) => (
                  <button
                    key={skill.id}
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    onClick={() => handleSkillClick(skill.id, skill.name)}
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="text-lg">⏳</span>
            ) : (
              <span className="text-lg">✓</span>
            )}
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Skills;