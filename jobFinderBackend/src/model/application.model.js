const mongoose = require("mongoose")

const applicationSchema = new mongoose.Schema({
    candidate:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"candidate"
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"job"
    },
    status:{
        type:String,
        enum:{
            values:["applied","accepted","rejected"],
            message:"values can be applied accepted or rejected"
        },
        default:"applied"
    }
},{
    timestamps:true
})

const applicationModel = mongoose.model("application",applicationSchema)

module.exports=applicationModel;