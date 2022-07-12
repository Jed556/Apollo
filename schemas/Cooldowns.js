const { Schema, model } = require('mongoose');

module.exports = model("Cooldowns", new Schema({
    userId: {
        type: Number,
        required: true
    },
    guildId: {
        type: Number,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    time: Number
}), "cooldowns");