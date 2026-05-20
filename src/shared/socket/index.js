const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/jwt.utils');
const { UserProfile } = require('../../services/user/user.model');
const { Conversation } = require('../../services/chat/chat.model');

let io;

const userRoom = (profileId) => `user:${profileId}`;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication token required.'));
      }

      const decoded = verifyAccessToken(token);
      const profile = await UserProfile.findOne({ authId: decoded.userId }).select('_id username displayName avatar');

      if (!profile) {
        return next(new Error('Profile not found.'));
      }

      socket.user = decoded;
      socket.profile = profile;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', async (socket) => {
    socket.join(userRoom(socket.profile._id));

    const conversations = await Conversation.find({ participants: socket.profile._id }).select('_id');
    conversations.forEach((conversation) => {
      socket.join(conversationRoom(conversation._id));
    });

    socket.emit('socket:ready', {
      profileId: socket.profile._id,
      username: socket.profile.username,
    });

    socket.on('conversation:join', async (conversationId, ack) => {
      try {
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.profile._id,
        }).select('_id');

        if (!conversation) {
          throw new Error('Conversation not found.');
        }

        socket.join(conversationRoom(conversationId));
        ack?.({ success: true });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationRoom(conversationId));
    });
  });

  return io;
};

const emitToUser = (profileId, event, payload) => {
  if (!io || !profileId) return;
  io.to(userRoom(profileId)).emit(event, payload);
};

const emitToUsers = (profileIds = [], event, payload) => {
  if (!io) return;
  profileIds.forEach((profileId) => emitToUser(profileId, event, payload));
};

const emitToConversation = (conversationId, event, payload) => {
  if (!io || !conversationId) return;
  io.to(conversationRoom(conversationId)).emit(event, payload);
};

module.exports = {
  initSocket,
  emitToUser,
  emitToUsers,
  emitToConversation,
};
