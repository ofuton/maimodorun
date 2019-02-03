const getBaseKey = pattern => {
    const matches = location.href.match(pattern);

    return matches && matches[0];
};

const getReplyKeySuffix = baseElement => {
    const commentsPostElement = baseElement.closest('.ocean-ui-comments-post');
    const pattern = /ocean-ui-comments-post-id-(\d+)/;
    const matches = commentsPostElement.attr('class').match(pattern);

    return matches ? `/${matches[1]}` : '';
};

const getKey = (type, baseElement, pattern) => {
    const baseKey = getBaseKey(pattern);
    if (!baseKey) {
        throw new Error('This page url did not match url pattern.');
    }
    const key = type === 'Reply' ? baseKey + getReplyKeySuffix(baseElement) : baseKey;

    return key;
};

export default getKey;
