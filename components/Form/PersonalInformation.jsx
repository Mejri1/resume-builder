import React, { useContext } from "react";
import { ResumeContext } from "../../pages/builder";

const PersonalInformation = () => {
  const { resumeData, handleProfilePicture, handleChange } = useContext(ResumeContext);

  return (
    <div className="flex-col-gap-2">
      <h2 className="input-title">Personal Information</h2>
      <div className="grid-4">
        <input
          type="text"
          placeholder="Full Name"
          name="name"
          className="pi mb-4"
          value={resumeData.name}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Job Title"
          name="position"
          className="pi mb-4"
          value={resumeData.position}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Contact Information"
          name="contactInformation"
          className="pi mb-4"
          value={resumeData.contactInformation}
          onChange={handleChange}
          minLength="10"
          maxLength="15"
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          className="pi mb-4"
          value={resumeData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          className="pi mb-4"
          value={resumeData.address}
          onChange={handleChange}
        />
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          className="profileInput mb-4"
          onChange={handleProfilePicture}
          placeholder="Profile Picture"
        />
      </div>
    </div>
  );
};

export default PersonalInformation;
