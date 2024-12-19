export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  export const errorHandler = (error, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = error.message;
  
    res.status(statusCode).send({
      message,
      stack: process.env.NODE_ENV === "production" ? null : error.stack,
    });
  };