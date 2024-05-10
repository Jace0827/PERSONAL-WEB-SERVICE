import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import timePassed from './timePassed';
import '../stylesheets/index.css';
import CommentList from './CommentList';


function convertMarkdownToHTML(text) {
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
    return text.replace(markdownLinkRegex, (match, linkText, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    });
}


const AnswerItem = ({ answer, isLoggedIn, userDetails }) => {
    const answerHTML = convertMarkdownToHTML(answer.text);
    const [comments, setComments] = useState([]);

    const [upvotes, setUpvotes] = useState(answer.upvotes || 0);

    useEffect(() => {
        setComments(answer.commentIds);
    }, [answer.commentIds]); // consider [answer] instead of [answer.commentIds]

    const handleUpvote = async () => {
        if (!isLoggedIn) {
            alert("You need to log in to vote.");
            return;
        }


        try {
            await axios.post(`http://localhost:8000/answers/${answer._id}/upvote`);
            setUpvotes(upvotes + 1);
        } catch (error) {
            console.error("Error upvoting question:", error);
        }
    };



    return (
        <>
            <div className="questions-header" >
                <div className="answer-text" dangerouslySetInnerHTML={{ __html: answerHTML }}></div>

                <div style={{ overflowY: 'auto', paddingTop: '20px', marginLeft: '-30000px' }}>
                    <span style={{ width: '20%' }}>
                        <div className="answerer-name">{answer.answeredBy}</div>
                        <div className="posting-date">answered {timePassed(answer.answeredDateTime)}</div>
                    </span>
                </div>
            </div >
            <CommentList comments={comments} parentObject={answer} onModel={'Answer'} isLoggedIn={isLoggedIn} userDetails={userDetails} />

            <div className="bottom-liner"></div>
        </>
    );
};

const AnswerList = ({ answers, isLoggedIn, userDetails }) => {
    const [currentAnswerPage, setCurrentAnswerPage] = useState(0);

    const answersPerPage = 5;
    const answerTotalPages = Math.ceil(answers.length / answersPerPage);
    const answerStartIndex = currentAnswerPage * answersPerPage;
    const answerEndIndex = answerStartIndex + answersPerPage;

    const handleAnswerPageToPrev = () => {
        setCurrentAnswerPage((prev) => Math.max(prev - 1, 0));
    };

    const handleAnswerPageToNext = () => {
        setCurrentAnswerPage((prev) => (prev + 1) % answerTotalPages);
    };


    return (
        <>
            <div className="answer-list">
                {answers.slice(answerStartIndex, answerEndIndex).map(answer => (
                    <AnswerItem key={answer._id} answer={answer} isLoggedIn={isLoggedIn} userDetails={userDetails}/>
                ))}
            </div>
            <div className="pagination">
                <button onClick={handleAnswerPageToPrev} disabled={currentAnswerPage === 0}>Prev</button>
                <span>Page {currentAnswerPage + 1} of {answerTotalPages}</span>
                <button onClick={handleAnswerPageToNext} disabled={currentAnswerPage >= answerTotalPages - 1}>Next</button>
            </div>
        </>
    );
};

const AnswerPage = ({ question }) => {
    const [answers, setAnswers] = useState([]);
    const [comments, setComments] = useState([]);
    const [upvotes, setUpvotes] = useState(question.upvotes || 0);
    const [downvotes, setDownvotes] = useState(question.downvotes || 0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userDetails, setUserDetails] = useState();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
                setIsLoggedIn(response.data.isLoggedIn);
                setUserDetails(response.data.user);
                console.log("User details:", response.data.user);
            } catch (error) {
                console.error('Failed to authenticate:', error);
            }
        };
        checkLoginStatus();
        setAnswers(question.answerIds);
        setComments(question.commentIds);
    }, [question.answerIds, question.commentIds]);

    const handleUpvote = async () => {
        if (!isLoggedIn) {
            alert("You need to log in to vote.");
            return;
        }
        try {
            const response = await axios.post(`http://localhost:8000/questions/${question._id}/upvote`, {}, { withCredentials: true });
            setUpvotes(upvotes + 1);
        } catch (error) {
            console.error("Error upvoting question:", error);
            if (error.response && error.response.status === 403) {
                alert("You do not have enough reputation to upvote.");
            } else {
                alert("Error submitting comment. Please check your network and try again.");
            }
        }
    };

    const handleDownvote = async () => {
        if (!isLoggedIn) {
            alert("You need to log in to vote.");
            return;
        }
        try {
            await axios.post(`http://localhost:8000/questions/${question._id}/downvote`);
            setDownvotes(downvotes + 1);
        } catch (error) {
            console.error("Error downvoting question:", error);
        }
    };

    return (
        <div className="app-container">
            <Header />
            <div className="main-body">
                <Sidebar />
                <div className="content">
                    <div className="questions-header" style={{ marginBottom: '10px' }}>
                        <h3>{answers.length} {answers.length > 1 ? "answers" : "answer"}</h3>
                        <span><h2>{question.title}</h2></span>
                        {isLoggedIn && (
                            <button className="ask-question-button" onClick={() => window.location.hash = "#/ask-question"}>
                                Ask Question
                            </button>
                        )}
                    </div>
                    <div className="questions-header">
                        <h3 style={{ width: '10%' }}>{question.views} {question.views > 1 ? "views" : "view"}</h3>
                        <span className="question-text" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(question.text) }}></span>
                        <div style={{ width: '15%' }}>
                            <div className="questioner-name">{question.askedBy}</div>
                            <div className="posting-date">asked {timePassed(question.askDateTime)}</div>
                            {isLoggedIn && (userDetails.reputation >= 50) && (
                                <div style={{ marginTop: '10px' }}>
                                    <button onClick={handleUpvote}>👍 {upvotes}</button>
                                    <button onClick={handleDownvote}>👎 {downvotes}</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <CommentList comments={comments} parentObject={question} onModel={'Question'} isLoggedIn={isLoggedIn} userDetails={userDetails}/>
                    <div className="top-liner"></div>

                    {answers.length > 0 ? <AnswerList answers={answers} isLoggedIn={isLoggedIn} userDetails={userDetails}/> : <p>No answers yet.</p>}

                    {isLoggedIn && (
                        <button className="ask-question-button" style={{ marginTop: '30px' }} onClick={() => window.location.hash = `#/questions/${question._id}/answer-question`}>
                            Answer Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnswerPage;