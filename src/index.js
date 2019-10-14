const
// Convert arguments to array.
args = a => {
  const len = a.length, ls = new Array(len);
  for (let i = 0; i < len; i++) ls[i] = a[i];
  return ls;
},
// Given A and B, prefer the first result that is an error.
keepFirst = {
  all: (a, f, i, s, m) => a && !a.result ? a : f(i, s, m),
  or: (a, f, i, s, m) => a && a.result ? a : f(i, s, m)
},
// Return the message of X to an Array.
resultMsgToArray = x =>
  (x && !x.result ?
   (x.msg.constructor != Array ? [x.msg] : x.msg) : []),
// Given A and B, try to merge the results.
collectAllErrors = {
  all: (a, f, i, s, m) => {
    const b = f(i, s, m);
    if (b.result) return a;
    return {
      msg: resultMsgToArray(a).concat(resultMsgToArray(b)),
      result: a.result && b.result
    };
  },
  or: (a, f, i, s, m) => {
    if (a && a.result) return a;
    const b = f(i, s, m);
    if (!a || (b && b.result)) return b;
    return {
      msg: resultMsgToArray(a).concat(resultMsgToArray(b)),
      result: false
    };
  }
},
// Given `f : Function` and
// `msg : any` (for the failed result)
// to build a test function.
// It can be called with just `B : any`,
// or, with `_ : Function` (the merge function)
// and `smsg : any` (success object).
T = (f, msg) => (b, smsg, _) => {
  const r = f(b);
  return { msg: r ? smsg : msg, result: r };
},
// Given `o : Object`, it build a test function.
object = o => (b, smsg, merge) =>
  ((merge = merge || keepFirst), Object.keys(o).reduce(
    (acc, c) => merge.all(acc, o[c], b[c], smsg, merge),
    { msg: smsg, result: true }
  )),
// Given `o : Array`, a pair of key name and test function,
// it builds a test function.
ordobject = o => (b, smsg, merge) => {
  merge = merge || keepFirst;
  let acc = { msg: smsg, result: true };
  for (let i = 0; i < o.length; i += 2) {
    acc = merge.all(acc, o[i + 1], b[o[i]], smsg, merge);
  }
  return acc;
},
// Given many test functions,
// check if a given object pass all if them.
all = function() {
  return (b, smsg, merge) =>
    ((merge = merge || keepFirst),
     args(arguments).reduce(
       (acc, c) => merge.all(acc, c, b, smsg, merge),
       { msg: smsg, result: true }
     ));
},
// Given many test functions,
// check if a given object pass at least one of them.
or = function() {
  return (b, smsg, merge) =>
    ((merge = merge || keepFirst),
     args(arguments).reduce(
       (acc, c) => merge.or(acc, c, b, smsg, merge),
       null
     ));
},
// Given a test function and a message,
// if the test fail, return the given message.
ifFail = (f, msg) => (b, smsg, merge) => {
  const r = f(b, smsg, merge);
  return r.result ? r : { msg, result: false };
},
// Validate combinator.
// Given `f : Function`, `m: Function`
// and `s : any` (for the failed result)
// build a validation function that receives `b : any`
// and return the result.
V = (f, s, m) => b => ((m = m || keepFirst), m.or(null, f, b, s, m)),
// A validate function that return at the first error.
validate = (f, b, s) => V(f, s, keepFirst)(b),
// A validate function that collects all errors.
validateAll = (f, b, s) => V(f, s, collectAllErrors)(b);

module.exports = {
  T,
  keepFirst,
  collectAllErrors,
  object,
  ordobject,
  all,
  or,
  ifFail,
  validate,
  validateAll,
  V
};
