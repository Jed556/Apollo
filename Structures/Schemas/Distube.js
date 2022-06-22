const { Schema, model } = require("mongoose");

module.exports = model("Distube", new Schema({
    Client: Boolean,
    Maintenance: {type: Boolean, default: false},
    Memory: Array,
}), "settings");
