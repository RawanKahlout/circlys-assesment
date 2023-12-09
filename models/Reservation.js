const mongoose = require('mongoose')
const reservationSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  peopleNumber: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('reservation', reservationSchema)
