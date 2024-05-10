import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import Sidebar from './Sidebar';
import SortingButtons from './SortingButtons';
import Header from './Header';
import timePassed from './timePassed';
import QuestionItem from './QuestionItem';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/questions')
      .then(response => {
        const sortedQuestions = response.data.sort((a, b) => new Date(b.askDateTime) - new Date(a.askDateTime));
        setAllQuestions(sortedQuestions);
        setQuestions(sortedQuestions.slice(0, 5));
      })
      .catch(error => {
        console.error("Error fetching questions:", error);
      });
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const userSessionCookie = document.cookie.split('; ').find(row => row.startsWith('userAuthSession='));
    setIsLoggedIn(!!userSessionCookie);
  };

  const navigateToAskQuestion = () => {
    window.location.href = "#/ask-question";
  };
  const navigateToLogIn = () => {
    window.location.href = "#/login";
  };

  const totalPages = Math.ceil(allQuestions.length / 5);

  const goToNextPage = () => {
    setCurrentPage((prevCurrentPage) => (prevCurrentPage + 1) % totalPages);
  };

  const goToPrevPage = () => {
    setCurrentPage((prevCurrentPage) => Math.max(prevCurrentPage - 1, 0));
  };

  useEffect(() => {
    const start = currentPage * 5;
    const paginatedQuestions = allQuestions.slice(start, start + 5);
    setQuestions(paginatedQuestions);
  }, [currentPage, allQuestions]);


  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <div className="questions-header">
            <h2>All Questions</h2>
            {isLoggedIn ? (
              <button onClick={navigateToAskQuestion} className="ask-question-button">Ask Question</button>
            ) : (
              <button onClick={navigateToLogIn} className="ask-question-button">   Log In   </button>
            )}
          </div>
          <span>{allQuestions.length} {allQuestions.length > 1 ? "questions" : "question"}</span>
          <SortingButtons setQuestions={setQuestions} allQuestions={allQuestions} />
          <div className='top-liner'></div>
          <div className="questions-list">
            {questions.map(question => (
              <QuestionItem key={question._id} question={question} />
            ))}
          </div>
          <div className="pagination">
            <button onClick={goToPrevPage} disabled={currentPage === 0}>Prev</button>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage >= totalPages - 1}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;
