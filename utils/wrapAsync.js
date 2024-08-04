module.exports=func=>{//this func is what u pass in
    return (req,res,next)=>{
        func(req,res,next).catch(next);
    }//and then this returns a new function after it runs the function and catches the error
}