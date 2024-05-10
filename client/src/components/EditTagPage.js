import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';

const EditTagPage = ({ tagId }) => {
    const [tagName, setTagName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTag = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/tags/${tagId}`);
                setTagName(response.data.name);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching tag:', error);
                setError('Failed to load tag.');
                setLoading(false);
            }
        };

        fetchTag();
    }, [tagId]);

    const handleSave = async () => {
        const updatedTagData = { name: tagName }; 
        try {
            const response = await axios.put(`http://localhost:8000/tags/${tagId}`, updatedTagData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Tag updated:', response.data);
            alert('Tag updated successfully.');
        } catch (error) {
            console.error('Error updating tag:', error);
            setError('Error saving tag: ' + (error.response?.data?.message || 'Server error'));
        }
    };
    
    if (error) return <p>{error}</p>;

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <h2>Edit Tag</h2>
                    <input
                        type="text"
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value)}
                    />
                    <button onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditTagPage;
