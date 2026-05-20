const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const chatService = require('./chat.service');

const createConversation = asyncHandler(async (req, res) => {
  const conversation = await chatService.createConversation(req.user.userId, req.body);
  sendSuccess(res, conversation, 'Conversation created.', 201);
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await chatService.getMyConversations(req.user.userId);
  sendSuccess(res, conversations);
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.user.userId, req.params.conversationId, req.query);
  sendSuccess(res, messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage(req.user.userId, req.body);
  sendSuccess(res, message, 'Message sent.', 201);
});

const markConversationRead = asyncHandler(async (req, res) => {
  const result = await chatService.markConversationRead(req.user.userId, req.params.conversationId);
  sendSuccess(res, result, 'Conversation marked as read.');
});

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
};
