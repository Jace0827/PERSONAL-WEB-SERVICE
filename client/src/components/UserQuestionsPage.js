import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import QuestionItem from './QuestionItem';  

const UserQuestionsPage = ({ userId }) => {
  const [userQuestions, setUserQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserQuestions = async () => {
      try {
        const authResponse = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
        if (!authResponse.data.isLoggedIn) {
          alert('You are not logged in. Please log in to view your questions.');
          window.location.hash = '#/login';
          return;
        }
        // Use the passed userId or fall back to the authenticated user's ID
        const effectiveUserId = userId || authResponse.data.user._id;
        const questionsResponse = await axios.get(`http://localhost:8000/user/${effectiveUserId}/questions`);
        setUserQuestions(questionsResponse.data);
      } catch (error) {
        console.error('Error fetching user questions:', error);
        setError('Failed to fetch questions for the specified user.');
      }
    };

    fetchUserQuestions();
  }, [userId]);

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:8000/questions/${questionId}`);
        const updatedQuestions = userQuestions.filter(question => question._id !== questionId);
        setUserQuestions(updatedQuestions);
        alert('Question deleted successfully.');
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete the question.');
      }
    }
  };

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

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <h2>My Questions</h2>
          {userQuestions.length > 0 ? userQuestions.map(question => (
            <QuestionItem
              key={question._id}
              question={question}
              showDeleteButton={true}
              onDelete={handleDeleteQuestion}
              isManageMode={true}
            />
          )) : <p>No questions found for this user.</p>}
        </div>
      </div>
    </div>
  );
};

export default UserQuestionsPage;
