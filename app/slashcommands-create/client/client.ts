import { slashCommands } from '../../utils/lib/slashCommand';

slashCommands.add('create', null, {
	description: 'Create_A_New_Channel',
	params: '#channel',
	permission: ['create-c', 'create-p'],
});
