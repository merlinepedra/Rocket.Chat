import { useCallClient } from '../../../client/contexts/CallContext';
import { EEVoipClient } from '../lib/voip/EEVoipClient';
import { isOutboundClient } from '../voip/utils';
import { useHasLicense } from './useHasLicense';

export const useOutboundDialer = (): EEVoipClient | null => {
	const voipClient = useCallClient();
	const isEnterprise = useHasLicense('voip-enterprise') === true;
	const isOutbound = isOutboundClient(voipClient);

	return isEnterprise && isOutbound ? voipClient : null;
};
