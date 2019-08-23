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
 (acc, c) => {
  const x = c(merge, reports, b);
  if (!acc.result & !x.result) return merge(acc, x);
  if (x.result) return x;
  return acc; 
 },
 { msg: reports, result: true }
);

const keepFirst = (a, b) => !a.result ? a : b;
const listMessages = (a, b) => {
 const am = a.msg.constructor == Array ? a.msg : [a.msg];
 const bm = b.msg.constructor == Array ? b.msg : [b.msg];
 return { msg: am.concat(bm), result: a.result && b.result };
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
