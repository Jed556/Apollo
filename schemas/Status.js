const { Schema, model } = require('mongoose');

module.exports = model("Status", new Schema({
    _id: {
        type: Number,
        required: true
    },
    maintenance: {
        type: Boolean,
        default: false
    },
    memory: Array
}), "status");