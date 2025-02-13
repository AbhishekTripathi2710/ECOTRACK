const userModel = require('../models/userModel');
const {validationResult} = require('express-validator');
const userService = require('../services/userServices')
const blacklistTokenModel = require('../models/blacklistTokenModel')

module.exports.userRegister = async(req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {fullname,gender,email,password,country} = req.body;

    const isUserAlreadyExists = await userModel.findOne({email});
    if(isUserAlreadyExists){
        return res.status(400).json({message:'User already exist'});
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname:fullname.lastname,
        gender,
        email,
        password: hashedPassword,
        country
    })

    const token = user.generateAuthToken();

    res.status(201).json({token,user});
}


module.exports.userLogin = async(req,res,next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;

    const user = await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(401).json({message:'Invalid Email or Password'});
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(401).json({message:'Invalid password!!'});
    }

    const token = user.generateAuthToken();

    res.cookie('token',token);


    res.status(200).json({token, user});
}

module.exports.userProfile = async (req,res,next) => {
    res.status(200).json(req.user);
}

module.exports.logoutUser = async(req,res,next)=>{
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({token});
    res.status(200).json({message:'Logged out'});
}