const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const CarSchema = new Schema({
    title: String,
    license_plate: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    arrival_time:
    {
        type: Date,
        default: Date.now
    },
    owner: String,
});




module.exports = mongoose.model('Car', CarSchema);
