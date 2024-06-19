const mongoose= require('mongoose');
const Campground= require('../models/campground');

const cities=require('./cities');
const {places,descriptors}= require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
})

const sample =  array =>array[Math.floor(Math.random()* array.length)];

const seedDB= async()=>{
    await Campground.deleteMany({});
   for(let i=0;i<50;i++){
    const random1000=Math.floor(Math.random()*1000);
    const price= Math.floor(Math.random()*20)+10;
   const camp= new Campground({
        location:`${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image:'https://images.unsplash.com/photo-1718354668365-993c89903d7c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOXx8fGVufDB8fHx8fA%3D%3D',
        description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam, tempora voluptates adipisci facere cum laborum esse exercitationem maiores sapiente fuga qui, unde magnam quidem asperiores ratione distinctio repellat, reprehenderit fugiat',
        price
    })
    await camp.save();
   }
}

seedDB().then(()=>{
    mongoose.connection.close();
})
