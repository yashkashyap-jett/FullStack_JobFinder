const mongoose = require("mongoose")

const recruiterSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        unique:true
    },
    companyName:{
        type:String,
    },
    companyDescription:{
        type:String
    },
    companyWebsite:{
        type:String
    },
    companyLocation:{
        type:String
    },
    companyLogoUrl: {
    type: String
    },
    companyLogoFileId: {
    type: String
    }
  
},{
    timestamps:true
})

const recruiterModel = mongoose.model("recruiter",recruiterSchema)

module.exports=recruiterModel;