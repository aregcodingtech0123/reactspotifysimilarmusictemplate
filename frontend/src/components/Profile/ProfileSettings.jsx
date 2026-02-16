import React from 'react';
import ProfileSidebar from './ProfileSideBar';
import ProfileEditForm from './ProfileEditForm';

const ProfileSettings = () => {
  // Sample user data - replace with actual user data or API call
  const user = {
    fullName: 'Jamed Allan',
    username: 'james',
    firstName: 'James',
    lastName: 'Allan',
    email: 'demomail@gmail.com',
    profileImage: 'maleusericon.jpeg', 
    memberSince: '29 September 2019',
    facebookUsername: '',
    twitterUsername: ''
  };

  const handleUpdateProfile = (formData) => {
    console.log('Profile update:', formData);
    // Here you would implement the API call to update the user profile
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileSidebar user={user} />
          </div>
          <div className="md:col-span-2">
            <ProfileEditForm user={user} onUpdate={handleUpdateProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;