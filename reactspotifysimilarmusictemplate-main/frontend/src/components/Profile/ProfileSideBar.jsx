import React from 'react';

const ProfileSidebar = ({ user }) => {
  return (
    <div className="bg-white rounded-lg p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold">{user.fullName}</h2>
      
      
      <div className="mb-4 relative">
        <img 
          src={user.profileImage || "maleusericon.jpeg"} //C:\Users\Admin\Desktop\bitirmeprojesionhali3 - Kopya - Kopya\kodlar3\public\assets\maleusericon.jpeg
          
          alt={user.fullName} 
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
        />
      </div>
      
      <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md mb-4 w-full">
        Upload New Photo
      </button>
      
      <div className="bg-blue-50 p-4 rounded-md text-sm text-center text-gray-600 mb-4 w-full">
        Upload a new profile photo. Larger image will be resized automatically.
        <br />
        Maximum upload size is 1 MB
      </div>
      
      <div className="text-sm text-gray-500">
        Member Since: {user.memberSince}
      </div>
    </div>
  );
};
export default ProfileSidebar