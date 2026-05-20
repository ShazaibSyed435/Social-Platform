const router = require('express').Router();
const { protect } = require('../../shared/middlewares/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');
const { validateConversation, validateMessage } = require('./chat.model');
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
} = require('./chat.controller');

router.use(protect);

router.post('/conversations', validate(validateConversation), createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.patch('/conversations/:conversationId/read', markConversationRead);
router.post('/messages', validate(validateMessage), sendMessage);

module.exports = router;
