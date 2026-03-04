module.exports = (err, req, res, next) => {
    console.error(err);

    res.status(status).json({
    success: false,
    message,
    requestId,
    details: err.details, 
});

};