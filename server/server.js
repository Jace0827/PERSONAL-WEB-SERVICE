// Application server
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 8000;
const { db, url } = require('./db.js');


const { Tag } = require('./models/tags.js');
const { Question } = require('./models/questions.js');
const { Answer } = require('./models/answers.js');
const { User } = require('./models/users.js');
const { Comment } = require('./models/comments.js');
const { create } = require('connect-mongo');


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(session({
    name: 'userAuthSession',
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 10 * 60 * 1000, // 10 min
        httpOnly: false
    }
}));


app.get("/", function (req, res) {
    try {
        var cookie = getcookie(req);
        console.log('Session user:', cookie);
    } catch (error) {
        console.error('Error fetching session user:', error);
    }
});

function getcookie(req) {
    var cookie = req.headers.cookie;
    // user=someone; session=mySessionID
    return cookie.split('; ');
}

// Middleware for checking if user is logged in
const isLoggedIn = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "You must be logged in to perform this action" });
    }
    next();
};


const isAdmin = (req, res, next) => {
    if (!req.session.user || !req.session.user.isAdmin) {
        return res.status(403).json({ message: "You must be an admin to perform this action." });
    }
    next();
};

app.get('/allUsers', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users.map(user => {
            return {
                _id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isAdmin: user.isAdmin
            };
        }));
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({ message: 'Server error while fetching all users.' });
    }
});

app.get('/api/user/:userId', isLoggedIn, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: "Server error while fetching user details." });
    }
});

app.put('/tags/:tagId', async (req, res) => {
    const { tagId } = req.params;
    const { name } = req.body; 

    try {
        const tag = await Tag.findByIdAndUpdate(tagId, { name }, { new: true });
        if (!tag) {
            return res.status(404).send({ message: "Tag not found" });
        }
        res.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).send({ message: "Internal server error" });
    }
});



app.get('/tags', async (req, res) => {
    try {
        // const tags = await Tag.find(); 
        // res.json(tags);
        const tagsWithCounts = await Tag.find().lean().exec();

        const questionCounts = await Question.aggregate([
            { $unwind: "$tagIds" },
            { $group: { _id: "$tagIds", count: { $sum: 1 } } }
        ]);
        // Add the question count to each tag
        for (const tag of tagsWithCounts) {
            const questionCount = questionCounts.find(c => c._id.equals(tag._id)) || { count: 0 };
            tag.questionCount = questionCount.count;
        }
        res.json(tagsWithCounts);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ message: 'Server error while fetching tags' });
    }
});

app.get('/tag/:tagName', async (req, res) => {
    try {
        const tagName = req.params.tagName;
        const tag = await Tag.findOne({ name: tagName });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        const questions = await Question.find({ tagIds: tag._id })
            .populate('tagIds')
            .populate('answerIds');

        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions by tag:', error);
        res.status(500).json({ message: 'Server error while fetching questions by tag' });
    }
});

app.put('/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const { title, summary, text, tagIds } = req.body;  

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ message: "Invalid question ID." });
    }

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(questionId, {
            title,
            summary,
            text,
            tagIds
        }, { new: true }).populate('tagIds'); 

        if (!updatedQuestion) {
            return res.status(404).send({ message: "Question not found" });
        }
        
        res.json(updatedQuestion);
    } catch (error) {
        console.error('Error updating the question:', error);
        res.status(500).json({ message: "Server error while updating the question" });
    }
});




app.get('/user/:userId/questions', async (req, res) => {
    try {
        const { userId } = req.params;
        const questions = await Question.find({ askedUserId: userId }).populate('tagIds');
        res.json(questions);
    } catch (error) {
        console.error('Error fetching user questions:', error);
        res.status(500).json({ message: 'Server error while fetching user questions' });
    }
});



app.get('/questions', async (req, res) => {
    try {
        const questions = await Question.find().populate('tagIds');
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Server error while fetching questions' });
    }
});


app.get('/answers', async (req, res) => {
    try {
        const answers = await Answer.find();
        res.json(answers);
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ message: 'Server error while fetching answers' });
    }
});

app.get('/questions/:questionId', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        let question = await Question.findById(questionId)
            .populate('tagIds')
            .populate('answerIds')
            .populate('commentIds');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.views += 1;
        console.log('views:', question.views);
        await question.save();
        res.json(question);
    } catch (error) {
        console.error('Error fetching the question:', error);
        res.status(500).json({ message: 'Server error while fetching the question' });
    }
});

app.get('/comments/:parentObjectId/:onModel', async (req, res) => {
    try {
        const { parentObjectId, onModel } = req.params;
        const Model = mongoose.model(onModel);
        const parentObject = await Model.findById(parentObjectId);

        if (!parentObject) {
            return res.status(404).json({ message: `${onModel} object not found` });
        }

        const comments = await Comment.find({ commentedOn: parentObjectId }).populate('commentedBy');

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error while fetching comments' });
    }
});



app.get('/user/:userId/answered-questions', async (req, res) => {
    try {
        const { userId } = req.params;
        const answers = await Answer.find({ answeredUserId: userId })
            .populate({
                path: 'questionIds',
                match: { _id: { $ne: null } },
                populate: {
                    path: 'tagIds'
                }
            });
        const validAnswers = answers.filter(answer => answer.questionIds);
        res.json(validAnswers.map(answer => answer.questionIds));
    } catch (error) {
        console.error('Error fetching answered questions:', error);
        res.status(500).json({ message: 'Failed to fetch answered questions' });
    }
});

// Assuming you have a model Tag with a field createdBy that references User's _id
app.get('/user/:userId/tags', async (req, res) => {
    try {
        const { userId } = req.params;
        const tags = await Tag.find({ createdBy: userId });
        res.json(tags);
    } catch (error) {
        console.error('Error fetching user tags:', error);
        res.status(500).json({ message: 'Server error while fetching user tags' });
    }
});


app.get('/user/:userId/questions', async (req, res) => {
    try {
        const { userId } = req.params;
        const questions = await Question.find({ askedUserId: userId }).populate('tagIds');
        res.json(questions);
    } catch (error) {
        console.error('Error fetching user questions:', error);
        res.status(500).json({ message: 'Server error while fetching user questions' });
    }
});

app.get('/tags/:tagId', async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.tagId);
        if (!tag) {
            return res.status(404).send({ message: "Tag not found" });
        }
        res.json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        res.status(500).send({ message: "Server error" });
    }
});

app.put('/answers/:answerId', async (req, res) => {
    const { answerId } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ message: "Text is required." });
    }

    try {
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: "Answer not found." });
        }

        answer.text = text;
        await answer.save();
        res.json({ message: "Answer updated successfully", answer });
    } catch (error) {
        console.error('Error updating answer:', error);
        res.status(500).json({ message: "Server error while updating answer." });
    }
});


app.delete('/answers/:answerId', async (req, res) => {
    const { answerId } = req.params;
    try {
        const answer = await Answer.findById(answerId);
        if (!answer) {
            return res.status(404).send('Answer not found');
        }

        await Answer.deleteOne({ _id: answerId });

        await Comment.deleteMany({ commentedOn: answerId });

        res.send({ message: 'Answer and all related comments deleted successfully.' });
    } catch (error) {
        console.error('Error deleting answer:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.delete('/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).send('Question not found');
        }
        await Question.deleteOne({ _id: questionId });
        await Answer.deleteMany({ questionId: question._id });
        await Comment.deleteMany({ questionId: question._id });
        res.send('Question deleted successfully');
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/tags/:tagId', async (req, res) => {
    const { tagId } = req.params;

    try {
        const isTagUsed = await Question.findOne({ tagIds: tagId });


        await Tag.findByIdAndDelete(tagId);
        res.send({ message: "Tag deleted successfully." });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/tags/:tagId', async (req, res) => {
    const { tagId } = req.params;
    const { name } = req.body;

    try {
        const tag = await Tag.findById(tagId);
        if (!tag) {
            return res.status(404).send('Tag not found');
        }

        if (tag.createdBy.toString() !== req.session.user._id.toString()) {
            return res.status(403).json({ message: "You do not have permission to edit this tag" });
        }

        tag.name = name;
        await tag.save();
        res.json({ message: 'Tag updated successfully', tag });
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).send('Error updating tag');
    }
});




app.get('/questions/:questionId/answers', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId)
            .populate('tagIds')
            .populate('answerIds');
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(question);
    } catch (error) {
        console.error('Error fetching the question:', error);
        res.status(500).json({ message: 'Server error while fetching the question' });
    }
});

app.get('/search/questions', async (req, res) => {
    const searchQuery = req.query.q;
    const queryTerms = searchQuery.split(/\s+/);
    const tagTerms = queryTerms
        .filter(term => term.startsWith('[') && term.endsWith(']'))
        .map(term => term.slice(1, -1));
    const searchTerms = queryTerms.filter(term => !(term.startsWith('[') && term.endsWith(']')));
    try {
        let questionsByTag = [];
        let questionsByText = [];
        if (tagTerms.length > 0) {
            const regexTagTerms = tagTerms.map(term => new RegExp('^' + term + '$', 'i'));
            const tags = await Tag.find({ name: { $in: regexTagTerms } });
            const tagIds = tags.map(tag => tag._id);
            questionsByTag = await Question.find({ tagIds: { $in: tagIds } }).populate('tagIds');
        }

        if (searchTerms.length > 0) {
            const regexSearchTerms = searchTerms.map(term => ({
                $or: [
                    { title: { $regex: term, $options: 'i' } },
                    { text: { $regex: term, $options: 'i' } }
                ]
            }));

            const textSearch = searchTerms.join(' ');
            questionsByText = await Question.find({
                $or: regexSearchTerms
            }).populate('tagIds');
        }
        const combinedQuestionsMap = new Map();
        [...questionsByTag, ...questionsByText].forEach(question => {
            combinedQuestionsMap.set(question._id.toString(), question);
        });
        const combinedQuestions = Array.from(combinedQuestionsMap.values());

        console.log('combinedQuestions:', combinedQuestions);
        res.json(combinedQuestions);
    } catch (error) {
        console.error('Error searching questions by tags:', error);
        res.status(500).json({ message: 'Server error while searching questions by tags' });
    }
});

app.get('/api/authenticate', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            isLoggedIn: true,
            user: req.session.user

        });
    } else {
        res.json({ isLoggedIn: false });
    }
});

app.put('/questions/:tagId', async (req, res) => {
    const { tagId } = req.params;
    const { name } = req.body;  // assuming the tag name is being updated
    console.log('Received data:', req.body);

    if (!mongoose.Types.ObjectId.isValid(tagId)) {
        return res.status(400).send({ message: "Invalid tag ID" });
    }

    try {
        const tag = await Tag.findByIdAndUpdate(tagId, { name }, { new: true });
        if (!tag) {
            return res.status(404).send({ message: "Tag not found" });
        }
        res.json(tag);
    } catch (error) {
        console.error('Error updating tag:', error);
        res.status(500).send({ message: "Internal server error" });
    }
});



app.post('/questions', async (req, res) => {
    try {
        const { title, summary, text, tags: tagList, userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tagPromises = tagList.map(async (tagName) => {
            let tag = await Tag.findOne({ name: tagName });
            let isNewTag = false;
            if (!tag) {
                tag = new Tag({ name: tagName, createdBy: userId });
                await tag.save();
                isNewTag = true;
            }
            if (isNewTag) {
                await User.findByIdAndUpdate(userId, { $push: { tagIds: tag._id } });
            }
            return tag._id;
        });
        const tagIds = await Promise.all(tagPromises);

        let askedUser = await User.findById(userId);
        if (!askedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        askedUser = askedUser._id;

        const question = new Question({
            title,
            summary,
            text,
            tagIds,
            askedBy: user.username,
            askedUserId: askedUser,
            askDateTime: new Date(),
            views: 0,
            upvotes: 0,
            downvotes: 0
        });

        await question.save();

        await User.findByIdAndUpdate(userId, { $push: { questionIds: question._id } });

        res.status(201).json(question);
    } catch (error) {
        console.error('Error creating new question:', error);
        res.status(500).json({ message: 'Failed to create new question' });
    }
});

// Upvote a question
app.post('/questions/:questionId/upvote', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        if (user.reputation < 50) {
            return res.status(403).json({ message: 'Minimum reputation of 50 is required to upvote.' });
        }

        // Increment upvotes
        question.upvotes += 1;
        await question.save();

        // Increment reputation of the question asker
        const asker = await User.findById(question.askedUserId);
        if (asker) {
            asker.reputation += 5;  // Award 5 reputation points for an upvote
            await asker.save();
        }

        res.status(200).json({ message: 'Question upvoted successfully', upvotes: question.upvotes });
    } catch (error) {
        console.error('Error upvoting question:', error);
        res.status(500).json({ message: 'Server error while upvoting question' });
    }
});

// Downvote a question
app.post('/questions/:questionId/downvote', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Increment downvotes
        question.downvotes += 1;
        await question.save();

        // Decrement reputation of the question asker
        const asker = await User.findById(question.askedUserId);
        if (asker) {
            asker.reputation -= 10;  // Deduct 10 reputation points for a downvote
            await asker.save();
        }

        res.status(200).json({ message: 'Question downvoted successfully', downvotes: question.downvotes });
    } catch (error) {
        console.error('Error downvoting question:', error);
        res.status(500).json({ message: 'Server error while downvoting question' });
    }
});


// dummy endpoint 
app.post('/answers/:answerId/upvote', async (req, res) => {
    try {
        const answerId = req.params.answerId;
        const answer = await Comment.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        // Increment upvotes
        answer.upvotes += 1;
        await answer.save();


        const replier = await User.findById(answer.askedUserId);
        if (replier) {
            replier.reputation += 5;  // Award 5 reputation points for an upvote
            await replier.save();
        }

        res.status(200).json({ message: 'Answer upvoted successfully', upvotes: answer.upvotes });
    } catch (error) {
        console.error('Error upvoting answer:', error);
        res.status(500).json({ message: 'Server error while upvoting answer' });
    }
});

app.put('/questions/:questionId', async (req, res) => {
    const { questionId } = req.params;
    const { title, summary, text, tags } = req.body;

    try {
        const question = await Question.findByIdAndUpdate(
            questionId,
            { title, summary, text, tags },
            { new: true }
        );

        if (!question) {
            return res.status(404).send('Question not found');
        }

        res.json(question);
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).send('Error updating question');
    }
});

app.post('/comments/:commentId/upvote', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.upvotes = (comment.upvotes || 0) + 1;
        await comment.save();

        // // Handle increase in reputation score of commenter (e.g. increase by 1 point per Upvote)
        // const commentedUser = await User.findById(comment.commentedBy);
        // if (commentedUser) {
        //     commentedUser.reputation = (commentedUser.reputation || 0) + 1;
        //     await commentedUser.save();
        // }

        res.status(200).json({ message: 'Comment upvoted successfully', upvotes: comment.upvotes });
    } catch (error) {
        console.error('Error upvoting comment:', error);
        res.status(500).json({ message: 'Server error while upvoting comment' });
    }
});

app.post('/questions/:questionId/newAnswer', async (req, res) => {
    try {
        const questionId = req.params.questionId;
        const question = await Question.findById(questionId);

        const { text } = req.body;

        const answeredUserId = req.session.user._id;
        const answeredUser = await User.findById(answeredUserId);

        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: 'log in is required' });
        }

        if (!text.trim()) {
            return res.status(400).json({ message: 'Answer text is required' });
        }

        if (!answeredUser) {
            return res.status(404).json({ message: 'Answered user not found' });
        }

        // if (answeredUser.reputation < 50) {
        //     return res.status(403).json({ message: 'Minimum reputation of 50 is required to post comments.' });
        // }

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const questionObjectId = question._id;
        const askedUserId = question.askedUserId;


        if (!askedUserId) {
            return res.status(404).json({ message: 'Asked user not found' });
        }

        const newAnswer = new Answer({
            text,
            answeredBy: answeredUser.username,
            answeredUserId: answeredUser,
            askedUserId: askedUserId,
            answeredDateTime: new Date(),
            questionIds: questionObjectId
        });

        if (!newAnswer.text || newAnswer.text.trim() === '' || !newAnswer.answeredBy || newAnswer.answeredBy.trim() === '') {
            return res.status(400).json({ message: 'Answer text is required' });
        }
        question.answerIds.push(newAnswer._id);

        await newAnswer.save();
        await question.save();
        res.status(201).json({ message: 'New answer created successfully', newAnswer });
    } catch (error) {
        console.error('Error creating new answer:', error);
        res.status(500).json({ message: 'Server error while creating new answer' });
    }
});



app.post('/comments/:parentObjectId/newComment', async (req, res) => {
    try {
        const { parentObjectId } = req.params;
        const { text, onModel } = req.body;
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        const Model = mongoose.model(onModel);
        const parentObject = await Model.findById(parentObjectId);

        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: 'log in is required' });
        }

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        if (text.length > 140) {
            return res.status(400).json({ message: 'Comment text must not exceed 140 characters' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.reputation < 50) {
            return res.status(403).json({ message: 'Minimum reputation of 50 is required to post comments.' });
        }

        if (!parentObject) {
            return res.status(404).json({ message: `An object corresponding to ${onModel} does not exist.` });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newComment = new Comment({
            text,
            commentedBy: user._id,
            commentedOn: parentObjectId,
            onModel
        });

        user.commentIds.push(newComment._id);
        parentObject.commentIds.push(newComment._id);

        await user.save();
        await newComment.save();
        await parentObject.save();

        res.status(201).json({ message: 'Comment added successfully.', comment: newComment });
    } catch (error) {
        console.error('An error occurred while adding a comment.:', error);
        res.status(500).json({ message: 'A server error occurred.' });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.user = {
                _id: user._id,
                username: user.username,
                email: user.email,
                reputation: user.reputation,
                questionIds: user.questionIds,
                answerIds: user.answerIds,
                commentIds: user.commentIds,
                tagIds: user.tagIds,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                isAdmin: user.isAdmin
            };
            req.session.save(err => {
                if (err) {
                    console.error('Session save failed:', err);
                    res.status(500).send({ message: "Session save failed" });
                } else {
                    res.send({ message: "Login successful" });
                    console.log('Login successful');
                    console.log('req.session.user:', req.session.user);
                    // console.log('user data:', user);
                }
            });
        } else {
            res.status(401).send({ message: "Invalid credentials" });
            console.log('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, password, email } = req.body;
        const username = `${firstName} ${lastName}`; // Combine first name and last name to form username

        // Validate email format
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        // Validate password does not contain parts of the user's email or name
        const lowerPassword = password.toLowerCase();
        const emailLocalPart = email.substring(0, email.indexOf('@')).toLowerCase();
        const firstNameLower = firstName.toLowerCase();
        const lastNameLower = lastName.toLowerCase();

        // Check if the password contains part of the user's email local part or name
        if (lowerPassword.includes(emailLocalPart) || lowerPassword.includes(firstNameLower) || lowerPassword.includes(lastNameLower)) {
            return res.status(400).json({ message: 'Password must not contain your email local part, first name, or last name.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            email
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating new user' });
    }
});


// function to close server & database connection
const gracefulShutdown = () => {
    server.close(async () => {
        console.log('Server closed');
        try {
            await mongoose.disconnect();
            console.log('Database disconnected');
            process.exit(0);
        } catch (err) {
            console.error('Error during database disconnection', err);
            process.exit(1);
        }
    });
};

// // listen for TERM signal like kill
process.on('SIGTERM', gracefulShutdown);

// // Listen for INT signal like Ctrl-C
process.on('SIGINT', gracefulShutdown);
