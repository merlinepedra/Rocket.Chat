'use strict';

module.exports = {
	require: [
		'ts-node/register',
		'@babel/register',
	],
	reporter: 'spec',
	ui: 'bdd',
	extension: ['ts'],
	spec: [
		'ee/server/tests/**/*.tests.ts',
		'ee/client/tests/**/*.tests.ts'
	],
};
