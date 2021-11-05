import { CachedSettings } from '../CachedSettings';
import { SettingsRegistry } from '../SettingsRegistry';
import { ISetting } from '../../../../definition/ISetting';
import { Settings } from '../../../models/server/raw';


export const settings = new CachedSettings();
Settings.find().forEach((record: ISetting) => {
	settings.set(record);
}).then(() => {
	settings.initilized();
});


export const settingsRegistry = new SettingsRegistry({ store: settings, model: Settings });
