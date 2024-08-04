const express=require('express');
const router=express.Router();
const User=require('../models/user');
const wrapAsync=require('../utils/wrapAsync');
const passport=require('passport');
const {storeReturnTo}=require('../middleware');
const users=require('../controllers/users');
router.get('/register',users.renderRegister);
router.post('/register',wrapAsync(users.createUser));

router.get('/login',users.renderLogin);
router.post('/login',storeReturnTo,passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),users.loginUser);
router.get('/logout', users.logout);
module.exports=router;