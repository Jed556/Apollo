const { Schema, model } = require('mongoose');

module.exports = model("Client", new Schema({
    _id: Number,
    Maintenance: {type: Boolean, default: false},
    Memory: Array,
}), "status");