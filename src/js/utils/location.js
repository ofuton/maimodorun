const getPathName = () => location.pathname.replace(/^[/]?/g, '');

// Drops leading hash and slash
const getHashName = () => location.hash.replace(/^#[/]?/g, '');

export {
    getPathName,
    getHashName
};
