import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';

function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const hash = window.location.hash;
  const isQuestionsActive = hash === '#/questions' || hash === '#/';
  const isTagsActive = hash.startsWith('#/tags-page');
  const isAdminActive = hash.startsWith('#/administratorPage');

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
        if (response.data.user && response.data.user.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Failed to authenticate:', error);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="sidebar">
      <a href="#/questions">
        <button className={`sidebar-button ${isQuestionsActive ? 'active' : ''}`}>Questions</button>
      </a>
      <a href="#/tags-page">
        <button className={`sidebar-button ${isTagsActive ? 'active' : ''}`}>Tags</button>
      </a>
      {isAdmin && (
        <a href="#/administratorPage">
          <button className={`sidebar-button ${isAdminActive ? 'active' : ''}`}>Admin Page</button>
        </a>
      )}
    </div>
  );
}

export default Sidebar;
