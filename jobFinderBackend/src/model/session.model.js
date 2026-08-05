const mongoose = require("mongoose")


const sessionSchema = new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:[true,"user is required"]
    },
    refreshTokenHash:{
        type:String,
        required:[true,"refresh token hash is required to create an session"]
    },
    ip:{
        type:String,
        required:[true,"ip is required to create an session"]
    },
    userAgent:{
        type:String,
        required:[true,"userAgents are required"]
    },
    revoked:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

const sessionModel = mongoose.model("session",sessionSchema)

module.exports=sessionModel;