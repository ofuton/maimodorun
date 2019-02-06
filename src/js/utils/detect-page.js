// Drops leading hash and slash
const getHashName = () => location.hash.replace(/^#[/]/g, '');

const isThread = hashName => /^space\/\d+\/thread\/\d+(\/\d+)?$/.test(hashName);

const isPeople = hashName => /^people\/user\/[^/]+(\/\d+)?$/.test(hashName);

const isMessage = hashName => /^message\/\d+;\d+(\/\d+)?$/.test(hashName);

const detectPage = () => {
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

    return 'unknown';
};

export default detectPage;
