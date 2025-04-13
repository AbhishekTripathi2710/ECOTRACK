const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true,
            minlength:[3, 'First name must be at least characters long'],
        },
        lastname:{
            type:String,
            minlength:[3, 'Last name must be at least characters long'],
        }
    },
     email:{
        type:String,
        required:true,
        unique:true,
        minlength:[5,'Email must be at least 5 character long']
    },
    password:{
        type:String,
        required: true,
        select:false
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    }
})

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id}, process.env.JWT_SECRET, {expiresIn:'24h'})
    return token;
}

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password,10);
}

userSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes
    
    this.otp = {
        code: otp,
        expiresAt: expiresAt
    };
    
    return otp;
}

userSchema.methods.verifyOTP = function(otp) {
    if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
        return false;
    }
    
    if (this.otp.expiresAt < new Date()) {
        return false;
    }
    
    return this.otp.code === otp;
}

const userModel = mongoose.model('user',userSchema);

module.exports = userModel;