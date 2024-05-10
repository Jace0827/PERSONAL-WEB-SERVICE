import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import CommentList from './CommentList';
import timePassed from './timePassed';

function convertMarkdownToHTML(text) {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
    return text.replace(markdownLinkRegex, (match, linkText, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });
}

const AnswerItemDelete = ({ answer, userId, isLoggedIn, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(answer.text);
    const [comments, setComments] = useState([]);
    const [upvotes, setUpvotes] = useState(answer.upvotes || 0);

    useEffect(() => {
        setComments(answer.commentIds);
    }, [answer.commentIds]);

    const handleUpvote = async () => {
        if (!isLoggedIn) {
            alert("You need to log in to vote.");
            return;
        }
        try {
            await axios.post(`http://localhost:8000/answers/${answer._id}/upvote`);
            setUpvotes(upvotes + 1);
        } catch (error) {
            console.error("Error upvoting answer:", error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this answer?")) {
            try {
                await axios.delete(`http://localhost:8000/answers/${answer._id}`);
                onDelete(answer._id);
            } catch (error) {
                console.error("Error deleting answer:", error);
            }
        }
    };

    const handleEdit = async () => {
        if (isEditing) {
            // Save the edited answer
            try {
                await axios.put(`http://localhost:8000/answers/${answer._id}`, { text: editText });
                onEdit(answer._id, editText);
                setIsEditing(false);
            } catch (error) {
                console.error("Error updating answer:", error);
                alert('Failed to save the changes.');
            }
        } else {
            setIsEditing(true);
        }
    };

    const answerHTML = convertMarkdownToHTML(isEditing ? editText : answer.text);

    return (
        <>
            <div className="questions-header">
                {isEditing ? (
                    <textarea value={editText} onChange={e => setEditText(e.target.value)} />
                ) : (
                    <div className="answer-text" dangerouslySetInnerHTML={{ __html: answerHTML }}></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="answerer-name">{answer.answeredBy}</div>
                        <div className="posting-date">answered {timePassed(answer.answeredDateTime)}</div>
                    </div>
                    {isLoggedIn && answer.answeredUserId === userId && (
                        <>
                            <button onClick={handleUpvote}>👍 {upvotes}</button>
                            <button className="delete-button" onClick={handleDelete}>Delete</button>
                            <button onClick={handleEdit}>{isEditing ? 'Save' : 'Edit'}</button>
                        </>
                    )}
                </div>
            </div>
            <CommentList comments={comments} parentObject={answer} onModel={'Answer'} isLoggedIn={isLoggedIn} />
            <div className="bottom-liner"></div>
        </>
    );
};

const EditAnswersPage = ({ questionId }) => {
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/questions/${questionId}`);
                const userResponse = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
                setIsLoggedIn(userResponse.data.isLoggedIn);
                if (userResponse.data.isLoggedIn) {
                    setUserId(userResponse.data.user._id);
                }
                setQuestion(response.data);
                setAnswers(response.data.answerIds);
            } catch (error) {
                console.error("Error fetching question data:", error);
            }
        };
        fetchData();
    }, [questionId]);

    const handleDeleteAnswer = (answerId) => {
        setAnswers(currentAnswers => currentAnswers.filter(a => a._id !== answerId));
    };

    const handleEditAnswer = (answerId, newText) => {
        setAnswers(currentAnswers => currentAnswers.map(a => a._id === answerId ? { ...a, text: newText } : a));
    };

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <h2>Edit Answers for Question: {question?.title}</h2>
                    {answers.map(answer => (
                        <AnswerItemDelete key={answer._id} answer={answer} isLoggedIn={isLoggedIn} userId={userId} onDelete={handleDeleteAnswer} onEdit={handleEditAnswer} />
                    ))}
                    {answers.length === 0 && <p>No answers to display.</p>}
                </div>
            </div>
        </div>
    );
};

export default EditAnswersPage;
