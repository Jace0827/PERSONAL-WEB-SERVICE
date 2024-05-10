import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import Header from './Header';
import Sidebar from './Sidebar';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', {
        email,
        password
      }, {
        withCredentials: true  // !!!we need this because we are sending requests from a different origin (localhost:3000) to localhost:8000 (CORS) and we want to send cookies!!!
      });
      window.location.hash = '#/questions';  // Redirect to a different part of your application
    } catch (error) {
      console.error("Error during login:", error.response.data);
      alert('Failed to login. Please check your username and password.');
    }
  };
  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            <div className="form-table">
              <table>
                <tbody>
                  <tr>
                    <td><label htmlFor="email">Email:</label></td>
                    <td>
                      <input
                        type="text"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <button type="submit" className="login-button">Login</button>
                    </td>
                  </tr>
                  <tr>
                    <td><label htmlFor="password">Password:</label></td>
                    <td>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {error && <div className="error-message">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
