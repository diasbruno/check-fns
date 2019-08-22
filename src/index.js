// Given A and B, prefer the first result that is an error.
const keepFirst = (a, b) => !b || !a.result ? a : b;

// Given A and B, try to merge the results.
const collectAllErrors = (a, b) => {
  if (!b || b.result) return a;
  const verify = x => (x && !x.result && [x.msg]) || [];
  return {
    msg: verify(a).concat(verify(b)),
    result: a.result && b.result
  };
};

// Given `f : Function` and `msg : string`
// to build a test function.
// It can be called with just `B : any`,
// or, with `_ : Function` (the merge function)
// and `smsg : String` (success message).
const T = (f, msg) => (b, smsg, _) => {
  const r = f(b);
  return { msg: r ? smsg : msg, result: r };
};

// Given `o : Object`, it build a test function.
const object = o => (b, smsg, merge) =>
      ((merge = merge || keepFirst), Object.keys(o).reduce(
        (acc, c) => merge(acc, o[c](b[c], smsg, merge)),
        { msg: smsg, result: true }
      ));

// Given `o : Array`, a pair of key name and test function,
// it builds a test function.
const ordobject = o => (b, smsg, merge) => {
  merge = merge || keepFirst;
  let acc = { msg: smsg, result: true };
  for (let i = 0; i < o.length; i += 2) {
    acc = merge(acc, o[i + 1](b[o[i]], smsg, merge));
  }
  return acc;
};

// Given many test functions,
// check if a given object pass all if them.
const all = (...args) => (b, smsg, merge) =>
      ((merge = merge || keepFirst), args.reduce(
        (acc, c) => merge(acc, c(b, smsg, merge)),
        { msg: smsg, result: true }
      ));

// Given many test functions,
// check if a given object pass at least one of them.
const or = (...args) => (b, smsg, merge) =>
      ((merge = merge || keepFirst), args.reduce(
        (acc, c) => {
          if (acc && acc.result) return acc;
          const x = c(b, smsg, merge);
          if ((!acc && !x.result) || x.result) return x;
          return merge(acc, x);
        },
        null
      ));

// Given a test function and a message,
// if the test fail, return the given message.
const ifFail = (f, msg) => (b, smsg, merge) => {
  const r = f(b, smsg, merge);
  return r.result ? r : { msg, result: false };
};

// Validate combinator.
// Given `f : Function`, `m: Function` and `s : String`
// build a validation function that receives `b : any`
// and return the result.
const V = (f, s, m) => b => ((m = m || keepFirst), m(f(b, s, m), null));

// A validate function that return at the first error.
const validate = (f, b, s) => V(f, s, keepFirst)(b);
// A validate function that collects all errors.
const validateAll = (f, b, s) => V(f, s, collectAllErrors)(b);

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
