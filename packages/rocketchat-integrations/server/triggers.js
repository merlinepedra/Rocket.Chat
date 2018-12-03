import { RocketChat } from 'meteor/rocketchat:lib';

const callbackHandler = function _callbackHandler(eventType) {
	return function _wrapperFunction(...args) {
		return RocketChat.integrations.triggerHandler.executeTriggers(eventType, ...args);
	};
};

RocketChat.callbacks.add('afterSaveMessage', callbackHandler('sendMessage'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterCreateChannel', callbackHandler('roomCreated'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterCreatePrivateGroup', callbackHandler('roomCreated'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterCreateUser', callbackHandler('userCreated'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterJoinRoom', callbackHandler('roomJoined'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterLeaveRoom', callbackHandler('roomLeft'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterRoomArchived', callbackHandler('roomArchived'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
RocketChat.callbacks.add('afterFileUpload', callbackHandler('fileUploaded'), RocketChat.callbacks.priority.LOW, 'rocketchat-integrations');
