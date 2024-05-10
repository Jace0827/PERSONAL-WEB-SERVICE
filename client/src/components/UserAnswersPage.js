import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import QuestionItem from './QuestionItem';

const UserAnswersPage = () => {
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    const fetchUserAnswers = async () => {
        try {
            const authResponse = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
            if (authResponse.data.isLoggedIn) {
                const answersResponse = await axios.get(`http://localhost:8000/user/${authResponse.data.user._id}/answered-questions`);
                console.log("Received answers:", answersResponse.data);
                setUserAnswers(answersResponse.data);
            } else {
                alert('You are not logged in. Please log in to view your answers.');
                window.location.hash = '#/login';
            }
        } catch (error) {
            console.error('Error fetching user answers:', error);
        }
    };

    fetchUserAnswers();
  }, []);

  const navigateToEditAnswersPage = (questionId) => {
    window.location.hash = `#/edit-answers/${questionId}`;
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <h2>Questions I Answered</h2>
          {userAnswers.map((question, index) => (
            <div onClick={() => navigateToEditAnswersPage(question._id)} key={index}>
              <QuestionItem
                question={question}
                showDeleteButton={false}
                onDelete={() => {}}
                isManageMode={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserAnswersPage;
