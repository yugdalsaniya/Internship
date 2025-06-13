
import { useState, useEffect, useRef } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaCheckCircle, FaEye, FaRegLightbulb } from 'react-icons/fa';
import { fetchSectionData, mUpdate } from '../../Utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Skills() {
  const [skillsText, setSkillsText] = useState('');
  const [allSkills, setAllSkills] = useState([]); // For suggestions (showinsuggestions: true)
  const [allSearchableSkills, setAllSearchableSkills] = useState([]); // For search dropdown (all skills)
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [isFirstSaveSuccessful, setIsFirstSaveSuccessful] = useState(false); // State for first successful save
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Retrieve userId from localStorage
  const userString = localStorage.getItem('user');
  let userId;
  if (!userString) {
    toast.error('Please log in to view your details.', { autoClose: 5000 });
    userId = null;
  } else {
    try {
      const user = JSON.parse(userString);
      userId = user.userid;
    } catch (parseError) {
      toast.error('Invalid user data. Please log in again.', { autoClose: 5000 });
      userId = null;
    }
  }

  // Fetch skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'skills',
          projection: { 'sectionData.skills': 1, '_id': 1 },
        });

        // All skills for search dropdown
        const searchableSkills = response.map(item => ({
          id: item._id,
          name: item.sectionData.skills.name,
        }));
        setAllSearchableSkills(searchableSkills);

        // Filtered skills for suggestions
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

  // Fetch user's saved skills
  useEffect(() => {
    if (!userId) return;

    const fetchUserSkills = async () => {
      try {
        setLoading(true);
        const response = await fetchSectionData({
          dbName: 'internph',
          collectionName: 'appuser',
          query: { _id: userId },
          projection: { 'sectionData.appuser.skills': 1 }
        });

        if (response && response[0]?.sectionData?.appuser?.skills) {
          setSelectedSkillIds(response[0].sectionData.appuser.skills);
          if (response[0].sectionData.appuser.skills.length > 0) {
            setIsFirstSaveSuccessful(true);
            console.log('Existing skills found, setting isFirstSaveSuccessful to true');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load saved skills:', err);
        toast.error('Failed to load saved skills: ' + err.message, { autoClose: 5000 });
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, [userId]);

  // Handle clicks outside textarea to hide dropdown
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

  // Filter skills based on textarea input for search dropdown
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

  // Compute suggestions to display (up to 10, only showinsuggestions: true)
  const getSuggestions = () => {
    const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id));
    const startIndex = currentPage * 10;
    return availableSkills.slice(startIndex, startIndex + 10);
  };

  const handleSkillClick = (skillId, skillName) => {
    if (selectedSkillIds.includes(skillId)) {
      // Deselect skill: remove from selectedSkillIds
      setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
      // Adjust currentPage if necessary to ensure suggestions are populated
      const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id) || skill.id === skillId);
      const maxPage = Math.ceil(availableSkills.length / 10) - 1;
      if (currentPage > maxPage) {
        setCurrentPage(maxPage >= 0 ? maxPage : 0);
      }
    } else {
      // Select skill: add to selectedSkillIds
      setSelectedSkillIds([...selectedSkillIds, skillId]);
      // Move to next page if current page is empty
      const availableSkills = allSkills.filter(skill => !selectedSkillIds.includes(skill.id) && skill.id !== skillId);
      const currentSuggestions = availableSkills.slice(currentPage * 10, currentPage * 10 + 10);
      if (currentSuggestions.length === 0 && availableSkills.length > 0) {
        setCurrentPage(prev => prev + 1);
      }
      // Clear textarea and hide dropdown if selected from dropdown
      if (showDropdown) {
        setSkillsText('');
        setShowDropdown(false);
      }
    }
  };

  const handleSave = async () => {
    if (!userId) {
      toast.error('Please log in to save skills.', { autoClose: 5000 });
      return;
    }

    if (selectedSkillIds.length === 0) {
      toast.error('Please select at least one skill.', { autoClose: 5000 });
      return;
    }

    try {
      setLoading(true);
      const response = await mUpdate({
        appName: 'app8657281202648',
        collectionName: 'appuser',
        query: { _id: userId },
        update: { $set: { 'sectionData.appuser.skills': selectedSkillIds } },
        options: { upsert: false, writeConcern: { w: 'majority' } },
      });

      console.log('mUpdate response for skills:', response);

      // Check for success using multiple possible response properties
      if (
        response &&
        (response.success ||
          response.modifiedCount > 0 ||
          response.matchedCount > 0)
      ) {
        if (response.matchedCount === 0) {
          throw new Error('Failed to update user data: User not found.');
        }
        if (response.upsertedId) {
          throw new Error('Unexpected error: New user created instead of updating.');
        }
        toast.success('Skills saved successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        if (!isFirstSaveSuccessful) {
          setIsFirstSaveSuccessful(true);
          console.log('Setting isFirstSaveSuccessful to true');
        }
      } else {
        throw new Error('Failed to save skills to database.');
      }
    } catch (err) {
      console.error('Failed to save skills:', err.response?.data || err.message);
      let errorMessage = err.message;
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      }
      toast.error(errorMessage || 'Failed to save skills. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('Rendering with isFirstSaveSuccessful:', isFirstSaveSuccessful);

  return (
    <div className="bg-white rounded-xl shadow-md">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />

      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          {isFirstSaveSuccessful ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <BiTime className="text-xl" />
          )}
          <span>Skills</span>
        </div>
        {/* <div className="flex items-center gap-4 text-gray-600 text-xl">
          <FaEye className="cursor-pointer hover:text-blue-600" />
          <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div> */}
      </div>

      <div className="p-6 space-y-6">
        <div className="mb-4">
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
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full flex items-center gap-1"
                >
                  {skill.name}
                  <span className="text-sm">✕</span>
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
                  className="px-3 py-1 border border-dashed rounded-full transition text-gray-600 hover:bg-gray-100"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full border rounded-lg p-2 resize-none"
              rows="1"
              placeholder="List your skills here, showcasing what you excel at."
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
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
                    className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition"
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
