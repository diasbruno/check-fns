const tester = (f, msg) => b => {
    const r = f(b);
    if (Object == r.constructor) {
        return { msg: !r.result ? msg : r.msg, result: r.result };
    }
    return { msg: r ? '' : msg, result: r };
};

const object = o => b => Object.keys(o).reduce((acc, c) => {
    if (!acc.result) return acc;
    const r = o[c](b[c]);
    return r;
}, { msg: '', result: true });

const all = (...args) => b => args.reduce((acc, c) => {
    if (!acc.result) return acc;
    return c(b);
}, { msg: '', result: true });

const or = (...args) => b => args.reduce((acc, c) => {
    if (acc.result) return acc;
    return c(b);
}, { msg: '', result: false });

const validate = f => b => f(b).result;

module.exports = {
    tester,
    object,
    all,
    or,
    validate
};
