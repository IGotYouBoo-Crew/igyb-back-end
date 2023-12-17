const errorResponseHandler = (err, req, res, next) => {
    console.log("Middleware Error Handling")
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'Something went wrong';
    res.status(statusCode).json({
        success: false,
        status: errStatus,
        message: err.msg,
        stack: process.env.NODE_ENV === "development" ? null : err.stack,
    });
} 

const invalidPathHandler = (req, res, next) => {
    let error = newError("Invalid Path");
    error.statusCode = 404;
    next(error);
}

module.exports = { errorResponseHandler, invalidPathHandler };