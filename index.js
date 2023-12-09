const express = require('express')
const mongoose = require('mongoose')
const Movie = require('./models/Movie')
const Reservation = require('./models/Reservation')
const bodyParser = require('body-parser');
require('dotenv').config()

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(3000)

mongoose
    .connect(
        `mongodb://${process.env.mongoURI}`
    ).then(() =>

        console.log("Connected To Database")
    )
    .catch((e) => console.log(e));

app.get('/api/getMovies', async (req, res) => {
    {
        let movies
        let avaliableMovies = [], avaliableMovie = {}
        try {
            movies = await Movie.find()
        } catch (e) {

            console.log(e)
            return res.status(500).send({ message: "Something Wrong ,Unable To Find The Movie" })

        }
        if (!movies) {
            return res.status(500).json({ message: "Request Failed" });
        }
        movies.forEach(movieDetails => {
            for (let timeDetails of movieDetails.time) {
                //  To check the avaliablity of movie and create the response json
                if (timeDetails.capacity != 0 && new Date().toString() >= timeDetails.timeSlot.toString()) {
                    avaliableMovie.title = movieDetails.title
                    avaliableMovie.avaliavleTime = timeDetails.timeSlot.toString()
                    avaliableMovie.capacity = timeDetails.capacity
                    avaliableMovies.push(Object.assign({}, avaliableMovie))
                }
            }
        })

        if (avaliableMovies.length == 0) { return res.status(404).json({ message: " No Movie To Return" }); }
        return res.status(200).json({ avaliableMovies });
    }
})

app.get('/api/checkAvailability/:movieID/:timeSlotID', async (req, res) => {

    const timeSlotID = parseInt(req.params.timeSlotID);
    const movieID = parseInt(req.params.movieID);
    let availability, returnedMovie, timeSlots;

    if (!(Number.isInteger(movieID) && Number.isInteger(timeSlotID)))
        return res.status(500).send({ message: "Make Sure The Parameters Are Integers And Exist" })

    try {
        returnedMovie = await Movie.findOne({ _id: movieID })
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: "something Wrong ,Unable To Find The Movie" })
    }
    if (!returnedMovie) {
        return res.status(404).json({ message: "Request Failed ,Or Movie Not Found With Given ID" });
    }
    timeSlots = returnedMovie.time
    timeSlots.forEach(result => {
        if (result._id == timeSlotID) {
            availability = result.capacity
        }
    })

    if (!availability)
        return res.status(404).json({ message: "Time Slot is Not Avaliable With Given ID" })
    return res.status(200).json({ availability });
})

app.post('/api/reserveTimeSlot', async (req, res) => {
    const { movieID, timeSlotID, numofPeople } = req.body;
    let existingMovie, timeSlotDetail, reservation;
    if (!(Number.isInteger(movieID) && Number.isInteger(timeSlotID) && Number.isInteger(numofPeople)))
        return res.status(500).send({ message: "Make Sure The Body Are Integers And Exist" })
    try {
        existingMovie = await Movie.findById(movieID);
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: "something Wrong ,Unable to find the movie" })
    }
    if (!existingMovie) {
        return res.status(404).json({ message: "Request Failed,Or Movie Not Found With Given ID" });
    }
    timeSlotDetail = existingMovie.time[timeSlotID]
    if (timeSlotDetail.capacity < numofPeople) {
        return res.status(404).json({ message: "No Enough Capacity" });
    }
    try {
        reservation = new Reservation({
            movie: existingMovie,
            time: timeSlotDetail.timeSlot,
            peopleNumber: numofPeople,
        })
        await reservation.save({ reservation });
        existingMovie.time[timeSlotID].capacity = existingMovie.time[timeSlotID].capacity - numofPeople //To update the capacity of movie after reservation is done
        existingMovie.title = existingMovie.title,
            existingMovie.time = existingMovie.time,
            existingMovie.reservation.push(reservation)
        existingMovie.save()
    }
    catch (e) {
        console.log(e);
        return res.status(500).send("Something wWong,Unable To Create The Reservation")
    }
    if (!reservation) {
        return res.status(500).json({ message: "Unable To Create A Reservation" });
    }

    return res.status(201).json({ reservation });
})

