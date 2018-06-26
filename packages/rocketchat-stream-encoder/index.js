import messages from './lib/Message';

const encoders = {
	message: ([msg]) => {
		msg.u = msg.u._id;
		return messages.Message.encode(msg);
	}
};

const decoders = {
	message: payload => messages.Message.decode(payload)
};

export const encoder = name => {
	return encoders[name] || EJSON.stringify;
};

export const decoder = name => {
	return decoders[name] || EJSON.parse;
};
