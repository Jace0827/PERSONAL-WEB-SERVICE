import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import '../stylesheets/index.css';

const NewAnswerPage = ({ question }) => {

    const [username, setUsername] = useState('');
    const [text, setText] = useState('');
    const [errors, setErrors] = useState({});

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState({});

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
                setIsLoggedIn(response.data.isLoggedIn);
                if (response.data.isLoggedIn) {
                    setUserDetails(response.data.user);
                }
            } catch (error) {
                console.error('Failed to authenticate:', error);
                window.location.href = '/login';
            }
        };

        checkLoginStatus();
    }, []);


    const validateForm = () => {
        let newErrors = {};
        // Answer text validation
        if (!text.trim()) {
            newErrors.text = 'Text cannot be empty.';
        } else {
            // Hyperlink validation
            const hyperlinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s()]+)\)/g;
            let invalidLinks = [];
            let match;
            while ((match = hyperlinkRegex.exec(text)) !== null) {
            }
            const invalidHyperlinkRegex = /\[([^\]]+)\]\((.*?)\)/g;
            while ((match = invalidHyperlinkRegex.exec(text)) !== null) {
                const linkText = match[1];
                const url = match[2];
                if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
                    invalidLinks.push(`[${linkText}](${url})`);
                }
            }
            if (invalidLinks.length > 0) {
                newErrors.text = `Invalid hyperlink format. Hyperlinks cannot be empty and must begin with "http://" or "https://". Invalid links: ${invalidLinks.join(', ')}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await axios.post(`http://localhost:8000/questions/${question._id}/newAnswer`,
                    { text: text },
                    { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
                );
                if (response.status === 201) {
                    const newHash = `#/questions/${question._id}`;
                    window.location.hash = newHash;
                } else {
                    alert("Failed to add answer. Please try again!");
                }

            } catch (error) {
                console.error("Error submitting answer:", error);
                // if (error.response && error.response.status === 403) {
                //     alert("You do not have enough reputation to post answer.");
                // } else {
                alert("Error submitting answer. Please check your network and try again.");
                // }
            }
            setText('');
            setUsername('');
        }
    };


    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <form onSubmit={handleSubmit} className="ask-question-form">
                        <div>
                            <h2>Answer Text*</h2>
                            <textarea
                                // id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your answer here..."
                                style={{ height: '175px', width: '400px' }}
                            />
                            {errors.text && <div className="error-message">{errors.text}</div>}
                        </div>

                        <button type="submit" className="post-question-button"> Post Answer</button>
                        {errors.submit && <div className="error-message">{errors.submit}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewAnswerPage;
