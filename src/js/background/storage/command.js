import Storage from 'background/storage/client';
import { createNewTab, executeScriptIntoTab } from 'utils/chrome';

export default class CommandStorage {
    constructor() {
        this.storage = new Storage({
            db: 'maimodorun',
            version: 2,
            store: {
                name: 'formText',
                keyPath: 'url',
            },
            indexes: [{
                name: 'url',
                property: 'url',
                unique: true
            }, {
                name: 'timestamp',
                property: 'timestamp',
                unique: false
            }]
        });
    }

    async init() {
        try {
            await this.storage.init();
            return { status: 'OK' };
        } catch (error) {
            console.error(error);
            return { status: error.message };
        }
    }

    async store(value) {
        try {
            await this.storage.init();
            await this.storage.setItem(value);
            return { status: 'OK' };
        } catch (error) {
            console.error(error);
            return { status: error.message };
        }
    }

    async load(key) {
        try {
            if (!key) {
                throw 'The key is null.';
            }

            await this.storage.init();
            return { status: 'OK', value: await this.storage.getItem(key) };
        } catch (error) {
            console.error(error);
            return { status: error.message, value: {contents: ''} };
        }
    }

    async loadAll() {
        try {
            await this.storage.init();
            return { status: 'OK', value: await this.storage.getAllItems() };
        } catch (error) {
            console.error(error);
            return { status: error.message, value: [] };
        }
    }

    async loadItems(offsets, limits) {
        try {
            await this.storage.init();
            return { status: 'OK', value: await this.storage.getItems(offsets, limits) };
        } catch (error) {
            console.error(error);
            return { status: error.message, value: [] };
        }
    }

    async remove(key) {
        try {
            await this.storage.init();
            await this.storage.removeItem(key);
            return { status: 'OK' };
        } catch (error) {
            console.error(error);
            return { status: error.message };
        }
    }

    async recoveryWithNewTab(key) {
        try {
            await this.storage.init();
            const item = await this.storage.getItem(key);
            if (!item) {
                throw new Error(`Desn't exist item in storage: ${key}`);
            }

            const tab = await createNewTab(key);
            await executeScriptIntoTab(tab.id, { code: 'const CONTENT = ' + JSON.stringify(item) + ';'});
            await executeScriptIntoTab(tab.id, { file: 'assets/js/inject.js'});

            return { status: 'OK' };
        } catch (error) {
            console.error(error);
            return { status: error.message };
        }
    }
}
