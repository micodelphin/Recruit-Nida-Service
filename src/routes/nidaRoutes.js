const express = require('express');
const router = express.Router();
const {
  getNIDAProfile,
  getNIDAByEmail,
  createNIDAProfile,
  getAllNIDAProfiles,
} = require('../controllers/nidaController');

router.get('/', getAllNIDAProfiles);
router.get('/verify-email/:email', getNIDAByEmail);
router.get('/:nationalId', getNIDAProfile);
router.post('/', createNIDAProfile);

module.exports = router;