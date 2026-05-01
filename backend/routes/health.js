const express = require('express');
const router = express.Router();
const Response = require('@/core/utils/response');

router.get('/', (req, res) => {
  Response(res, {
    success: true,
    data: { status: 'ok' },
    message: 'Server is healthy',
    statusCode: 200
  });
});

module.exports = router;
