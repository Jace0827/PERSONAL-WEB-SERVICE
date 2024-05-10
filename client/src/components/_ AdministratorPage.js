import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';

const UserProfileItem = ({ user }) => {
    const navigateToUserProfile = () => {
        window.location.hash = `#/admin-profile/${user._id}`;
    };

    return (
        <div className="question-content">
            <div className="bottom-liner" onClick={navigateToUserProfile} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <span><b>User Name:</b> {user.username}</span> <span><b>ID:</b> {user._id}</span>
            </div>
        </div>

    );
};

const UserProfileList = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const { data } = await axios.get('http://localhost:8000/allUsers', { withCredentials: true });
                setAllUsers(data);
                setError('');
            } catch (error) {
                console.error("Error fetching users:", error);
                setError("Failed to load users.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) {
        return <p>Loading users...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {allUsers.length > 0 ? (
                allUsers.map(user => <UserProfileItem key={user._id} user={user} />)
            ) : (
                <p>No users found.</p>
            )}
        </div>
    );
};


const AdministratorPage = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const authenticateUser = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
                setUser(response.data.user);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to authenticate:', error);
                setIsLoading(false);
            }
        };

        authenticateUser();
    }, []);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <div className="questions-header" style={{ marginBottom: '10px' }}>
                        <h2>Admin Page</h2>
                    </div>
                    <div className="top-liner"></div>
                    {user.isAdmin ? <UserProfileList /> : <p>You are not the admin user</p>}
                </div>


            </div>
        </div>
    );
};

export default AdministratorPage;
