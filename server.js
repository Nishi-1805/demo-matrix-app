// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Updated proxy middleware with timeout settings
app.use(
  "/_matrix",
  createProxyMiddleware({
    target: "https://matrix.org",
    changeOrigin: true,
    secure: true,
    timeout: 60000, // Increase timeout to 60 seconds
    proxyTimeout: 60000,
    pathRewrite: {
      "^/_matrix": "/_matrix",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`⏳ Forwarding request to: ${proxyReq.protocol}://${proxyReq.host}${proxyReq.path}`);
      
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: 'Proxy error occurred', details: err.message });
    }
  })
);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Matrix Proxy Server is Running on port ${PORT}`);
});