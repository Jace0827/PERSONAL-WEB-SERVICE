import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import Header from './Header';
import Sidebar from './Sidebar';

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const authResponse = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
        setIsLoggedIn(authResponse.data.isLoggedIn);
        if (authResponse.data.isLoggedIn && authResponse.data.user) {
          setUserDetails(authResponse.data.user);
        } else {
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUserDetails(null);
      }
    };

    checkLoginStatus();
  }, []);

  if (!userDetails) {
    return (
      <div className="app-container">
        <Header />
        <div className="main-body">
          <Sidebar />
          <div className="content">
            <h2>Profile</h2>
            <p>User details are not available. Please login.</p>
          </div>
        </div>
      </div>
    );
  }

  const navigateToUserQuestions = () => {
    window.location.hash = '#/my-questions';
  };

  const navigateToUserAnswers = () => {
    window.location.hash = '#/my-answers';
  };

  const navigateToUserTags = () => {
    window.location.hash = '#/my-tags';
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <h2>Profile</h2>
          <p>Member since: {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'Unknown'}</p>
          <p>Reputation: {userDetails.reputation || 0}</p>
          <button onClick={navigateToUserQuestions} className="manage-questions-button">Manage My Questions</button>
          <button onClick={navigateToUserAnswers} className="manage-answers-button">Manage My Answers</button>
          <button onClick={navigateToUserTags} className="manage-tags-button">Manage My Tags</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
