const express=require('express');
const router=express.Router({mergeParams:true});;
const Campground=require('../models/campground');
const wrapAsync=require('../utils/wrapAsync'); 
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware');
const campgrounds=require('../controllers/campgrounds');
const multer=require('multer');
const {storage}=require('../cloudinary');
const upload=multer({storage});
router.get('/',wrapAsync(campgrounds.index));
router.get('/new',isLoggedIn,campgrounds.renderNewForm);
router.post('/',isLoggedIn,upload.array('image'),validateCampground,wrapAsync(campgrounds.createCampground));//upload wala part is the multer middleware responsible for adding the images to req.body
// router.post('/',upload.array('image'),(req,res)=>{//cannot directly parse multi part form data
//     console.log(req.body,req.files);
//     res.send("it workedd");
// })
router.get("/:id",wrapAsync(campgrounds.getCampgroundById));
router.get('/:id/edit',isLoggedIn,isAuthor,wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
}))
router.put('/:id',isLoggedIn,isAuthor,upload.array('image'),validateCampground,wrapAsync(campgrounds.updateCampground));
router.delete('/:id',isLoggedIn,isAuthor,wrapAsync(campgrounds.deleteCampground));

module.exports=router;