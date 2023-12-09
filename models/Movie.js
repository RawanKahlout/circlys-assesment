const mongoose = require('mongoose')
//Assume the id and time id is auto increment IDs
const movieSchema = new mongoose.Schema({
  _id: {
    type: Number, 
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  time: [{
    _id: {
      type: Number,
      require: true,
      unique: true
    },
    timeSlot: {
      type: Date,
      require: true
    },
    capacity: {
      type: Number,
      require: true
    }
  }],
  reservation: [{ type: mongoose.Types.ObjectId, ref: "Reservation" }],
});

module.exports = mongoose.model('Movie', movieSchema)
