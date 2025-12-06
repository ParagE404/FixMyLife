export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(400).json({
        error: 'Unique constraint violated',
        field: err.meta.target,
      });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

export const throwError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};
