const express = require('express');
const router = express.Router();
// const Campground= require('../models/campground');
const catchAsync= require('../utils/catchAsync');
const campgrounds= require('../controllers/campgrounds');
const {isLoggedIn,isAuthor,validateCampground} = require('../middleware');
const multer  = require('multer')
const {storage}=require('../cloudinary/index');
const upload = multer({storage});

router.route('/')
      .get(catchAsync(campgrounds.index))
      .post(isLoggedIn,upload.array('image'),validateCampground,catchAsync(campgrounds.createCampground));
      

router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
      .get(catchAsync(campgrounds.showCampground))
      .put(isLoggedIn,isAuthor,upload.array('image') ,validateCampground, catchAsync(campgrounds.updateCampground))
      .delete(isLoggedIn,isAuthor, catchAsync(campgrounds.deleteCampground))


//order matters that new shoyuld be above :id route
// or else new is treated a id and fails to find that id

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));






module.exports = router;