const errorHandler = (err, req, res, next) => {
    console.error(err.stack); 
  
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    const message = err.message || 'Something went wrong';
  
    const response = process.env.NODE_ENV === 'production'
      ? { message }
      : { message, stack: err.stack };
  
    res.status(statusCode).json(response);
  };
  
  module.exports = errorHandler;