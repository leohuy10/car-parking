const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

const Car = require('./models/car');
const User = require('./models/user');


mongoose.connect('mongodb://localhost:27017/parking_management', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res) => {
    res.render('login')
});

app.get('/signup', (req, res) => {
    res.render('signup')
})


app.get('/cars', async (req, res) => {
    const cars = await Car.find({});
    res.render('cars/index', { cars })
});
app.get('/cars/new', (req, res) => {
    res.render('cars/new');
})

app.post('/cars', async (req, res) => {
    const count = await Car.countDocuments({});
    if (count === 50) {
        res.send("No Spaces Available")
    } else {
        const car = new Car(req.body.car);
        car.arrival_time = Date.now()
        await car.save();
        res.redirect(`/cars/${car._id}`)
    }
})

app.get('/cars/:id', async (req, res,) => {
    const car = await Car.findById(req.params.id)
    res.render('cars/show', { car });
});

app.get('/cars/:id/edit', async (req, res) => {
    const car = await Car.findById(req.params.id)
    res.render('cars/edit', { car });
})

app.put('/cars/:id', async (req, res) => {
    const { id } = req.params;
    const car = await Car.findByIdAndUpdate(id, { ...req.body.car });
    res.redirect(`/cars/${car._id}`)
});

app.delete('/cars/:id', async (req, res) => {
    const { id } = req.params;
    await Car.findByIdAndDelete(id);
    res.redirect('/cars');
})

app.post("/home", async (req, res) => {
    const cars = await Car.find({});
    try {
        const check = await User.findOne({ name: req.body.username })
        if (!check) {
            res.send("Username cannot found")
        }
        if (req.body.password === check.password) {
            res.render("cars/index", { cars })
        } else {
            res.send("Wrong password")
        }
    } catch {
        res.send("Wrong details")
    }
})

app.post('/signup', async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const existingUser = await User.findOne({ name: data.name });
    if (existingUser) {
        res.send("User already exists. Please choose a different username.")
    } else {
        const userdata = await User.insertMany(data)
        console.log(userdata)
    }
    res.redirect('/');
})

app.post('/search', async (req, res) => {
    const data = req.body.license_plate;
    try {
        const car = await Car.findOne({ license_plate: data });

        if (car) {
            res.redirect(`/cars/${car._id}`)
        } else {
            res.send("Vehicle cannot found")
        }
    } catch {
        res.send("Vehicle cannot found")
    }
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
})