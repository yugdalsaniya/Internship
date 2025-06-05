import { useState } from 'react';
import { BiTime } from 'react-icons/bi';
import { FaEye, FaRegLightbulb } from 'react-icons/fa';
import CertificatesForm from './certificates-form/CertificatesForm';
import ProjectsForm from './certificates-form/ProjectsForm';
import AchievementsForm from './certificates-form/AchievementsForm';
import ResponsibilitiesForm from './certificates-form/ResponsibilitiesForm';

function Accomplishments() {
  const[selected,setSelected] =useState(null)

  const handleClick = (type) =>{
    setSelected(type)
  }
  const renderFormComponent = ()=>{
    switch(selected){
       case 'certificates':
        return <CertificatesForm onBack={()=>setSelected(null)}/>
      case 'project':
        return <ProjectsForm  onBack={()=>setSelected(null)}/>
       case 'achievements':
        return <AchievementsForm onBack={() => setSelected(null)} />;
      case 'responsibilities':
        return <ResponsibilitiesForm onBack={() => setSelected(null)} />;
      default:
        return null;
    }
  }
const Main = ()=>(
<div className="bg-white rounded-xl shadow-md">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-4 shadow-sm flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-2 text-gray-700 text-lg font-medium">
          <BiTime className="text-xl" />
          <span>Accomplishments & Initiatives</span>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-xl">
          <FaEye className="cursor-pointer hover:text-blue-600" />
          <FaRegLightbulb className="cursor-pointer hover:text-yellow-500" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            Accomplishments & Initiatives
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div onClick={() => handleClick('certificates')} className="bg-purple-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-purple-100">
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span>🎖️</span>
              </div>
              <p className="font-semibold text-gray-700">Add Certificates</p>
              <p className="text-sm text-gray-600">
                Boost your profile with a certificate to impress employers
              </p>
            </div>
              <div  onClick={() => handleClick('project')} className="bg-blue-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-blue-100">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span>📜</span>
                </div>
                <p className="font-semibold text-gray-700">Add Projects</p>
                <p className="text-sm text-gray-600">
                  Boost your profile with a project to impress employers
                </p>
              </div>
            <div  onClick={() => handleClick('achievements')} className="bg-yellow-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-yellow-100">
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span>🏆</span>
              </div>
              <p className="font-semibold text-gray-700">Add Achievements</p>
              <p className="text-sm text-gray-600">
                Boost your profile with an achievement to impress employers
              </p>
            </div>
            <div  onClick={() => handleClick('responsibilities')} className="bg-green-50 p-4 rounded-lg text-center cursor-pointer transition-transform transform hover:scale-105 hover:shadow-md hover:bg-green-100">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span>🌱</span>
              </div>
              <p className="font-semibold text-gray-700">Add Responsibility</p>
              <p className="text-sm text-gray-600">
                Boost your profile with a responsibility to impress employers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="flex justify-end">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition"
          >
            <span className="text-lg">✓</span> Save
          </button>
        </div>
      </div>
    </div>
)
    
        //  {selected === 'certificates' && <CertificatesForm />}
    return (
    <div className="bg-white rounded-xl shadow-md">
      {selected === null ? (
        <>
       {Main()}
        </>
      ) : (
       renderFormComponent()

      )}
    </div>
  );
}

export default Accomplishments;