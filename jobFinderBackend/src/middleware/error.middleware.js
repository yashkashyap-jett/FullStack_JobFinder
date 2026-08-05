function errorMiddleware(error,req,res,next){
    const statusCode = error.statusCode || 500;

    const message = error.message || "internal server error"

    return res.status(statusCode).json({
        message
    })
}

module.exports=errorMiddleware;