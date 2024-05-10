const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Tag } = require('./models/tags.js');
const { Question } = require('./models/questions.js');
const { Answer } = require('./models/answers.js');
const { User } = require('./models/users.js');
const { Comment } = require('./models/comments.js');
const bcrypt = require('bcrypt');

const userArgs = process.argv.slice(2);

if (userArgs.length < 1 || !userArgs[0].startsWith('mongodb://')) {
    console.error('ERROR: You must provide a MongoDB URL.');
    process.exit(1);
}

const mongoDB = userArgs[0]; // 'mongodb://127.0.0.1:27017/fake_so';
const adminCredentials = userArgs[1];
const expectedCredentials = "Admin Account anyidea";

// Admin credentials must match the expected credentials
if (adminCredentials !== expectedCredentials) {
    console.error('ERROR: Invalid admin credentials.');
    process.exit(1);
}


mongoose.connect(mongoDB, {});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const importData = async () => {
    try {
        await User.deleteMany({});
        await Tag.deleteMany({});
        await Question.deleteMany({});
        await Answer.deleteMany({});
        await Comment.deleteMany({});

        const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'init/fake_so.users.json'), 'utf8'));
        const tagsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'init/fake_so.tags.json'), 'utf8'));
        const questionsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'init/fake_so.questions.json'), 'utf8'));
        const answersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'init/fake_so.answers.json'), 'utf8'));
        const commentsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'init/fake_so.comments.json'), 'utf8'));

        for (const data of usersData) {
            const userData = {
                ...data,
                _id: new mongoose.Types.ObjectId(data._id.$oid),
                createdAt: new Date(data.createdAt.$date),
                updatedAt: new Date(data.updatedAt.$date),
                questionIds: data.questionIds.map(id => new mongoose.Types.ObjectId(id.$oid)),
                answerIds: data.answerIds.map(id => new mongoose.Types.ObjectId(id.$oid)),
                commentIds: data.commentIds.map(id => new mongoose.Types.ObjectId(id.$oid)),
                tagIds: data.tagIds.map(id => new mongoose.Types.ObjectId(id.$oid))
            };
            await User.create(userData);
        }

        for (const data of tagsData) {
            const tagData = {
                ...data,
                _id: new mongoose.Types.ObjectId(data._id.$oid),
                createdBy: new mongoose.Types.ObjectId(data.createdBy.$oid),
                createdAt: new Date(data.createdAt.$date),
                updatedAt: new Date(data.updatedAt.$date)
            };
            await Tag.create(tagData);
        }

        for (const data of questionsData) {
            const questionData = {
                ...data,
                _id: new mongoose.Types.ObjectId(data._id.$oid),
                askedUserId: new mongoose.Types.ObjectId(data.askedUserId.$oid),
                createdAt: new Date(data.createdAt.$date),
                updatedAt: new Date(data.updatedAt.$date),
                askDateTime: new Date(data.askDateTime.$date), 
                tagIds: data.tagIds.map(tag => new mongoose.Types.ObjectId(tag.$oid)),  
                answerIds: data.answerIds.map(answer => new mongoose.Types.ObjectId(answer.$oid)),
                commentIds: data.commentIds.map(comment => new mongoose.Types.ObjectId(comment.$oid))
            };
            await Question.create(questionData);
        }

        for (const data of answersData) {
            const answerData = {
                ...data,
                _id: new mongoose.Types.ObjectId(data._id.$oid),
                answeredUserId: new mongoose.Types.ObjectId(data.answeredUserId.$oid),
                askedUserId: new mongoose.Types.ObjectId(data.askedUserId.$oid), 
                answeredDateTime: new Date(data.answeredDateTime.$date),
                questionIds: new mongoose.Types.ObjectId(data.questionIds.$oid),
                commentIds: data.commentIds.map(id => new mongoose.Types.ObjectId(id.$oid)),
                createdAt: new Date(data.createdAt.$date),
                updatedAt: new Date(data.updatedAt.$date)
            };
            await Answer.create(answerData);
        }


        for (const data of commentsData) {
            if (!data._id || !data.commentedBy || !data.commentedOn) {
                console.error('Missing data fields:', data);
                continue; 
            }
            
            const commentData = {
                text: data.text,
                commentedBy: new mongoose.Types.ObjectId(data.commentedBy.$oid),
                commentedOn: new mongoose.Types.ObjectId(data.commentedOn.$oid),
                onModel: data.onModel,
                upvotes: data.upvotes,
                createdAt: new Date(data.createdAt.$date),
                updatedAt: new Date(data.updatedAt.$date),
                _id: new mongoose.Types.ObjectId(data._id.$oid) 
            };
        
            try {
                await Comment.create(commentData);
            } catch (err) {
                console.error('Error creating comment:', err, 'Data:', commentData);
            }
        }
        console.log('All data imported successfully!');
    } catch (error) {
        console.error('Import error:', error);
    } finally {
        db.close();
    }
};

importData();
