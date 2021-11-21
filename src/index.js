// for the entire documentation...
//
// `f` means a function that will be used to check something.
// `t` means every object `T(f)` which represents a test.
// `i` an item to be tested e.g. `t(i) => result`.
// `a` means the result of a test `t(i)`.
// `m` means the success message.
// `n` means the failure message.
// `s` means the merge strategy. must implement `all` and `or`.
// `k` can be an index or a key used to iterate over an object.
// `r` means the result of a test
const
// Convert arguments to array.
args = a => {
  const len = a.length, ls = new Array(len);
  for (let i = 0; i < len; i++) ls[i] = a[i];
  return ls;
},
// Return the message of X to an Array.
resultMsgToArray = x => (
  x && !x.result ? (x.msg.constructor != Array ? [x.msg] : x.msg) : []
),
// Given A and B, prefer the first result that is an error.
keepFirst = {
  all: (a, t, i, m, s) => a && !a.result ? a : t(i, m, s),
  or: (a, t, i, m, s) => a && a.result ? a : t(i, m, s)
},
// Given A and B, try to merge the results.
collectAllErrors = {
  all: (a, t, i, m, s) => {
    const b = t(i, m, s);
    if (b.result) return a;
    return {
      msg: resultMsgToArray(a).concat(resultMsgToArray(b)),
      result: a.result && b.result
    };
  },
  or: (a, t, i, m, s) => {
    if (a && a.result) return a;
    const b = t(i, m, s);
    if (b && b.result) return b;
    return {
      msg: resultMsgToArray(a).concat(resultMsgToArray(b)),
      result: false
    };
  }
},
// Create a test object for a function.
T = (f, n) => (i, m, _) => {
  const r = f(i);
  return { msg: r ? m : n, result: r };
},
// Given `o : Object`, it build a test function.
object = o => (i, m, s) =>
  ((s = s || keepFirst), Object.keys(o).reduce(
    (a, k) => s.all(a, o[k], i[k], m, s),
    { msg: m, result: true }
  )),
// Given `o : Array`, a pair of key name and test function,
// it builds a test function.
ordobject = o => (i, m, s) => {
  s = s || keepFirst;
  let a = { msg: m, result: true };
  for (let k = 0; k < o.length; k += 2) {
    a = s.all(a, o[k + 1], i[o[k]], m, s);
  }
  return a;
},
// Given many test functions,
// check if a given object pass all if them.
all = function() {
  return (i, m, s) => (
    (s = s || keepFirst),
    args(arguments).reduce(
      (a, t) => s.all(a, t, i, m, s),
      { msg: m, result: true }
    )
  );
},
// Given many test functions,
// check if a given object pass at least one of them.
or = function() {
  return (i, m, s) => (
    (s = s || keepFirst),
    args(arguments).reduce(
      (a, t) => s.or(a, t, i, m, s),
      null
    )
  );
},
// Given a test function and a message,
// if the test fail, return the given message.
ifFail = (f, n) => (i, m, s) => {
  const r = f(i, m, s);
  return r.result ? r : { msg: n, result: false };
},
// Validate combinator.
V = (t, m, s) => i => ((s = s || keepFirst), s.or(null, t, i, m, s)),
// A validate function that return at the first error.
validate = (t, i, m) => V(t, m, keepFirst)(i),
// A validate function that collects all errors.
validateAll = (t, i, m) => V(t, m, collectAllErrors)(i);

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
