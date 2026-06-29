const config = require('./env');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'];
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;
