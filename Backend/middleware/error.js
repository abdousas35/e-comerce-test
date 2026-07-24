import HandelError from "../utils/handelError.js";

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong Mongoose Object ID Error
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new HandelError(message, 404);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new HandelError(message, 400);
    }

    // Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = "JSON Web Token is invalid. Try Again!!!";
        err = new HandelError(message, 400);
    }

    // Expired JWT error
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is expired. Try Again!!!";
        err = new HandelError(message, 400);
    }

    // Log the error for debugging
    console.error("[ERROR_MIDDLEWARE]", {
        method: req.method,
        path: req.originalUrl,
        statusCode: err.statusCode,
        message: err.message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : 'stack hidden in production'
    });

    if (process.env.NODE_ENV === 'production') {
        let message = err.message;
        // For unhandled errors, send a generic message
        if (err.statusCode === 500 && !err.isOperational) {
            message = "Internal Server Error";
        }

        return res.status(err.statusCode).json({
            success: false,
            message: message
        });
    } else {
        // In development, send detailed error
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }
};
