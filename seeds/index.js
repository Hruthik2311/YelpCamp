const mongoose= require('mongoose');
const Campground= require('../models/campground');

const cities=require('./cities');
const {places,descriptors}= require('./seedHelpers');

require('dotenv').config();

const dbUrl= process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp' ;

mongoose.connect(dbUrl);

// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');


const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
})

const sample =  array =>array[Math.floor(Math.random()* array.length)];

const seedDB= async()=>{
    await Campground.deleteMany({});
   for(let i=0;i<200;i++){
    const random1000=Math.floor(Math.random()*1000);
    const price= Math.floor(Math.random()*20)+10;
   const camp= new Campground({
        author: '66aa081276de2e5a1a285819',
        location:`${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, tempora voluptates adipisci facere cum laborum esse exercitationem maiores sapiente fuga qui, unde magnam quidem asperiores ratione distinctio repellat, reprehenderit fugiat',
        price,
        geometry:{
         type:"Point",
         coordinates:[
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
        },
       images: [
            {
              url:'https://res.cloudinary.com/dfj7flign/image/upload/v1722839116/YelpCamp/lgqtzwhec32zscspdgx8.jpg',
              filename:'YelpCamp/lgqtzwhec32zscspdgx8',
            },
            {
              url:'https://res.cloudinary.com/dfj7flign/image/upload/v1722839121/YelpCamp/pvdr1ofopjifo3xityo3.jpg',
              filename:'YelpCamp/pvdr1ofopjifo3xityo3',
            }
          ]
    })
    await camp.save();
   }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
