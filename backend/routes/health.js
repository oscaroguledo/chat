const express = require('express');
const router = express.Router();
const Response = require('@/core/utils/response');

router.get('/', (req, res) => {
  Response.success(res, { status: 'ok' }, 'Server is healthy');
});

module.exports = router;
