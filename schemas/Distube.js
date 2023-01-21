const { Schema, model } = require('mongoose');

module.exports = model("Distube", new Schema({
    clientID: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        default: 100
    },
    autoplay: {
        type: Boolean,
        default: false
    },
    filters: {
        type: Array,
        default: ["bassboost6", "clear"]
    },
    djroles: Array,
}), "dtSettings");