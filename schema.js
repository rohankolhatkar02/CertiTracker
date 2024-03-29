const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MyModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  certification: {
    type: String,
    required: true
  },
  planned: {
    type: Date,
    default: null
  },
  registered: {
    type: String,
    enum: ['yes', 'no']
  },
  cleared: {
    type: String,
    enum: ['yes', 'no']
  },
  completed: {
    type: Date,
    default: null
  },
  comments: {
    type: String,
    default: null
  },
  validity: {
    type: Date,
    default: null
  },
  },
{ collection: 'newcert' });

const MyModel = mongoose.model('MyModel', MyModelSchema);

module.exports = MyModel;

