const parseQuery = queryString => {
    const queries = queryString.split('&');
    return queries.reduce((acc, query) => {
        const [key, value] = query.split('=');
        acc[key] = value;
        return acc;
    }, {});
};

export default parseQuery;
