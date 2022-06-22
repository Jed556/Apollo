const { Schema, model } = require('mongoose');

module.exports = model("Client", new Schema({
    Client: Boolean,
    Maintenance: {type: Boolean, default: false},
    Memory: Array,
}), "status");
