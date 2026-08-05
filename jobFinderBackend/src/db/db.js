const mongoose = require("mongoose")


async function connectDB(){
    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("connect with database successfully")
        
    } catch (error) {
        console.log("can-not connect with DataBase with error",error)
    }
}


module.exports=connectDB;