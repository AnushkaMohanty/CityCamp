if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}

const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/ExpressError');
const flash=require('connect-flash');
const session=require('express-session');
const User=require('./models/user');
// const mongoSanitize=require('express-mongo-sanitize');
const campgroundsRoutes=require('./routes/campgrounds');
const reviewsRoutes=require('./routes/reviews');
const MongoDBStore=require("connect-mongo")(session);
const passport=require('passport');
const userRoutes=require('./routes/users');
const LocalStrategy=require('passport-local');
const helmet=require('helmet');
// const dbUrl=process.env.DB_URL;
const dbUrl='mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
// mongoose.connect(dbUrl,{
//     useNewUrlParser:true,
// });
const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("database connected");
})
const app=express();
app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true}));
app.use(flash());
app.use(methodOverride('_method'));
app.use(helmet({contentSecurityPolicy:false}));
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dsj2xv4tt/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// app.use(mongoSanitize());
const store=new MongoDBStore({
      url:dbUrl,
      secret:'thisshouldbeabettersecret!',
      tochAfter:24*60*60
  });
 store.on("error",function(e){
     console.log("session store error",e);
  })
const sessionConfig={
    store,
    name:'session',
    secret:'thisshouldbeabettersecret!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires:Date.now()+1000*60*60*24+7, //i want the cookie to expire in a week
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));//this has to be present before passport.session
app.use(passport.initialize());
app.use(passport.session());//middleware
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());//storing and unstoring in the session when the user logs in or logs out
passport.deserializeUser(User.deserializeUser());
app.use(express.static(path.join(__dirname,'public')));
app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.use("/campgrounds",campgroundsRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);
app.use('/',userRoutes);
app.get('/',(req,res)=>{
    res.render('home');
})

app.use((err,req,res,next)=>{//the err here is the above express error or other errors
    const {statusCode=500}=err;
    if(!err.message){
        err.message="oh no something went wrong";
    }
    res.status(statusCode).render('error',{err});
});
app.all('*',(req,res,next)=>{
    res.send(new ExpressError('page not found',404) );
})
app.listen(3000,()=>{
    console.log('serving on port 3000');
})



