const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid post ID' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: 'A post with this slug already exists' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body contains invalid JSON' });
  }
  if (error.status && error.status < 500) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error('Unhandled API error:', error);
  return res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
