const User=require('../models/user');

module.exports.renderRegister=(req,res)=>{
    res.render('users/register');
}

module.exports.createUser=async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const newUser=new User({email,username});
        const registeredUser=await User.register(newUser,password);//passport gives us this to create new users
        req.login(registeredUser,err=>{
            if(err) return next(err);
            req.flash('success','Welcome to City Camp');
            res.redirect('/campgrounds');
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
    
};

module.exports.renderLogin=(req,res)=>{
    res.render('users/login');
};

module.exports.loginUser=(req,res)=>{//passport gives us a middleware that we use to authenticate users
    req.flash('success','welcome back!');
    const redirectUrl=res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout=(req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};