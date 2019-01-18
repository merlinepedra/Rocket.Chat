// import { Meteor } from 'meteor/meteor';
// const msgStream = new Meteor.Streamer('room-messages');
// this.msgStream = msgStream;

// msgStream.allowWrite('none');

// msgStream.allowRead(function(eventName, args) {
// 	try {
// 		const room = Meteor.call('canAccessRoom', eventName, this.userId, args);

// 		if (!room) {
// 			return false;
// 		}

// 		if (room.t === 'c' && !RocketChat.authz.hasPermission(this.userId, 'preview-c-room') && !RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(room._id, this.userId, { fields: { _id: 1 } })) {
// 			return false;
// 		}

// 		return true;
// 	} catch (error) {
// 		/* error*/
// 		return false;
// 	}
// });

// msgStream.allowRead('__my_messages__', 'all');

// msgStream.allowEmit('__my_messages__', function(eventName, msg, options) {
// 	try {
// 		const room = Meteor.call('canAccessRoom', msg.rid, this.userId);

// 		if (!room) {
// 			return false;
// 		}

// 		options.roomParticipant = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId(room._id, this.userId, { fields: { _id: 1 } }) != null;
// 		options.roomType = room.t;
// 		options.roomName = room.name;

// 		return true;
// 	} catch (error) {
// 		/* error*/
// 		return false;
// 	}
// });
