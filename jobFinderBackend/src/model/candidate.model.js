const mongoose = require("mongoose")

const candidateSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    skills:{
        type:String,
        required:[true,"please provide some skills for job"],
    },
    education:{
        type:String,
        required:[true,"please provide whats you education"]
    },
    experience:{
        type:Number,
        required:[true,"please provide you exp in years"]
    },
    resumeUrl:{
        type:String
    },
    resumeFileId:{
        type:String
    },
    profilePhotoUrl:{
        type:String
    },
    profilePhotoFileId:{
        type:String
    }
})

const candidateModel = mongoose.model("candidate",candidateSchema)

module.exports=candidateModel;