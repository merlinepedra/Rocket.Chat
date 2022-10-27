import type { Locator, Page } from '@playwright/test';

export class FederationSidenav {
	private readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	get checkboxPrivateChannel(): Locator {
		return this.page.locator(
			'//*[@id="modal-root"]//*[contains(@class, "rcx-field") and contains(text(), "Private")]/../following-sibling::label/i',
		);
	}

	get checkboxFederatedChannel(): Locator {
		// TODO: move this to data-qa
		return this.page.locator(
			'//*[@id="modal-root"]//*[contains(@class, "rcx-field") and contains(text(), "Federated")]/../following-sibling::label/i',
		);
	}

	get autocompleteUser(): Locator {
		// TODO: move this to data-qa, we are using x path here because we don't have a dedicated server to run tests yet
		return this.page.locator('//*[@id="modal-root"]//*[contains(@class, "rcx-box--full") and contains(text(), "Add Members")]/..//input');
		// return this.page.locator('[data-qa="create-channel-users-autocomplete"]');
	}

	get inputChannelName(): Locator {
		return this.page.locator('#modal-root [data-qa="create-channel-modal"] [data-qa-type="channel-name-input"]');
	}

	get btnCreateChannel(): Locator {
		return this.page.locator('//*[@id="modal-root"]//button[contains(text(), "Create")]');
	}

	async inviteUserToChannel(username: string) {
		await this.autocompleteUser.click();
		await this.autocompleteUser.type(username);
		await this.page.waitForTimeout(1000);
		await this.page.locator('[data-qa-type="autocomplete-user-option"]', { hasText: username }).click();
	}

	async openAdministrationByLabel(text: string): Promise<void> {
		await this.page.locator('role=button[name="Administration"]').click();
		await this.page.locator(`li.rcx-option >> text="${ text }"`).click();
	}

	async openNewByLabel(text: string): Promise<void> {
		await this.page.locator('[data-qa="sidebar-create"]').click();
		await this.page.locator(`li.rcx-option >> text="${ text }"`).click();
	}

	async openChat(name: string): Promise<void> {
		await this.page.locator('[data-qa="sidebar-search"]').click();
		await this.page.locator('[data-qa="sidebar-search-input"]').type(name);
		await this.page.locator(`[data-qa="sidebar-item-title"] >> text="${ name }"`).first().click();
	}

	async createPublicChannel(name: string) {
		await this.openNewByLabel('Channel');
		await this.checkboxPrivateChannel.click();
		await this.inputChannelName.type(name);
		await this.btnCreateChannel.click();
	}
}