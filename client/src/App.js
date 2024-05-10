// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import './stylesheets/App.css';
import './stylesheets/index.css';
import AskQuestionPage from './components/AskQuestionPage';
import TagsPage from './components/TagsPage';
import AnswerPage from './components/AnswerPage';
import NewAnswerPage from './components/NewAnswerPage';
import QuestionsPage from './components/QuestionsPage';
import TagQuestionPage from './components/TagQuestionPage';
import SearchPage from './components/SearchPage';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ProfilePage from './components/ProfilePage';
import UserQuestionsPage from './components/UserQuestionsPage';
import UserAnswersPage from './components/UserAnswersPage';
import UserTagsPage from './components/UserTagsPage';
import EditTagPage from './components/EditTagPage';
import EditAnswersPage from './components/EditAnswersPage';
import AdministratorPage from './components/_ AdministratorPage';
import AdminUserProfile from './components/_AdminUserProfilePage';

// function useCookie(name) {
//   let cookieArray = document.cookie.split(';');
//   for (let cookie of cookieArray) {
//     let [key, value] = cookie.trim().split('=');
//     if (key === name) {
//       return value;
//     }
//   }
//   return null;
// }

function App() {

  const [currentComponent, setCurrentComponent] = useState(<QuestionsPage />);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [cookies, setCookie, removeCookie] = useCookies(['userAuthSession']); // useCookies hook

  const tempHash = window.location.hash;
  // this is how you can get the cookie value
  useEffect(() => {
    const sessionId = cookies.userAuthSession;
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
        setIsLoggedIn(response.data.isLoggedIn);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    checkLoginStatus();

  }, [tempHash, cookies.userAuthSession]);

  useEffect(() => {
    // const checkLoginStatus = async () => {
    //   try {
    //     const response = await axios.get('http://localhost:8000/api/authenticate', { withCredentials: true });
    //     setIsLoggedIn(response.data.isLoggedIn);
    //     console.log('isLoggIn:', isLoggedIn);
    //   } catch (error) {
    //     console.error('Error checking authentication:', error);
    //   }
    // };
    // checkLoginStatus();

    function handleHashChange() {
      const hash = window.location.hash;
      console.log("Current hash:", hash);
      if (hash.match(/^#\/questions\/[^/]+\/answer-question$/)) {
        const questionId = hash.split('/')[2];
        axios.get(`http://localhost:8000/questions/${questionId}/answers`)
          .then(response => {
            const question = response.data;
            setCurrentComponent(<NewAnswerPage question={question} />);
          })
          .catch(error => {
            const errorMessage = error.response?.data?.message || "Unknown error occurred";
            alert(`Error: ${errorMessage}`);
            window.location.hash = '#/questions';
            setCurrentComponent(<QuestionsPage />);
            console.error('Error fetching question:', error);
          });
      }
    

      else if (hash === "#/my-questions") {
        if (!isLoggedIn) {
          window.location.hash = '#/login';
        } else {
          setCurrentComponent(<UserQuestionsPage userId={sessionId} />);
        }
      }
      else if (hash.startsWith("#/edit-answers/")) {
        const questionId = hash.split('/')[2];
        setCurrentComponent(<EditAnswersPage questionId={questionId} />);
      }

      else if (hash.startsWith("#/edit-tag/")) {
        const tagId = hash.split('/')[2];
        setCurrentComponent(<EditTagPage tagId={tagId} />);
      }

      else if (hash === "#/my-answers") {
        if (!isLoggedIn) {
          window.location.hash = '#/login';
        } else {
          setCurrentComponent(<UserAnswersPage />);
        }
      }
      else if (hash === "#/my-tags") {
        if (!isLoggedIn) {
          window.location.hash = '#/login';
        } else {
          setCurrentComponent(<UserTagsPage />);
        }
      }

      else if (hash.startsWith("#/edit-question/")) {
        const questionId = hash.split('/')[2];
        console.log("Navigating to edit question with ID:", questionId);
        setCurrentComponent(<AskQuestionPage questionId={questionId} />);
      }
      else if (hash.startsWith("#/questions/") && hash.split("/").length >= 3) {
        const questionId = hash.split('/')[2];
        axios.get(`http://localhost:8000/questions/${questionId}`)
          .then(response => {
            const question = response.data;
            setCurrentComponent(<AnswerPage question={question} />);
          })
          .catch(error => {
            const errorMessage = error.response?.data?.message || "Unknown error occurred";
            alert(`Error: ${errorMessage}`);
            window.location.hash = '#/questions';
            setCurrentComponent(<QuestionsPage />);
            console.error('Error fetching question:', error);
          });
      } else if (hash === "#/questions") {
        setCurrentComponent(<QuestionsPage />);
      }
      else if (hash === "#/ask-question") {
        if (!isLoggedIn)
          window.location.hash = '#/login';
        else
          setCurrentComponent(<AskQuestionPage />);
      }
      else if (hash === "#/tags-page") {
        console.log("#/tags-page");
        setCurrentComponent(<TagsPage />);
      }
      else if (hash.startsWith("#/tags/") && hash.split("/").length > 2) {
        const tagName = hash.split("/")[2];
        setCurrentComponent(<TagQuestionPage tagName={tagName} />);
      }
      else if (hash.startsWith("#/search")) {
        console.log("#/search");
        const match = hash.match(/\?q=([^&]+)/);
        const searchQuery = match ? decodeURIComponent(match[1]) : '';
        setCurrentComponent(<SearchPage searchQuery={searchQuery} />);
      }
      else if (hash === "#/login") {
        if (isLoggedIn)
          window.location.hash = '#/profile';
        else
          setCurrentComponent(<LoginPage />);
      }
      else if (hash === "#/signup") {
        setCurrentComponent(<SignUpPage />);
      }
      else if (hash === "#/profile") {
        if (!isLoggedIn)
          window.location.hash = '#/login';
        else
          setCurrentComponent(<ProfilePage />);
      }
      else if (hash.startsWith("#/edit-question/")) {
        const questionId = hash.split('/')[2];
        setCurrentComponent(<AskQuestionPage questionId={questionId} editMode={true} />);
      }
      else if (hash === "#/administratorPage") {
        setCurrentComponent(<AdministratorPage />);
      }
      else if (hash.startsWith("#/admin-profile/")) {
        const userId = hash.split('/')[2];
        console.log("Navigating to edit userId with ID:", userId);
        setCurrentComponent(<AdminUserProfile userId={userId} />);
      }
      else if (hash.startsWith("#/user-questions/")) {
        const userId = hash.split('/')[2];
        setCurrentComponent(<UserQuestionsPage userId={userId} />);
    } else if (hash.startsWith("#/user-answers/")) {
        const userId = hash.split('/')[2];
        setCurrentComponent(<UserAnswersPage userId={userId} />);
    } else if (hash.startsWith("#/user-tags/")) {
        const userId = hash.split('/')[2];
        setCurrentComponent(<UserTagsPage userId={userId} />);
    }
      else {
        alert("Invalid URL")
        window.location.hash = '#/questions';
        setCurrentComponent(<QuestionsPage />);
      }
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isLoggedIn, sessionId]);

  return (
    <div className="app">
      {currentComponent}
    </div>
  );
}


export default App;