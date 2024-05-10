import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import '../stylesheets/index.css';
import QuestionItem from './QuestionItem'; 

const SearchPage = () => {
  const [questions, setQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/search\?q=([^&]+)/);
    const searchQuery = match ? decodeURIComponent(match[1]) : "";
    setSearchTerm(searchQuery);

    axios.get(`http://localhost:8000/search/questions?q=${searchQuery}`)
      .then(response => {
        setQuestions(response.data);
        setCurrentPage(0); // Reset to first page upon new search
      })
      .catch(error => {
        console.error("Error fetching search results:", error);
        setQuestions([]);
      });
  }, [window.location.hash]); 

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = currentPage * questionsPerPage;
  const endIndex = startIndex + questionsPerPage;
  const currentQuestions = questions.slice(startIndex, endIndex);

  const navigateToAskQuestion = () => {
    window.location.href = "#/ask-question";
  };

  const handlePrevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <div className="questions-header">
            <h2>Search Results for "{searchTerm}"</h2>
            <button onClick={navigateToAskQuestion} className="ask-question-button">Ask Question</button>
          </div>
          <span>{questions.length} {questions.length > 1 ? "questions" : "question"}</span>
          <div className='top-liner'></div>
          <div className="questions-list">
            {currentQuestions.length > 0 ? (
              currentQuestions.map(question => (
                <QuestionItem key={question._id} question={question} />
              ))
            ) : (
              <p className="no-questions-message">no results found</p>
            )}
          </div>
          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 0}>Prev</button>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
