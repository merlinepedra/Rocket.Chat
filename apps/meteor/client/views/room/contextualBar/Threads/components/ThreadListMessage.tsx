import { IMessage } from '@rocket.chat/core-typings';
import { Message, Box, IconButton } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { ComponentProps, memo, ReactElement, ReactNode, UIEventHandler } from 'react';

import RawText from '../../../../../components/RawText';
import UserAvatar from '../../../../../components/avatar/UserAvatar';
import * as NotificationStatus from '../../../../../components/message/NotificationStatus';
import { followStyle, anchor } from '../../../../../components/message/helpers/followSyle';
import { useTimeAgo } from '../../../../../hooks/useTimeAgo';
import { clickableItem } from '../../../../../lib/clickableItem';

type ThreadListMessageProps = {
	mid: IMessage['_id'];
	msg: string;
	following: boolean;
	username: string;
	name: ReactNode;
	ts: Date;
	replies?: number;
	participants: ReactNode;
	onToggleFollowButtonClick: UIEventHandler<HTMLElement>;
	unread: boolean;
	mention: boolean;
	all: boolean;
	tlm?: Date;
	className?: string | string[];
} & Omit<ComponentProps<typeof Message>, 'className'>;

const ThreadListMessage = ({
	mid: _id,
	msg,
	following,
	username,
	name = username,
	ts,
	replies,
	participants,
	onToggleFollowButtonClick,
	unread,
	mention,
	all,
	tlm,
	className = [],
	...props
}: ThreadListMessageProps): ReactElement => {
	const t = useTranslation();
	const formatDate = useTimeAgo();

	return (
		<Box className={[className, !following && followStyle].flat()} paddingBlock={8}>
			<Message clickable {...props}>
				<Message.LeftContainer>
					<UserAvatar username={username} className='rcx-message__avatar' size='x36' />
				</Message.LeftContainer>
				<Message.Container>
					<Message.Header>
						<Message.Name title={username}>{name}</Message.Name>
						<Message.Timestamp>{formatDate(ts)}</Message.Timestamp>
					</Message.Header>
					<Message.Body clamp={2}>
						<RawText>{msg}</RawText>
					</Message.Body>
					<Message.Block>
						<Message.Metrics>
							<Message.Metrics.Item>
								<Message.Metrics.Item.Icon name='thread' />
								<Message.Metrics.Item.Label>{replies}</Message.Metrics.Item.Label>
							</Message.Metrics.Item>
							<Message.Metrics.Item>
								<Message.Metrics.Item.Icon name='user' />
								<Message.Metrics.Item.Label>{participants}</Message.Metrics.Item.Label>
							</Message.Metrics.Item>
							{tlm ? (
								<Message.Metrics.Item>
									<Message.Metrics.Item.Icon name='clock' />
									<Message.Metrics.Item.Label>{formatDate(tlm)}</Message.Metrics.Item.Label>
								</Message.Metrics.Item>
							) : null}
						</Message.Metrics>
					</Message.Block>
				</Message.Container>
				<Message.ContainerFixed>
					<IconButton
						className={anchor}
						small
						icon={following ? 'bell' : 'bell-off'}
						flexShrink={0}
						data-following={following}
						data-id={_id}
						onClick={onToggleFollowButtonClick}
						title={following ? t('Following') : t('Not_Following')}
						aria-label={following ? t('Following') : t('Not_Following')}
					/>
					<Box mb={24}>
						{(mention && <NotificationStatus.Me />) || (all && <NotificationStatus.All />) || (unread && <NotificationStatus.Unread />)}
					</Box>
				</Message.ContainerFixed>
			</Message>
		</Box>
	);
};

export default memo(clickableItem(ThreadListMessage));
