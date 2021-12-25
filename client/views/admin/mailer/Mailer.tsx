// @ts-nocheck
import {
	TextInput,
	TextAreaInput,
	Field,
	FieldGroup,
	CheckBox,
	Button,
	Icon,
	ButtonGroup,
} from '@rocket.chat/fuselage';
import { VolumeIdStringList } from 'aws-sdk/clients/ec2';
import React, { useState, useCallback, ReactElement } from 'react';

import { isEmail } from '../../../../lib/utils/isEmail';
import { isJSON } from '../../../../lib/utils/isJSON';
import Page from '../../../components/Page';
import { useTranslation } from '../../../contexts/TranslationContext';

export function Mailer({ sendMail = (): void => undefined }): ReactElement {
	const t = useTranslation();

	const [fromEmail, setFromEmail] = useState({ value: '' });
	const [dryRun, setDryRun] = useState(false);
	const [query, setQuery] = useState({ value: '' });
	const [subject, setSubject] = useState('');
	const [emailBody, setEmailBody] = useState('');

	return (
		<Page>
			<Page.Header title={t('Mailer')}>
				<ButtonGroup align='end'>
					<Button
						primary
						onClick={(): void => {
							sendMail({ fromEmail, dryRun, query, subject, emailBody });
						}}
					>
						<Icon name='send' size='x20' mie='x8' />
						{t('Send_email')}
					</Button>
				</ButtonGroup>
			</Page.Header>
			<Page.ScrollableContentWithShadow
				alignSelf='center'
				w='100%'
				display='flex'
				flexDirection='column'
				alignItems='center'
			>
				<FieldGroup
					maxWidth='x600'
					is='form'
					onSubmit={useCallback((e) => e.preventDefault(), [])}
					method='post'
				>
					<Field>
						<Field.Label>{t('From')}</Field.Label>
						<Field.Row>
							<TextInput
								id='fromEmail'
								placeholder={t('Type_your_email')}
								value={fromEmail.value}
								error={fromEmail.error}
								onChange={(e): VolumeIdStringList => {
									setFromEmail({
										value: e.currentTarget.value,
										error: !isEmail(e.currentTarget.value) ? t('Invalid_Email') : undefined,
									});
								}}
							/>
						</Field.Row>
					</Field>
					<Field>
						<Field.Row>
							<CheckBox id='dryRun' checked={dryRun} onChange={(): void => setDryRun(!dryRun)} />
							<Field.Label htmlFor='dry-run'>{t('Dry_run')}</Field.Label>
						</Field.Row>
						<Field.Hint>{t('Dry_run_description')}</Field.Hint>
					</Field>
					<Field>
						<Field.Label>{t('Query')}</Field.Label>
						<Field.Row>
							<TextInput
								id='query'
								value={query.value}
								error={query.error}
								onChange={(e): void => {
									setQuery({
										value: e.currentTarget.value,
										error:
											e.currentTarget.value && !isJSON(e.currentTarget.value)
												? t('Invalid_JSON')
												: undefined,
									});
								}}
							/>
						</Field.Row>
						<Field.Hint>{t('Query_description')}</Field.Hint>
					</Field>
					<Field>
						<Field.Label>{t('Subject')}</Field.Label>
						<Field.Row>
							<TextInput
								id='subject'
								value={subject.value}
								error={subject.error}
								onChange={(e): void => {
									setSubject(e.currentTarget.value);
								}}
							/>
						</Field.Row>
					</Field>
					<Field>
						<Field.Label>{t('Email_body')}</Field.Label>
						<Field.Row>
							<TextAreaInput
								id='emailBody'
								rows={10}
								value={emailBody}
								onChange={(e): void => setEmailBody(e.currentTarget.value)}
							/>
						</Field.Row>
						<Field.Hint dangerouslySetInnerHTML={{ __html: t('Mailer_body_tags') }} />
					</Field>
				</FieldGroup>
			</Page.ScrollableContentWithShadow>
		</Page>
	);
}
