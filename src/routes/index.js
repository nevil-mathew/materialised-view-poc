'use strict';
const router = require('express').Router();
const { getData, triggerViewRebuild } = require('@controllers/data');

router.post('/get-data', getData);
router.get('/triggerViewRebuild', triggerViewRebuild);

module.exports = router;
