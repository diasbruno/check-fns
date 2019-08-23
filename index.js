const tester = (f, msg) => (_, reports, b) => {
    const r = f(b);
    if (Object == r.constructor) {
        return { msg: !r.result ? msg : r.msg, result: r.result };
    }
    return { msg: r ? reports : msg, result: r };
};

const object = o => (merge, reports, b) => Object.keys(o).reduce(
    (acc, c) => merge(acc, o[c](merge, reports, b[c])),
    { msg: reports, result: true }
);

const all = (...args) => (merge, reports, b) => args.reduce(
    (acc, c) => merge(acc, c(merge, reports, b)),
    { msg: reports, result: true }
);

const or = (...args) => (merge, reports, b) => args.reduce(
    (acc, c) => merge(acc, c(merge, reports, b)),
    { msg: reports, result: false }
);

const keepFirst = (a, b) => a;
const listMessages = (a, b) => {
    debugger;
    return { msg: a.msg.concat([b.msg]), result: a.result && b.result };
};

const V = (f, m, r) => b => f(m, r, b);
const validate = f => b => V(f, keepFirst, '')(b).result;

module.exports = {
    tester,
    keepFirst,
    listMessages,
    object,
    all,
    or,
    validate,
    V
};
