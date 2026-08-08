import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcryptjs';

const STARTING_CREDITS =20;
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true,
        maxlength: 32
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,
    },
    passwordHash:{
        type:String,
        required:true,


    },
    credits:{
        type:Number,
        default: STARTING_CREDITS,
        min:0,
    },
    emailVerified:{
        type: Boolean,
        default: true,
    }
}, {
    timestamps:true
});


// return only user non-sensitive info taht the frontend needs , instead of 
// revealing the complete datbase record
userSchema.methods.toClient = function(){ //this function says take the user from the db and create a new , safe version of user that see only info frontend require
    return{
        id: this._id.toString(),
        name: this.name,
        email: this.email,
        credits: this.credits,
        emailVerified: Boolean(this.emailVerified),
        createdAt: this.createdAt
    }
}   //here toClient() means Security fiber (no password sent) : safe user sent to frontend means: expect password all the things


//password hash:
userSchema.statics.hashPassword = function(plain){
    return bcrypt.hash(plain,10);
};

// verify hash password with the user password:
userSchema.methods.verifyPassword = function(plain){
    return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.STARTING_CREDITS = STARTING_CREDITS;

export const User = mongoose.model("User", userSchema);