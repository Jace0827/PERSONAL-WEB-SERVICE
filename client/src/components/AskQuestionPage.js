import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../stylesheets/index.css';
import Header from './Header';
import Sidebar from './Sidebar';

const AskQuestionPage = ({ questionId = null }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [existingTags, setExistingTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    console.log("Checking if user is logged in...");
    checkLoginStatus();
    console.log("Fetching tags...");
    fetchTags();
  }, []);

  useEffect(() => {
    if (questionId) {
      console.log(`Fetching details for question ID: ${questionId}`);
      fetchQuestionDetails();
    }
  }, [questionId]);

  const fetchQuestionDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/questions/${questionId}`);
      const { title, summary, text, tagIds } = response.data;
      console.log("Received question data:", response.data);
      setTitle(title);
      setSummary(summary);
      setText(text);
      setTags(tagIds.map(tag => tag.name).join(' '));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching question details:', error);
      setLoading(false);
    }
  };


  const fetchTags = async () => {
    try {
      const { data } = await axios.get('http://localhost:8000/tags');
      setExistingTags(data.map(tag => tag.name));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
      setIsLoggedIn(response.data.isLoggedIn);
      if (response.data.isLoggedIn) {
        setUserDetails(response.data.user);
      } else {
        setUserDetails({});
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      window.location.href = '/login';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!title) newErrors.title = 'Title cannot be empty.';
    if (title.length > 50) newErrors.title = 'Title cannot be more than 50 characters.';
    if (!summary) newErrors.summary = 'Summary cannot be empty.';
    if (summary.length > 140) newErrors.summary = 'Summary cannot be more than 140 characters.';
    if (!text) newErrors.text = 'Text cannot be empty.';

    const tagList = tags.split(/\s+/).filter(tag => tag);
    tagList.forEach(tag => {
      if (!existingTags.includes(tag) && userDetails.reputation < 50) {
        newErrors.tags = 'Only users with a reputation of 50 or higher can create new tags.';
      }
    });
    if (tagList.length > 5) newErrors.tags = 'Cannot have more than 5 tags.';
    if (tagList.some(tag => tag.length > 20)) newErrors.tags = 'Each tag cannot be more than 20 characters.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const postData = {
        title,
        summary,
        text,
        tags: tagList,
        userId: userDetails._id
      };
      try {
        let response;
        if (questionId) {
          response = await axios.put(`http://localhost:8000/questions/${questionId}`, postData);
          console.log('Updated question successfully:', response.data); 
        } else {
          response = await axios.post('http://localhost:8000/questions', postData);
          console.log('Posted new question successfully:', response.data);
        }
        window.location.hash = '#/questions';
      } catch (error) {
        console.error("Error saving question:", error);
      }
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          <form onSubmit={handleSubmit} className="ask-question-form">
            <h2>{questionId ? 'Edit' : 'Ask a'} Question</h2>
            <h2>Question Title*</h2>
            <small>Limit title to 50 characters or less</small>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            {errors.title && <div className="error-message">{errors.title}</div>}

            <h2>Question Summary*</h2>
            <small>Limit summary to 140 characters or less</small>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} />
            {errors.summary && <div className="error-message">{errors.summary}</div>}

            <h2>Question Text*</h2>
            <textarea value={text} onChange={(e) => setText(e.target.value)} />
            {errors.text && <div className="error-message">{errors.text}</div>}

            <h2>Tags*</h2>
            <small>Add up to 5 tags separated by whitespace</small>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
            {errors.tags && <div className="error-message">{errors.tags}</div>}
            <button type="submit" className="post-question-button">{questionId ? 'Update Question' : 'Post Question'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionPage;
