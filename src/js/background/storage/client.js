export default class Storage {
    constructor(options = {}) {
        this.options = options;
        this.storeOptions = this.options.store || {};
        this.version = this.options.version || 1;
        this.maxItemsCount = 50;
        this.nItems = 0;
    }

    init() {
        const dbname    = this.options.db || 'db';
        const storeName = this.storeName =  this.storeOptions.name || 'item';
        const indexes   = this.options.indexes || [];

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbname, this.version);

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
                if (event.oldVersion < 1) {
                    this.store = request.result.createObjectStore(storeName, this.storeOptions);

                    indexes.forEach((index) => {
                        // if index.unique is undefined, unique is false
                        const unique = !!index.unique;
                        this.store.createIndex(index.name, index.property, {
                            unique
                        });
                    });
                }

                if (event.oldVersion < 2) {
                    const objectStore = request.transaction.objectStore(this.storeName);
                    objectStore.openCursor().onsuccess = (event) => {
                        var cursor = event.target.result;
                        if (cursor) {
                            const updateData = cursor.value;
                            updateData.scope = 'Thread.Body';
                            cursor.update(updateData);
                            console.log(cursor.value);
                            cursor.continue();
                        }
                    };
                }
            };
        });
    }

    _read(type, keyOrValue) {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            let request, result;
            if(keyOrValue) {
                request = objectStore[type](keyOrValue);
            } else {
                request = objectStore[type]();
            }

            request.onsuccess = (event) => {
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

    _readWithCursor(offsets, limits) {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const index = objectStore.index('timestamp');

        return new Promise((resolve, reject) => {
            const results = [];
            let offset_flag = false;
            index.openCursor(null, 'prev').onsuccess = event => {
                let cursor = event.target.result;
                if (cursor) {
                    // cursor.advance doesn't allow 0 as argument.
                    if (offsets > 0 && !offset_flag) {
                        cursor.advance(offsets);
                        offset_flag = true;
                    } else {
                        if (results.length < limits) {
                            results.push(cursor.value);
                            cursor.continue();
                        }
                    }
                }
            };

            transaction.oncomplete = () => {
                resolve(results);
            };

            transaction.onerror = (event) => {
                let error = new Error('StoraegOperationError');
                error.code = event.target.errorCode;
                reject(error);
            };
        });
    }

    _write(type, keyOrValue) {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            let request, result;
            request = objectStore[type](keyOrValue);

            request.onsuccess = (event) => {
                if (this.nItems >= this.maxItemsCount) {
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
        return this._read('get', key);
    }

    getAllItems() {
        return this._read('getAll');
    }

    getItems(offsets, limits) {
        return this._readWithCursor(offsets, limits);
    }

    setItem(value) {
        return this._write('put', value);
    }

    removeItem(key) {
        return this._write('delete', key);
    }
}
