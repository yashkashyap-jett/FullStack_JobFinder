const mongoose = require("mongoose")

const bookmarkSchema = new mongoose.Schema({
    candidate:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"candidate"
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"job"
    }
},{
    timestamps:true
})

bookmarkSchema.index({candidate:1, job:1},{unique:true})

const bookmarkModel = mongoose.model("bookmark",bookmarkSchema);

module.exports=bookmarkModel;

