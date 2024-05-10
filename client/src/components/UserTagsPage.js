import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import '../stylesheets/index.css';

const handleEditTag = (tag) => {
    window.location.hash = `#/edit-tag/${tag._id}`;
};

const TagItem = ({ tag, onDelete, onEdit }) => {
    const navigateToTag = () => {
        window.location.hash = `#/tags/${tag.name}`;
    };

    return (
        <div className="tag-item" style={{ cursor: 'pointer' }}>
            <div onClick={navigateToTag}>
                <span style={{ color: '#2954C0', textDecoration: 'underline' }}>{tag.name}</span>
            </div>
            <div>
                <button onClick={() => onEdit(tag)} style={{ marginRight: '5px' }}>Edit</button>
                <button onClick={() => onDelete(tag._id)}>Delete</button>
            </div>
        </div>
    );
};

const TagList = ({ tags, onDelete, onEdit }) => {
    return (
        <div className="tags-list">
            {tags.map(tag => (
                <TagItem key={tag._id} tag={tag} onDelete={onDelete} onEdit={onEdit} />
            ))}
        </div>
    );
};

const UserTagsPage = ({ userId }) => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const authResponse = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
                if (!authResponse.data.isLoggedIn) {
                    window.location.hash = '#/login';
                    return;
                }
                const effectiveUserId = userId || authResponse.data.user._id;
                const response = await axios.get(`http://localhost:8000/user/${effectiveUserId}/tags`, { withCredentials: true });
                setTags(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch tags:', error);
                setError('Failed to load tags.');
                setLoading(false);
            }
        };

        fetchTags();
    }, [userId]);

    const handleDeleteTag = async (tagId) => {
        try {
            await axios.delete(`http://localhost:8000/tags/${tagId}`);
            setTags(currentTags => currentTags.filter(tag => tag._id !== tagId));
        } catch (error) {
            console.error('Error deleting tag:', error);
            alert('Failed to delete tag: ' + (error.response?.data?.message || 'Server error'));
        }
    };


    
    
    
    const handleEditTag = (tag) => {
        console.log('Editing tag:', tag);
         window.location.hash = `#/edit-tag/${tag._id}`;
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <h2>My Tags</h2>
                    {tags.length > 0 ? (
                        <TagList tags={tags} onDelete={handleDeleteTag} onEdit={handleEditTag} />
                    ) : (
                        <p>No tags found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserTagsPage;