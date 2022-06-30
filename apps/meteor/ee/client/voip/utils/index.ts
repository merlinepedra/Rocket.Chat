import { VoIPUser } from '../../../../client/lib/voip/VoIPUser';
import { EEVoipClient } from '../../lib/voip/EEVoipClient';

export const isOutboundClient = (client: VoIPUser | undefined): client is EEVoipClient => client instanceof EEVoipClient;
