const multer = require("multer");

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {

    if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF files are allowed"), false);
    }

    cb(null, true);
}

function profileFilter(req,file,cb){

    if(
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/jpeg" &&
        file.mimetype !== "image/jpg" &&
        file.mimetype !== "image/webp"
    ){
        return cb(new Error("Only image files are allowed"),false);
    }

    cb(null,true);
}

const uploadResume = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

const uploadProfile = multer({
    storage:storage,
    fileFilter:profileFilter,
    limits:{
        fileSize:5*1024*1024
    }
})

module.exports = {uploadResume,uploadProfile}