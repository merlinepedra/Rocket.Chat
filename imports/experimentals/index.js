
// if(Meteor.isServer && process.env.EXPERIMENTALS) {
import * as Hub from 'rocket.chat.hub';
import * as Broker from 'rocket.chat.core';
import * as Streamer from 'rocket.chat.mqtt';
const mq = Hub.prepareMq();
const Service = Streamer.createService({ mq });
Broker.applyServices(Service);
Service.start().then(() => {
	Hub.createHub({ mq });
});

if (global.gc) {
	console.log('global.gc();');
	setInterval(global.gc, 15000);
}
// }
