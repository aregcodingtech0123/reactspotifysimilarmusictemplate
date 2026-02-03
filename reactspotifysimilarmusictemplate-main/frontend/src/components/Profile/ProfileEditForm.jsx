//the right-side of profile settings

import React, { useState } from 'react';

const ProfileEditForm = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('userInfo');
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    password: '',
    confirmPassword: '',
    email: user.email || '',
    confirmEmail: user.email || '',
    facebookUsername: user.facebookUsername || '',
    twitterUsername: user.twitterUsername || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'userInfo' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('userInfo')}
          >
            User Info
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('billing')}
          >
            Billing Information
          </button>
        </nav>
      </div>
      
      {activeTab === 'userInfo' && (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="firstName"
                  value=""
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="James"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="lastName"
                  value=""
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Allan"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="••••••••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="••••••••••••••"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value=""
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Email Address</label>
                <input
                  type="email"
                  name="confirmEmail"
                  //value={formData.confirmEmail}
                  value=""
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="email@gmail.com"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Social Media Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2">
                    <svg className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="facebookUsername"
                    value={formData.facebookUsername}
                    onChange={handleChange}
                    className="flex-1 p-2 border-0 focus:ring-0"
                    placeholder="Facebook Username"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5685 21H20.8131L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="xUsername"
                    value={formData.twitterUsername}
                    onChange={handleChange}
                    className="flex-1 p-2 border-0 focus:ring-0"
                    placeholder="X Username"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md"
          >
            Update Info
          </button>
        </form>
      )}
      
      {activeTab === 'billing' && (
        <div className="py-4">
          <h3 className="text-lg font-medium mb-4">Billing Information</h3>
          {/* Billing information form would go here */}
          <p className="text-gray-500">Billing information section content would appear here.</p>
        </div>
      )}
    </div>
  );
};
export default ProfileEditForm

