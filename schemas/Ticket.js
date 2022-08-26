const { Schema, model } = require("mongoose");

module.exports = model("ticketSchema", new Schema({
  guildId: String,
  channelId: String,
  categoryId: String, 
  ticketlog: String,
  supportRole: String,
  embedDescription: String,
}), "userTickets");