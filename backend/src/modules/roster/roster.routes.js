const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { requirePerm } = require('../../middleware/requirePerm');
const ctrl = require('./roster.controller');

const router = express.Router();

// El permiso varía según la sede (farm vs. liceo) — se resuelve por middleware
// dinámico leyendo req.query.location / req.params.location.
function requireRosterPerm(getLocation) {
  return (req, res, next) => {
    const location = getLocation(req);
    const perm = location === 'liceo' ? 'liceo' : 'farm';
    return requirePerm(perm)(req, res, next);
  };
}

router.get('/roster', requireAuth, requireRosterPerm((req) => req.query.location), ctrl.getRoster);
router.post('/roster', requireAuth, requireRosterPerm((req) => req.body.location), ctrl.postRoster);
router.delete('/roster/:employeeId', requireAuth, requireRosterPerm((req) => req.query.location), ctrl.deleteRosterMember);

router.get('/roster/:location/daily', requireAuth, requireRosterPerm((req) => req.params.location), ctrl.getDaily);
router.post('/roster/:location/save-day', requireAuth, requireRosterPerm((req) => req.params.location), ctrl.postSaveDay);

module.exports = router;
