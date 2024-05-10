// db.js
const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/fake_so';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error(err));
  
mongoose.Promise = global.Promise;

const db = mongoose.connection;

module.exports = mongoose;
