function roleMiddleware(allowedRole) {
    return function (req, res, next) {

        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized. Please login first."
            });
        }

        if (req.user.role !== allowedRole) {
            return res.status(403).json({
                message: "Forbidden. You are not authorized to access this resource."
            });
        }

        next();
    };
}

module.exports = { roleMiddleware };