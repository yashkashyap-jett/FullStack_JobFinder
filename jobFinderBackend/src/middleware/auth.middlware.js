const jwt = require("jsonwebtoken")
const sessionModel = require("../model/session.model")
const userModel = require("../model/user.model")




async function authMiddleware(req,res,next){

    try {
        
       const accessToken = req.headers.authorization?.split(" ")[1]

        if(!accessToken){
            return res.status(400).json({
                Message:"access is not present"
            })
        }

        const decoded = jwt.verify(accessToken,process.env.JWT_SEC)


        const session = await sessionModel.findOne({
            _id:decoded.sessionId,
            revoked:false
        })

        if(!session){
            return res.status(401).json({
                message:"no session found"
            })
        }

        const user = await userModel.findOne({_id:session.user
        })

        if(!user){
            return res.status(404).json({
                message:"user not found"
            })

        }

        req.user = user;
        req.session = session;

        next()




    } catch (error) {
        console.log("error arises in authMiddleware",error)
        return res.status(401).json({
            Message:"internal server error in authMiddleware"
        })
    }
}

module.exports = {authMiddleware}