const errorResponseHandler = (error, request, response, next) => {
    console.log("Middleware Error Handling")
    const errStatus = error.statusCode || 500;
    const errMsg = error.message || 'Something went wrong';
    response.status(statusCode).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: process.env.NODE_ENV === "development" ? null : error.stack,
    });
} 

const invalidPathHandler = (request, response, next) => {
    let error = newError("Invalid Path");
    error.statusCode = 404;
    next(error);
}

module.exports = { errorResponseHandler, invalidPathHandler };