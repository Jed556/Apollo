const { Schema, model } = require("mongoose");

module.exports = model("Distube", new Schema({
    Distube: Boolean,
    Guilds: Array,
}), "settings");