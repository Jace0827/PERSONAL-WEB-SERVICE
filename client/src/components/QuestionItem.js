import React from 'react';
import timePassed from './timePassed';

const QuestionItem = ({ question, showDeleteButton, onDelete, isManageMode }) => {
  const tags = question.tagIds.map((tag, index) => (
    <span key={index} className="tag">{tag.name}</span>
  ));

  const navigateToQuestion = () => {
    if (isManageMode) {
      window.location.hash = `#/edit-question/${question._id}`;
    } else {
      window.location.hash = `#/questions/${question._id}`;
    }
  };

  return (
    <div className="bottom-liner" onClick={navigateToQuestion} style={{ cursor: 'pointer' }}>
      <div className="question-upper">
        <div className="question-stats">
          <div className="answers-count">{question.answerIds.length} {question.answerIds.length > 1 ? "answers" : "answer"}</div>
          <div className="views-count">{question.views} {question.views > 1 ? "views" : "view"}</div>
        </div>
        <div className="question-content">
          <div className="question-title">{question.title}</div>
          <div className="question-tags">{tags}</div>
          <div className="question-metadata">
            <span className="username">{question.askedBy}</span> asked <span className="time">{timePassed(question.askDateTime)}</span>
          </div>
        </div>
      </div>
      {showDeleteButton && (
        <button onClick={(e) => {
          e.stopPropagation(); // prevent triggering the navigateToQuestion
          onDelete(question._id);
        }} className="delete-question-button">
          Delete Question
        </button>
      )}
    </div>
  );
};

export default QuestionItem;
