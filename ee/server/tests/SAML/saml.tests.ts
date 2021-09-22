/* eslint-env mocha */
import 'babel-polyfill';

import chai from 'chai';

import { SAMLUtils } from '../../../../app/meteor-accounts-saml/server/lib/Utils';
import { profile } from './data';


const { expect } = chai;
describe('EE-SAML', () => {
	it('should load multiple roles from the roleAttributeName when it has multiple values', () => {
		const multipleRoles = {
			...profile,
			roles: ['role1', 'role2'],
		};
		const userObject = SAMLUtils.mapProfileToUserObject(multipleRoles);

		expect(userObject).to.be.an('object').that.have.property('roles').that.is.an('array').with.members(['role1', 'role2']);
	});

	it('should assign the default role when the roleAttributeName is missing', () => {
		const { globalSettings } = SAMLUtils;
		globalSettings.roleAttributeName = '';
		SAMLUtils.updateGlobalSettings(globalSettings);

		const userObject = SAMLUtils.mapProfileToUserObject(profile);

		expect(userObject).to.be.an('object').that.have.property('roles').that.is.an('array').with.members(['user']);
	});

	it('should assign the default role when the value of the role attribute is missing', () => {
		const { globalSettings } = SAMLUtils;
		globalSettings.roleAttributeName = 'inexistentField';
		SAMLUtils.updateGlobalSettings(globalSettings);

		const userObject = SAMLUtils.mapProfileToUserObject(profile);

		expect(userObject).to.be.an('object').that.have.property('roles').that.is.an('array').with.members(['user']);
	});
});
