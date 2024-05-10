import React from 'react';
import '../stylesheets/index.css';

const SortingButtons = ({ setQuestions, allQuestions }) => {
    const sortNewest = () => {
      const sortedQuestions = [...allQuestions].sort((a, b) => new Date(b.askDateTime) - new Date(a.askDateTime));
      setQuestions(sortedQuestions);
    };
  
    const sortActive = () => {
      const getMostRecentAnswerDate = (answers) => {
        return answers.reduce((latest, answer) => {
          const answerDate = new Date(answer.answeredDateTime);
          return answerDate > latest ? answerDate : latest;
        }, new Date(0)); //return an old date if there are no answers
      };
    
      const sortedQuestions = [...allQuestions].sort((a, b) => {
        const hasAnswersA = a.answerIds.length > 0;
        const hasAnswersB = b.answerIds.length > 0;
    
        if (hasAnswersA && hasAnswersB) {
          const lastAnswerDateA = getMostRecentAnswerDate(a.answerIds);
          const lastAnswerDateB = getMostRecentAnswerDate(b.answerIds);
          return lastAnswerDateB - lastAnswerDateA; //Most recent answers first
        }
    
        if (!hasAnswersA && hasAnswersB) return 1;
        if (hasAnswersA && !hasAnswersB) return -1;
    
        return 0;
      });
    
      setQuestions(sortedQuestions);
    };
    
      
      
  
    const sortUnanswered = () => {
      const filteredQuestions = allQuestions.filter(question => question.answerIds.length === 0);
      setQuestions(filteredQuestions);
    };
  
    return (
      <div className="sorting-buttons-container">
        <div className="sorting-buttons">
          <button onClick={sortNewest}>Newest</button>
          <button onClick={sortActive}>Active</button>
          <button onClick={sortUnanswered}>Unanswered</button>
        </div>
      </div>
    );
};

export default SortingButtons;
