const { Conversation, Message } = require('./chat.model');
const { UserProfile } = require('../user/user.model');
const { emitToConversation, emitToUsers } = require('../../shared/socket');

const conversationPopulate = (query) => query
  .populate('participants', 'username displayName avatar')
  .populate({
    path: 'lastMessage',
    populate: { path: 'sender', select: 'username displayName avatar' },
  })
  .select('-__v');

const getProfileOrThrow = async (authId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

const createConversation = async (authId, { participantIds, isGroup = false, groupName }) => {
  const profile = await getProfileOrThrow(authId);
  const participantSet = [...new Set([profile._id.toString(), ...participantIds])];

  const participants = await UserProfile.find({ _id: { $in: participantSet } }).select('_id');
  if (participants.length !== participantSet.length) {
    const err = new Error('One or more participants were not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!isGroup && participantSet.length === 2) {
    const existing = await Conversation.findOne({
      isGroup: false,
      participants: { $all: participantSet, $size: 2 },
    });

    if (existing) {
      const existingConversation = await conversationPopulate(Conversation.findById(existing._id));
      emitToUsers(participantSet, 'conversation:new', existingConversation);
      return existingConversation;
    }
  }

  const conversation = await Conversation.create({
    participants: participantSet,
    isGroup,
    groupName,
  });

  const populatedConversation = await conversationPopulate(Conversation.findById(conversation._id));
  emitToUsers(participantSet, 'conversation:new', populatedConversation);

  return populatedConversation;
};

const getMyConversations = async (authId) => {
  const profile = await getProfileOrThrow(authId);

  return conversationPopulate(
    Conversation.find({ participants: profile._id })
      .sort({ updatedAt: -1 })
  );
};

const getMessages = async (authId, conversationId, { page = 1, limit = 30 } = {}) => {
  const profile = await getProfileOrThrow(authId);
  const conversation = await Conversation.findOne({ _id: conversationId, participants: profile._id });

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const skip = (Number(page) - 1) * Number(limit);

  return Message.find({ conversation: conversationId, isDeleted: false })
    .populate('sender', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-__v');
};

const sendMessage = async (authId, payload) => {
  const profile = await getProfileOrThrow(authId);
  const conversation = await Conversation.findOne({
    _id: payload.conversationId,
    participants: profile._id,
  });

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: profile._id,
    content: payload.content,
    media: payload.media,
    readBy: [profile._id],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username displayName avatar')
    .select('-__v');

  emitToConversation(conversation._id, 'message:new', {
    conversationId: conversation._id,
    message: populatedMessage,
  });

  emitToUsers(conversation.participants, 'conversation:updated', {
    conversationId: conversation._id,
    lastMessage: populatedMessage,
    updatedAt: conversation.updatedAt,
  });

  return populatedMessage;
};

const markConversationRead = async (authId, conversationId) => {
  const profile = await getProfileOrThrow(authId);
  const conversation = await Conversation.findOne({ _id: conversationId, participants: profile._id });

  if (!conversation) {
    const err = new Error('Conversation not found.');
    err.statusCode = 404;
    throw err;
  }

  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: profile._id } },
    { $addToSet: { readBy: profile._id } }
  );

  emitToConversation(conversationId, 'conversation:read', {
    conversationId,
    profileId: profile._id,
  });

  return { read: true };
};

module.exports = {
  createConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markConversationRead,
};
