const { Schema, model } = require('mongoose');

module.exports = model("Status", new Schema({
    clientID: {
        type: Number,
        required: true
    },
    maintenance: {
        type: Boolean,
        default: false
    },
    memory: Array
}), "status");