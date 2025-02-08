import React, { useState, createContext } from "react";
import Language from "../components/Form/Language";
import Meta from "../components/meta/Meta";
import DefaultResumeData from "../components/utility/DefaultResumeData";
import SocialMedia from "../components/Form/SocialMedia";
import WorkExperience from "../components/Form/WorkExperience";
import Skill from "../components/Form/Skill";
import PersonalInformation from "../components/Form/PersonalInformation";
import Summary from "../components/Form/Summary";
import Projects from "../components/Form/Projects";
import Education from "../components/Form/Education";
import Certification from "../components/Form/certification";


const ResumeContext = createContext(DefaultResumeData);

export default function Builder() {
  const [resumeData, setResumeData] = useState(DefaultResumeData);
  const [formClose] = useState(false);
  
  // NEW: Modal state for showing pop-up messages
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeData((prevData) => ({
          ...prevData,
          profilePicture: event.target.result || "",
        }));
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid file type");
    }
  };

  const handleChange = (e) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeData }),
      });
      const result = await response.json();
      if (result.success) {
        setModalMessage("Your resume has been generated and saved to Google Drive!");
        setModalOpen(true);
      } else {
        setModalMessage("There was an error generating your resume.");
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setModalMessage("An error occurred while generating your resume.");
      setModalOpen(true);
    }
  };

  return (
    <>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData,
          handleProfilePicture,
          handleChange,
        }}
      >
        <Meta
          title="AIESEC Resume Builder | Apply for your AIESEC exchange program"
          description="AIESEC Resume Builder helps EPs create a professional, AIESEC-optimized CV to boost their chances for an exchange program abroad."
          keywords="AIESEC, Exchange Program, EP, Resume builder, AIESEC CV, Global Talent, International Experience"
        />

        <div className="flex flex-col gap-6 md:flex-row justify-center items-start p-8 bg-gradient-to-r from-indigo-100 via-purple-200 to-pink-300 rounded-lg shadow-lg md:max-w-[60%] mx-auto md:h-screen">
          {!formClose && (
            <form
              onSubmit={handleSubmit}
              className="p-8 bg-white shadow-xl rounded-lg w-full space-y-6"
            >
              {/* Form Components */}
              <PersonalInformation />
              <SocialMedia />
              <Summary />
              <Education />
              <WorkExperience />
              <Projects />
              {resumeData.skills.map((skill, index) => (
                <Skill title={skill.title} key={index} />
              ))}
              <Language />
              <Certification />

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="w-full p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold shadow-md hover:from-indigo-600 hover:to-purple-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
                >
                  Submit 
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Inline Modal for Success/Error Messages */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Notification</h2>
              <p className="text-gray-700 mb-6">{modalMessage}</p>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors duration-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ResumeContext.Provider>
    </>
  );
}

export { ResumeContext };
