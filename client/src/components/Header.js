import React, { useState, useEffect } from 'react';
import '../stylesheets/index.css';

function Header() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/search\?q=([^&]+)/);
    const searchQuery = match ? decodeURIComponent(match[1]) : "";
    setSearchTerm(searchQuery);
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const userSessionCookie = document.cookie.split('; ').find(row => row.startsWith('userAuthSession='));
    setIsLoggedIn(!!userSessionCookie);
  };

  const handleLogout = () => {
    document.cookie = "userAuthSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.hash = '#/questions';
    window.location.reload();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && searchTerm) {
      window.location.hash = `#/search?q=${encodeURIComponent(searchTerm)}`;
      console.log('You have pressed enter');
    }
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    console.log('You have changed a text');
  };

  return (
    <>
      <header className="app-header">
        <div className="auth-buttons-container">
          {isLoggedIn ? (
            <>
            <div className="sorting-buttons">
              <button onClick={handleLogout}>Log Out</button>
              <button onClick={() => window.location.href = '#/profile'}>Profile</button>
            </div>
            </>
          ) : (
            <>
            <div className="sorting-buttons">
              <button onClick={() => window.location.href = '#/login'}>Log In</button>
              <button onClick={() => window.location.href = '#/signup'}>Sign Up</button>
            </div>
            </>
          )}
        </div>
        <h1>PERSONAL WEB SERVICE</h1>
        <input 
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
      </header>
    </>
  );
}

export default Header;
