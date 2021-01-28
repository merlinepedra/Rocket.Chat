import Agenda from 'agenda';
import { Meteor } from 'meteor/meteor';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { MongoInternals } from 'meteor/mongo';


import { EmailInbox } from '../../../app/models/server/raw';
import { IMAPInterceptor } from '../../email/IMAPInterceptor';
import { IEmailInbox } from '../../../definition/IEmailInbox';
import { onEmailReceived } from './EmailInbox_Incoming';


export type Inbox = {
	imap: IMAPInterceptor;
	smtp: Mail;
	config: IEmailInbox;
	jobEmail: Agenda.Job;
}

export const inboxes = new Map<string, Inbox>();

export async function configureEmailInboxes(): Promise<void> {
	const emailInboxesCursor = EmailInbox.find({
		active: true,
	});

	for (const { imap, jobEmail } of inboxes.values()) {
		imap.stop();
		jobEmail.remove();
	}

	inboxes.clear();

	const emailJobs = new Agenda({
		mongo: (MongoInternals.defaultRemoteCollectionDriver().mongo as any).client.db(),
		db: { collection: 'email_inbox_jobs' },
		defaultConcurrency: 1,
	});
	for await (const emailInboxRecord of emailInboxesCursor) {
		console.log('Setting up email interceptor for', emailInboxRecord.email);

		const imap = new IMAPInterceptor({
			password: emailInboxRecord.imap.password,
			user: emailInboxRecord.imap.username,
			host: emailInboxRecord.imap.server,
			port: emailInboxRecord.imap.port,
			tls: emailInboxRecord.imap.secure,
			tlsOptions: {
				rejectUnauthorized: false,
			},
			// debug: (...args: any[]): void => console.log(...args),
		}, {
			deleteAfterRead: false,
			filter: [['UNSEEN'], ['SINCE', emailInboxRecord._updatedAt]],
			rejectBeforeTS: emailInboxRecord._updatedAt,
			markSeen: true,
		});

		// imap.on('email', Meteor.bindEnvironment((email) => onEmailReceived(email, emailInboxRecord.email, emailInboxRecord.department)));

		imap.start();

		emailJobs.define(emailInboxRecord.email, { concurrency: 1 }, (job: Agenda.Job, done) => {
			console.log('Fetching all emails', emailInboxRecord.email);
			Meteor.bindEnvironment((email: any) => onEmailReceived(email, emailInboxRecord.email, emailInboxRecord.department, job));
			done();
		});

		const jobEmail = await emailJobs.create(emailInboxRecord.email).repeatEvery('5 seconds').save();
		await emailJobs.start();

		const smtp = nodemailer.createTransport({
			host: emailInboxRecord.smtp.server,
			port: emailInboxRecord.smtp.port,
			secure: emailInboxRecord.smtp.secure,
			auth: {
				user: emailInboxRecord.smtp.username,
				pass: emailInboxRecord.smtp.password,
			},
		});

		inboxes.set(emailInboxRecord.email, { imap, smtp, config: emailInboxRecord, jobEmail });
	}
}

Meteor.startup(() => {
	configureEmailInboxes();
});
