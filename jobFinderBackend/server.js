require("dotenv").config()
const app = require("./src/app")
const connectDB = require("./src/db/db")


function startServer(){
    try {
        connectDB();
        app.listen(3000,()=>{
            console.log("server started with port 3000")
        })
  
    } catch (error) {
        console.log("cannot connect with server",error)
    }
}

startServer();


