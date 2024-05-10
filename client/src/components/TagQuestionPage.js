import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header.js';
import Sidebar from './Sidebar.js';
import SortingButtons from './SortingButtons';
import QuestionItem from './QuestionItem'; 
import '../stylesheets/index.css';

const TagQuestionPage = () => {
    const [tagName, setTagName] = useState('');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const hash = window.location.hash;
        const tagName = hash.split("/")[2]; 
        setTagName(tagName);
        if (tagName) {
            axios.get(`http://localhost:8000/tag/${tagName}`)
                .then(response => {
                    const fetchedQuestions = response.data;
                    setQuestions(fetchedQuestions);
                })
                .catch(error => {
                    console.error("Error fetching questions by tag:", error);
                });
        }
    }, []); 

    const navigateToAskQuestion = () => {
        window.location.hash = "#/ask-question";
    };

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <div className="questions-header">
                        <h2>Questions tagged: {tagName}</h2>
                        <button onClick={navigateToAskQuestion} className="ask-question-button">Ask Question</button>
                    </div>

                    <span>{questions.length} {questions.length > 1 ? "questions" : "question"}</span>
                    <SortingButtons setQuestions={setQuestions} />
                    <div className='top-liner'></div>
                    <div className="questions-list">
                        {questions.map(question => (
                            <QuestionItem key={question._id} question={question} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default TagQuestionPage;
