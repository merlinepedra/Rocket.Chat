import { ServiceBroker } from 'moleculer';
import metrics from './index';

import config from './config';
const broker = new ServiceBroker(config);

broker.createService(metrics);
broker.start();
export default broker;
