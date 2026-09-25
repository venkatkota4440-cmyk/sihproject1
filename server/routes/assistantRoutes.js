const express = require('express');
const router = express.Router();
const { optionalAuthenticate } = require('../middleware/auth');
const assistantCtrl = require('../controllers/assistantController');

router.post('/chat', optionalAuthenticate, assistantCtrl.chat);
router.post('/voice-context', optionalAuthenticate, assistantCtrl.getVoiceContext);
router.get('/history', optionalAuthenticate, assistantCtrl.getHistory);
router.delete('/history', optionalAuthenticate, assistantCtrl.clearHistory);


module.exports = router;
