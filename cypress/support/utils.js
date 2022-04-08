/**
* @param {Int} n
* */
function randomStringGenerator(n) {
    return Math.random().toString(20).substr(2, n)
};


/**
* @param {String} str
* */
function alternateCharCase(str) {
    return str.split('').map((c, i) =>
        i % 2 == 0 ? c.toLowerCase() : c.toUpperCase()
    ).join('');
};

export { randomStringGenerator, alternateCharCase };