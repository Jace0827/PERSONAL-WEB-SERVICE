import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import Header from './Header';
import Sidebar from './Sidebar';

const SignUpPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');


    const handleNameChange = (event, setter) => {
        const value = event.target.value;
        if (value.includes(' ')) {
            alert('Spaces are not allowed.');
            setter(value.trim());
        } else {
            setter(value);
        }
    };


    const handleSignUp = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }


        const emailLocalPart = email.substring(0, email.indexOf('@')).toLowerCase();
        const lowerPassword = password.toLowerCase();
        const firstNameLower = firstName.toLowerCase();
        const lastNameLower = lastName.toLowerCase();

        // Check if the password contains part of the user's email local part or name
        if (lowerPassword.includes(emailLocalPart) || lowerPassword.includes(firstNameLower) || lowerPassword.includes(lastNameLower)) {
            alert('Password must not contain your email local part, first name, or last name.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/signup', {
                firstName,
                lastName,
                password, 
                email
            });
            console.log('Account created successfully:', response.data);
            alert('Account created successfully!');
            // Redirect or manage login state as needed
            window.location.hash = '#/login';  // Redirect to login page after successful signup
        } catch (error) {
            console.error("Error during account creation:", error.response?.data);
            alert(error.response?.data?.message || 'Failed to create account. Please check your email and try again.');
        }
    };

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <form onSubmit={handleSignUp} className="signup-form">
                        <h2>Create Account</h2>
                        <div className="form-table">
                            <table>
                                <tbody>
                                    <tr>
                                        <td><label htmlFor="firstName">First Name*:</label></td>
                                        <td>
                                            <input
                                                type="text"
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => handleNameChange(e, setFirstName)}
                                                placeholder="Spaces are not allowed"
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label htmlFor="lastName">Last Name*:</label></td>
                                        <td>
                                            <input
                                                type="text"
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => handleNameChange(e, setLastName)}
                                                placeholder="Spaces are not allowed"
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label htmlFor="password">Password*:</label></td>
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
                                    <tr>
                                        <td><label htmlFor="confirmPassword">Confirm Password*:</label></td>
                                        <td>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label htmlFor="email">Email*:</label></td>
                                        <td>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" className="signup-button">Sign Up</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
