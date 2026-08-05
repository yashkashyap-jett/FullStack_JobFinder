const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"name is required to create an user"]
    },
    email:{
        type:String,
        required:[true,"email is required to create an account"],
        validate:{
            validator:validator.isEmail,
            message:"please enter an correct emial"
        },
        unique:true
    },
    password:{
        type:String,
        required:[true,"password is required to create an user"],
        minlength:[6,"password should be 6 characters long"],
        select:false
    },
   role:{
    type:String,
    enum:{
        values:["candidate","recruiter"],
        message:"role must be candidate or recruiter"
    },
    default:"candidate"
   }
},{timestamps:true})

userSchema.pre("save",async function () {
    if(!this.isModified("password")){
        return;
    }

    const hash = await bcrypt.hash(this.password,10)

    this.password = hash;


})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel;