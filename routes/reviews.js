const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync'); 
const {validateReview,isLoggedIn,isReviewAuthor}=require('../middleware');
const reviews=require('../controllers/reviews');
const Review=require('../models/review');
const Campground=require('../models/campground');
router.post('/',isLoggedIn,validateReview,wrapAsync(reviews.newReview));
    
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,wrapAsync(reviews.deleteReview));
module.exports=router;