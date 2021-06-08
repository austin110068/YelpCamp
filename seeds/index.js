if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
  }

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const name = `${sample(descriptors)} ${sample(places)}`;
        const price = Math.floor(Math.random() * 20) + 10;
        const location = `${cities[random1000].city}, ${cities[random1000].state}`
        const geoData = await geocoder.forwardGeocode({
            query: location,
            limit: 1
        }).send()

        const camp = new Campground({
            author: '60bb2d558a4271b30740cf93',
            location: location,
            title: name,
            description: 'lorem',
            price,
            geometry: geoData.body.features[0].geometry,
            images: [
                {
                    url: 'https://res.cloudinary.com/yelpcampproject110068/image/upload/v1623023372/YelpCamp/sj2f3p8dzsmdyamkdxuc.jpg',
                    filename: 'YelpCamp/sj2f3p8dzsmdyamkdxuc'
                },
                {
                    url: 'https://res.cloudinary.com/yelpcampproject110068/image/upload/v1623023372/YelpCamp/nfs77tgmcehedzhqfwq2.jpg',
                    filename: 'YelpCamp/nfs77tgmcehedzhqfwq2'
                }
            ]
        });
        await camp.save();
    }
} 

seedDB().then(() => {
    mongoose.connection.close();
});