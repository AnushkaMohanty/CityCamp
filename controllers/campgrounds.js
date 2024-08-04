const Campground=require('../models/campground');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;
const {cloudinary}=require("../cloudinary");
module.exports.index=async(req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.renderNewForm=(req,res)=>{
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    try {
        const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
        
        if (!geoData || !geoData.features || geoData.features.length === 0) {
            throw new ExpressError('Location not found', 400);
        }
        const campground = new Campground(req.body.campground);
        campground.geometry=geoData.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.author = req.user._id;
        console.log(campground);
        await campground.save();
        req.flash('success', 'Successfully Made A New Campground!');
        res.redirect(`/campgrounds/${campground._id}`);
    } catch (error) {
        next(error);
    }
};

module.exports.getCampgroundById=async(req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground){
        req.flash('error','Cannot find that campground');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
};

module.exports.updateCampground=async(req,res)=>{
    const {id}=req.params;
    console.log(req.body);
    const campground=await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    campground.geometry = geoData.features[0].geometry;
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});//pull operator helps in pulling elements out of an array
        console.log(campground);
    }
    req.flash('success','Successfully updated city')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground=async(req,res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted city!');
    res.redirect('/campgrounds');
};
