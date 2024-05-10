import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import '../stylesheets/index.css';

const TagItem = ({ tag }) => {
  const navigateToTag = () => {
    window.location.hash = `#/tags/${tag.name}`;
  };

  return (
    <div className="tag-item" onClick={navigateToTag} style={{ cursor: 'pointer' }}>
      <div>
        <span style={{ color: '#2954C0', textDecoration: 'underline' }}>{tag.name}</span>
        <div>({tag.questionCount} {tag.questionCount === 1 ? "question" : "questions"})</div>
      </div>
    </div>
  );
};


const TagList = ({ tags, questions }) => {
  return (
    <div className="tags-list">
      {tags.map(tag => (
        <TagItem key={tag.name} tag={tag} questions={questions.filter(question => question.tagIds.includes(tag._id))} />
      ))}
    </div>
  );
};

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsResponse, questionsResponse] = await Promise.all([
          axios.get('http://localhost:8000/tags'),
          axios.get('http://localhost:8000/questions')
        ]);
        setTags(tagsResponse.data);
        setQuestions(questionsResponse.data);
        console.log('Tags:', tagsResponse.data);
        console.log('Questions:', questionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const navigateToAskQuestion = () => {
    window.location.href = "#/ask-question";
  };

  return (
    <div className="app-container">
      <Header />
      <div className="main-body">
        <Sidebar />
        <div className="content">
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <div className="questions-header">
                <h2>{tags.length} {tags.length === 1 ? "Tag" : "Tags"}</h2>
                <button onClick={navigateToAskQuestion} className="ask-question-button">Ask Question</button>
              </div>
              <div className="content">
                <TagList tags={tags} questions={questions} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;