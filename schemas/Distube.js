const { Schema, model } = require("mongoose");

module.exports = model("Distube", new Schema({
    guilds: Array,
}), "settings");