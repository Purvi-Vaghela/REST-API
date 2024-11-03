const mongoose = require('mongoose') ;

const TaskSchema = new mongoose.Schema({
    // name: String , completed: Boolean
    name: {
        type : String,
        required: [true, 'must provide name '],
        trim: true,
        maxLength: [20, 'name cannot be more than 20 char'],
    },
    completed: {
        type: Boolean,
        default: false,
    },
                
})

module.exports = mongoose.model('Task', TaskSchema)