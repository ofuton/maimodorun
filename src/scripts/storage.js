const Storage = class {

    constructor(options = {}) {
        this.options = options;
        this.storeOptions = this.options.store || {};
        this.maxItemsCount = 50;
        this.nItems = 0;
    }

    init() {
        const dbname    = this.options.db || 'db';
        const storeName = this.storeName =  this.storeOptions.name || 'item';
        const indexes   = this.options.indexes || [];

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbname);

            request.onsuccess = (event) => {
                this.db = event.target.result;

                const transaction = this.db.transaction([this.storeName], 'readonly');
                const objectStore = transaction.objectStore(this.storeName);
                const countRequest = objectStore.count();
                countRequest.onsuccess = () => {
                    this.nItems = countRequest.result;
                };

                resolve(this.db);
            };

            request.onerror = (event) => {
                let error = new Error('StorageOpenError');
                error.code = event.target.errorCode;
                reject(error);
            };

            request.onupgradeneeded = (event) => {
                this.store = event.currentTarget.result.createObjectStore(storeName, this.storeOptions);

                indexes.forEach((index) => {
                    // if index.unique is undefined, unique is false
                    const unique = !!index.unique;
                    this.store.createIndex(index.name, index.property, {
                        unique
                    });
                });
            };
        });
    }

    _run(type, keyOrValue, mode = 'readonly') {
        const transaction = this.db.transaction([this.storeName], mode);
        const objectStore = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            let request, result;
            if(keyOrValue) {
                request = objectStore[type](keyOrValue);
            } else {
                request = objectStore[type]();
            }

            request.onsuccess = (event) => {
                if (type === 'put' && this.nItems >= this.maxItemsCount) {
                    // FIXME: インデックス指定の分離がまだ
                    const index = objectStore.index('timestamp');
                    index.openCursor(null).onsuccess = (event) => {
                        let cursor = event.target.result;
                        const deleteRequest = cursor.delete();
                    };
                }

                const countRequest = objectStore.count();
                countRequest.onsuccess = () => {
                    this.nItems = countRequest.result;
                };

                result = event.target.result;
            };

            transaction.oncomplete = () => {
                resolve(result);
            };

            transaction.onerror = (event) => {
                let error = new Error('StoraegOperationError');
                error.code = event.target.errorCode;
                reject(error);
            };
        });
    }

    getItem(key) {
        return this._run('get', key);
    }

    getAllItems() {
        return this._run('getAll', false);
    }

    setItem(value) {
        return this._run('put', value, 'readwrite');
    }

    removeItem(key) {
        return this._run('delete', key, 'readwrite');
    }
};
