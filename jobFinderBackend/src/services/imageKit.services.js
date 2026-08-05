const ImageKit = require("@imagekit/nodejs");

const client = new ImageKit({
    privateKey: process.env.PRIVATE_KEY
});

async function uploadResume(file) {

    const response = await client.files.upload({
        file: file,
        fileName: "resume_" + Date.now() + ".pdf",
        folder: "/candidateResume"
    });

    return response;
}

async function uploadProfilePhoto(file) {

    const response = await client.files.upload({
        file: file,
        fileName: "profilePhoto_" + Date.now(),
        folder: "/candidateProfile"
    });

    return response;
}

async function uploadCompanyLogo(file) {

    const response = await client.files.upload({
        file: file,
        fileName: "companyLogo_" + Date.now(),
        folder: "/companyLogo"
    });

    return response;
}

async function deleteFile(fileId) {

    const response = await client.files.delete(fileId)
    
    return response;
    
}

module.exports = {
    uploadResume,
    uploadProfilePhoto,
    uploadCompanyLogo,
    deleteFile
};