import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';


const CommentList = ({ comments, parentObject, onModel, isLoggedIn, userDetails }) => {
    const [currentCommentPage, setCurrentCommentPage] = useState(0);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [localComments, setLocalComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');



    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:8000/comments/${parentObject._id}/${onModel}`);
                setLocalComments(response.data);
                setError('');
            } catch (error) {
                console.error("Error fetching comments:", error);
                setError('Comments could not be loaded.');
            }
            setIsLoading(false);
        };

        fetchComments();
    }, [parentObject._id, onModel]);


    const commentsPerPage = 3;
    const commentTotalPages = Math.ceil(localComments.length / commentsPerPage);
    const commentStartIndex = currentCommentPage * commentsPerPage;
    const commentEndIndex = commentStartIndex + commentsPerPage;

    const handleCommentPageToPrev = () => {
        setCurrentCommentPage(prev => Math.max(prev - 1, 0));
    };

    const handleCommentPageToNext = () => {
        setCurrentCommentPage(prev => Math.min(prev + 1, commentTotalPages - 1));
    };

    const toggleCommentBox = () => {
        setShowCommentBox(!showCommentBox);
    };

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };


    const handleCommentSubmit = async () => {
        if (!newComment.trim()) {
            alert("Comment cannot be empty!");
            return;
        }
        if (newComment.length > 140) {
            alert("Comment must not exceed 140 characters");
            return;
        }
        try {
            const response = await axios.post(
                `http://localhost:8000/comments/${parentObject._id}/newComment`,
                { text: newComment, onModel: onModel },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (response.status === 201) {
                alert("Comment added successfully!");
                const newCommentData = {
                    ...response.data.comment,
                    commentedBy: {
                        username: userDetails.username 
                    }
                };
                setLocalComments([...localComments, newCommentData]);
                setNewComment('');
                setShowCommentBox(false);
            } else {
                alert("Failed to add comment. Please try again!");
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
            if (error.response && error.response.status === 403) {
                alert("You do not have enough reputation to post comments.");
            } else {
                alert("Error submitting comment. Please check your network and try again.");
            }
        }
    };
    

    return (
        <>
            <div className="comment-list">
                {isLoading ? (<p>Loading comments...</p>) : error ? (<p>{error}</p>) : (localComments.slice(commentStartIndex, commentEndIndex).map(comment => (<CommentItem key={comment._id} comment={comment} isLoggedIn={isLoggedIn} />)))}
                {error && <p>{error}</p>}
                {isLoggedIn && (
                    <>
                    <button className="add-comment-button" onClick={toggleCommentBox}>
                    {showCommentBox ? "Cancel" : "Add Comment"}
                    </button>
                        {showCommentBox && (
                            <div>
                        <textarea
                        className="comment-textarea"
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Write a comment..."
                        ></textarea>
                                <button className="add-comment-button" onClick={handleCommentSubmit}>
                                    Submit Comment
                                    </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="pagination">
                <button onClick={handleCommentPageToPrev} disabled={currentCommentPage === 0}>←</button>
                <span>Page {currentCommentPage + 1} of {commentTotalPages}</span>
                <button onClick={handleCommentPageToNext} disabled={currentCommentPage >= commentTotalPages - 1}>→</button>
            </div>
        </>
    );
};

export default CommentList;
