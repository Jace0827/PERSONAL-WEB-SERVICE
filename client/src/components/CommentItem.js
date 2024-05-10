import React, { useState } from 'react';
import axios from 'axios';
import timePassed from './timePassed';

const CommentItem = React.memo(({ comment, isLoggedIn }) => {
    const [upvotes, setUpvotes] = useState(comment.upvotes);

    const handleUpvote = async () => {
        if (!isLoggedIn) {
            alert("You need to log in to vote.");
            return;
        }

        try {
            await axios.post(`http://localhost:8000/comments/${comment._id}/upvote`);
            setUpvotes(current => current + 1);
        } catch (error) {
            console.error("Error upvoting comment:", error);
        }
    };

    return (
        <>
            <div className="questions-header" >
                {/* <div className="comment-text" dangerouslySetInnerHTML={{ __html: answerHTML }}></div> */}
                <div className="comment-text">{comment.text}</div>

                <div style={{ overflowY: 'auto', paddingTop: '20px' }}>
                    <span style={{ width: '20%' }}>
                        <div className="answerer-name">{comment.commentedBy?.username}</div>
                        <div className="posting-date">answered {timePassed(comment.createdAt)}</div>
                    </span>
                    {isLoggedIn && (
                        <button onClick={handleUpvote} className="upvote-button">👍 {upvotes}</button>
                    )}
                </div>
            </div>
        </>
    );
});


export default CommentItem;
