
const mongoose=require('mongoose');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground');
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser:true
});

const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
});
const sample=(array)=>{
    return array[Math.floor(Math.random()*array.length)];
}
const seedDB=async()=>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++){
        const random1000=Math.floor(Math.random()*cities.length);
        const price=Math.floor(Math.random()*20)+10;
        const camp=new Campground({
            author:'65fb10897c49212bef48667b',
            location:`${cities[random1000].city},${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates ipsa repellendus, dolorem animi dolore minus totam ullam voluptate ab quo! Minus dolore delectus est cumque! Vero, voluptatum suscipit.fugit nemo. Natus eius, quaerat quisquam quae ducimus distinctio, nesciunt, sint nisi temporibus ut magnam. Animi rem cum magnam rerum vero!",
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude,
            ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dsj2xv4tt/image/upload/v1713973529/YelpCamp/yhw0jln3ksw6utdukpmy.jpg',
                  filename: 'YelpCamp/yhw0jln3ksw6utdukpmy',
                },
                {
                  url: 'https://res.cloudinary.com/dsj2xv4tt/image/upload/v1713973529/YelpCamp/t9fdlbhg2egbqqdibway.jpg',
                  filename: 'YelpCamp/t9fdlbhg2egbqqdibway',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})