const userModel = require("../model/user.model")
const sessionModel = require("../model/session.model")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const asyncHandler = require("../utils/asyncHandler")
const ApiError = require("../utils/ApiError")

// register 

const registerController = asyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "name, email, password and role are required");
    }

    const isUserAlreadyExists = await userModel.findOne({
        email
    });

    if (isUserAlreadyExists) {
        throw new ApiError(409, "user already registered with this email");
    }

    const user = await userModel.create({
        name,
        email,
        password,
        role
    });

    const refreshToken = jwt.sign(
        {
            _id: user._id
        },
        process.env.JWT_SEC,
        {
            expiresIn: "7d"
        }
    );

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign(
        {
            _id: user._id,
            sessionId: session._id
        },
        process.env.JWT_SEC,
        {
            expiresIn: "10m"
        }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
        message: "user created successfully",
        user: {
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken
    });

});

//login

const loginController = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "please provide email and password");
    }

    const user = await userModel
        .findOne({ email })
        .select("+password");

    if (!user) {
        throw new ApiError(404, "no user found with this email, create new account");
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
        throw new ApiError(401, "incorrect password");
    }

    const refreshToken = jwt.sign(
        {
            _id: user._id
        },
        process.env.JWT_SEC,
        {
            expiresIn: "7d"
        }
    );

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const accessToken = jwt.sign(
        {
            _id: user._id,
            sessionId: session._id
        },
        process.env.JWT_SEC,
        {
            expiresIn: "10m"
        }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        message: "user logged in successfully",
        user,
        accessToken
    });

});

// refresh token

const refreshAccessTokenController = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError(400, "refresh token not found");
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SEC
    );

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        throw new ApiError(401, "session not found");
    }

    const user = await userModel.findById(decoded._id);

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    if (session.user.toString() !== user._id.toString()) {
        throw new ApiError(401, "invalid session");
    }

    const accessToken = jwt.sign(
        {
            _id: user._id,
            sessionId: session._id
        },
        process.env.JWT_SEC,
        {
            expiresIn: "15m"
        }
    );

    return res.status(200).json({
        message: "access token generated successfully",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        accessToken
    });

});

//logout

const logoutController = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError(400, "refresh token not found");
    }

    jwt.verify(
        refreshToken,
        process.env.JWT_SEC
    );

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        throw new ApiError(404, "session already revoked");
    }

    session.revoked = true;

    await session.save();

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    return res.status(200).json({
        message: "user logged out successfully"
    });

});

const logoutAllController = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new ApiError(400, "refresh token not found");
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SEC
    );

    const user = await userModel.findById(decoded._id);

    if (!user) {
        throw new ApiError(404, "user not found");
    }

    await sessionModel.updateMany(
        {
            user: user._id,
            revoked: false
        },
        {
            $set: {
                revoked: true
            }
        }
    );

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    });

    return res.status(200).json({
        message: "logged out from all devices successfully"
    });

});

module.exports={registerController,loginController,refreshAccessTokenController,logoutController}