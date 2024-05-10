import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';

const AdminUserProfile = ({ userId }) => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/user/${userId}`, { withCredentials: true });
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
                setError("Failed to load user details.");
                setUserDetails(null);
            }
        };

        fetchUserDetails();
    }, [userId]);

    if (error) {
        return (
            <div className="app-container">
                <Header />
                <div className="main-body">
                    <Sidebar />
                    <div className="content">
                        <h2>Error</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="app-container">
                <Header />
                <div className="main-body">
                    <Sidebar />
                    <div className="content">
                        <h2>User Profile</h2>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    const navigateToUserQuestions = () => {
        window.location.hash = `#/user-questions/${userId}`;
    };

    const navigateToUserAnswers = () => {
        window.location.hash = `#/user-answers/${userId}`;
    };

    const navigateToUserTags = () => {
        window.location.hash = `#/user-tags/${userId}`;
    };

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <h2>User Profile</h2>
                    <p><b>User ID:</b> {userDetails._id}</p>
                    <p><b>Username:</b> {userDetails.username}</p>
                    <p><b>Email:</b> {userDetails.email}</p>
                    <p><b>Reputation:</b> {userDetails.reputation}</p>
                    <p><b>Joined:</b> {new Date(userDetails.createdAt).toLocaleDateString()}</p>
                    <button onClick={() => window.location.hash = `#/user-questions/${userDetails._id}`} className="manage-questions-button">Manage Questions</button>
                    <button onClick={() => window.location.hash = `#/user-answers/${userDetails._id}`} className="manage-answers-button">Manage Answers</button>
                    <button onClick={() => window.location.hash = `#/user-tags/${userDetails._id}`} className="manage-tags-button">Manage Tags</button>
                </div>
            </div>
        </div>
    );
};

export default AdminUserProfile;

