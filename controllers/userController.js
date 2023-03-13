const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");



exports.signup = BigPromise(async (req, res, next) =>
{   
    if(!req.files){
      return next(new CustomError("photo is required for signup", 400));
    }
    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        folder: "users",
        width: 150,
        crop: "scale"
    })

    const {name, email, password} =req.body;

    if(!email || !name || !password){
        return next(new CustomError('Name, email and password are required', 400))
    }

    const user = await User.create({
        name,
        email,
        password,
        photo:{
            id:result.public_id,
            secure_url:result.secure_url,
        }
    })

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
     const {email, password} = req.body;

     // check for presence of email and password 
     if(!email || !password){
        return next(new CustomError('please provide a email and password', 400));
     }
     
     // get user form db
     const user = await User.findOne({email}).select("+password");

     // if user not found in db
     if(!user){
        return next(new CustomError('You are not a registered user, Register first', 400));
     }

     // match the password
     const iSPasswordCorrect = await user.iSPasswordValidated(password);

     // if password does not match
     if(!iSPasswordCorrect){
        return next(new CustomError('Wrong Password, Please check it', 400));
     }

     // if all goes good and we send a jwt token
     cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "logout succes"
    })
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const{email} = req.body;

    // finding a user with above email
    const user = await User.findOne({email});
    
    // confirming if the user exist
    if(!user)
    {
        return next(new CustomError(`Email not registered`, 400))
    }

    // generating forgotpassword token , method already written in models/user.js
    const forgotToken = user.getForgotPasswordToken();

    //saving all updated user fields in database
    await user.save({validateBeforeSave: false})
    
    //creating specified url 
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`

    // Instruction how to use the above url
    const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

    // trying to send a email
    try {
    await mailHelper({
        email: user.email,
        subject: "Drip Store - Password reset email",
        message
    });

    // json response if email is sent
    res.status(200).json({
        success: "true",
        message: "Email sent succesfully"
    })
    } catch (error) {
        //reset user field if email is not sent
        user.forgotPasswordExpiry=undefined
        user.forgotPasswordToken= undefined
        await user.save({validateBeforeSave: false})

        return next(new CustomError(error.message, 500))
    }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex');

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: {$gt: Date.now()}
    })

  if(!user){
    return next(new CustomError(`Token is invalid or Expired`, 400));
  }

  if(req.body.password !== req.body.confirmPassword){
    return next(new CustomError(`Password and confirm password do not match`, 400));
  }

  user.password = req.body.password;

  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  await user.save()

  //send a json response or token

  cookieToken(user, res);
  
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id

  const user =await User.findById(userId).select("+password");
  //console.log(user);
  const isPasswordCorrect = await user.iSPasswordValidated(req.body.oldPassword);

  if(!isPasswordCorrect){
    return next(new CustomError('Old password is incorrect', 400))
  }

  user.password= req.body.newPassword;
  await user.save()

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
    }

    if(req.files)
    {
        const user = await User.findById(req.user.id);

        const photoId = user.photo.id;

        const response = await cloudinary.v2.uploader.destroy(photoId);

        let file = req.files.photo;

        const result = await cloudinary.v2.uploader.upload(file.tempFilePath,{
        folder: "users",
        width: 150,
        crop: "scale"
        });

        newData.photo={
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData , {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
 });

exports.adminAllUser = BigPromise(async (req, res, next) => {
   const users = await User.find()

   res.status(200).json({
    success: true,
    users, 
   })
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
     const user =await User.findById(req.params.id);
     
     if(!user){
        next(new CustomError("NO user found", 400));
     }
     res.status(200).json({
        succes: true,
        user
     })
 });

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newData , {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    
    res.status(200).json({
        success: true,
        user
    })
 });

exports.adminDeletingParticularUser = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    

    if(!user){
        return next(new CustomError("No such user found", 401))
    }
    
    const imageId = user.photo.id;
    
    await cloudinary.v2.uploader.destroy(imageId);

    await user.remove();

    res.status(200).json({
        succes: true,
    })
 });

exports.managerAllUser = BigPromise(async (req, res, next) => {
    const users = await User.find({role: 'user'})
 
    res.status(200).json({
     success: true,
     users, 
    })
 });
