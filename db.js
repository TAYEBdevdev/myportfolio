// Example for connecting to a MongoDB database
const { error } = require('console');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ttayeb769:Q74bpIlgu0ZKYhCC@cluster0.bqq5s.mongodb.net/', {
}).then(res=>console.log("mongo db connected")).catch(error=>console.log(error));

const TPSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    files: {
        type:Array,
        default:[]
    },
    });

const TP = mongoose.model('TP', TPSchema);

module.exports = TP;
