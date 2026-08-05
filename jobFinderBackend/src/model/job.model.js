const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema({
    title:{
        type:String
    },
    description:{
        type:String
    },
    salary:{
        type:Number
    },
    location:{
        type:String
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
})

const jobModel = mongoose.model("job",jobSchema)

module.exports=jobModel;