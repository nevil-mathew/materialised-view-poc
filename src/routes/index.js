'use strict';
const router = require('express').Router();
const { getData, triggerViewRebuild, triggerPeriodicViewRefresh } = require('@controllers/data');

router.post('/get-data', getData);
router.get('/triggerViewRebuild', triggerViewRebuild);
router.get('/triggerPeriodicViewRefresh', triggerPeriodicViewRefresh);

module.exports = router;
