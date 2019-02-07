import parseQuery from 'utils/parse-query';
const getPathName = () => location.pathname.replace(/^[/]?/g, '');

// Drops leading hash and slash
const getHashName = () => location.hash.replace(/^#[/]?/g, '');

const isThread = hashName => /^space\/\d+\/thread\/\d+(\/\d+)?$/.test(hashName);

const isPeople = hashName => /^people\/user\/[^/]+(\/\d+)?$/.test(hashName);

const isMessage = hashName => /^message\/\d+;\d+(\/\d+)?$/.test(hashName);

const isRecord = (pathName, hashName) => {
    return isAppPath(pathName) && includeRecordId(hashName);
};

const isAppPath = (pathName) => /^k\/\d+\/show$/.test(pathName);

const includeRecordId = (hashName) => parseQuery(hashName).hasOwnProperty('record');

const detectPage = () => {
    const pathName = getPathName();
    const hashName = getHashName();

    if (isThread(hashName)) {
        return 'thread';
    }

    if (isPeople(hashName)) {
        return 'people';
    }

    if (isMessage(hashName)) {
        return 'message';
    }

    if (isRecord(pathName, hashName)) {
        return 'record';
    }

    return 'unknown';
};

export default detectPage;
