if(process.env.NODE_ENV !=="production"){
    require('dotenv').config();
}

const express= require('express');
const path=require('path');
const mongoose= require('mongoose');
const ejsMate= require('ejs-mate');
const ExpressError= require('./utils/ExpressError');
const methodOverride= require('method-override');
const session= require('express-session');
const flash = require('connect-flash');
const passport=require('passport');
const LocalStrategy= require('passport-local');
const User= require('./models/user');
const helmet=require('helmet');

const userRoutes = require('./routes/user');
const campgroundRoutes= require('./routes/campground');
const reviewRoutes= require('./routes/reviews');

const MongoStore = require('connect-mongo');

const mongoSanitize= require('express-mongo-sanitize');

const dbUrl= process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp' ;

mongoose.connect(dbUrl);

const db=mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',()=>{
    console.log('Database connected');
})

const app= express();

app.engine('ejs',ejsMate);
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');


app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());

const secret= process.env.SECRET ||  'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig ={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,
        expires: Date.now()+ 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



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
    "https://api.maptiler.com/"
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
                "https://res.cloudinary.com/dfj7flign/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success= req.flash('success');
    res.locals.error=req.flash('error');
    next();
})




app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes); //prefexing routes with '/campgrounds'
app.use('/campgrounds/:id/reviews',reviewRoutes);// prefexing routes with '/cgs/:id/reviews'


app.get('/',(req,res)=>{
    res.render('home');
})



app.all('*',(req,res,next)=>{
next(new ExpressError('Page Not Found',404));
})


app.use((err,req,res,next)=>{
    const {statusCode=500}= err;
    if(!err.message)err.message='Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{err})
})

const port = 3000;

app.listen(port,()=>{
    console.log('LISTENING ON PORT 3000');
})