require('should');

const {
  T,
  object,
  ordobject,
  all,
  or,
  ifFail,
  validate,
  validateAll,
  V
} = require('./src/index');

const min = a => T(b => b > a, 'min');
const max = a => T(b => b < a, 'max');

const isOne = b => b == 1;
const notOne = b => b != 1;
const lessThan2 = b => b < 2;

describe("validatefn", () => {
  context("T", () => {
    it(
      "should validate.",
      () => T(isOne, 'is one')(1, 'yay').should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    it(
      "should fail to validate.",
      () => T(notOne, 'not one')(1).should.be.eql({
        msg: 'not one',
        result: false
      })
    );
  });

  context("composition", () => {
    context("all(...)", () => {
      it(
        "should pass.",
        () => all(
          T(isOne, 'is one'),
          T(lessThan2, 'less than 2')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'yay',
          result: true
        })
      );

      it(
        "should fail first item.",
        () => all(
          T(notOne, 'not one'),
          T(isOne, 'is one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'not one',
          result: false
        })
      );

      it(
        "should fail last item.",
        () => all(
          T(isOne, 'is one'),
          T(notOne, 'not one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'not one',
          result: false
        })
      );
    });

    context("or", () => {
      it(
        "should fail last, but pass.",
        () => or(
          T(isOne, 'is one'),
          T(notOne, 'not one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'yay',
          result: true
        })
      );

      it(
        "should fail first, but pass.",
        () => or(
          T(notOne, 'not one'),
          T(isOne, 'is one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'yay',
          result: true
        }));

      it(
        "should fail all.",
        () => or(
          T(notOne, 'not one'),
          T(notOne, 'not one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'not one',
          result: false
        })
      );

      it(
        "should fail all.",
        () => or(
          T(notOne, 'not one'),
          T(notOne, 'not one')
        )(
          1, 'yay'
        ).should.be.eql({
          msg: 'not one',
          result: false
        })
      );
    });
  });

  context("ifFail(...)", () => {
    it(
      "should fail with custom message.",
      () => ifFail (
        all(
          T(notOne, 'not one'),
          T(lessThan2, 'less than 2')
        ),
        'fail'
      )(
        1, 'yay'
      ).should.be.eql({
        msg: 'fail',
        result: false
      })
    );

    it(
      "should not fail with custom message.",
      () => ifFail (
        all(
          T(isOne, 'is one'),
          T(lessThan2, 'less than 2')
        ),
        'fail'
      )(
        1, 'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );
  });

  context("object", () => {
    it(
      "should pass.",
      () => object({
        c: all(min(0), max(2))
      })(
        { c: 1 }, 'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    it(
      "should fail.",
      () => object({
        c: all(min(0), max(2))
      })(
        { c: -1 }, 'yay'
      ).should.be.eql({
        msg: 'min',
        result: false
      })
    );
  });

  context("ordered object", () => {
    it(
      "should pass.",
      () => ordobject(
        ['c', all(min(0), max(2))]
      )(
        { c: 1 }, 'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    it(
      "should fail.",
      () => ordobject(
        ['d', min(1),
         'c', all(min(0), max(2))
        ]
      )(
        { d: 2, c: -1 }, 'yay'
      ).should.be.eql({
        msg: 'min',
        result: false
      })
    );
  });

  context("V", () => {
    it(
      "default merge is keepFirst",
      () => V(
        all(min(1), min(2)),
        'yay'
      )(
        0
      ).should.be.eql({
        msg: 'min',
        result: false
      })
    );
  });

  context("validate", () => {
    it(
      "should pass.",
      () => validate(
        object({
          c: all(min(1), max(10))
        }),
        { c: 5 },
        'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );
  });

  context("validateAll", () => {
    it(
      "should all pass.",
      () => validateAll(
        all(min(1), max(10)),
        5,
        'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    it(
      "should all fail.",
      () => validateAll(
        all(min(1), max(10)),
        0,
        'yay'
      ).should.be.eql({
        msg: ['min'],
        result: false
      })
    );

    it(
      "should or pass.",
      () => validateAll(
        or(min(1), max(10)),
        0,
        'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    it(
      "should or fail.",
      () => validateAll(
        or(
          T(b => b.length > 0, 'non empty'),
          T(b => b.constructor === String, 'not string'),
          T(b => b.constructor === Number, 'not number')
        ),
        [],
        'yay'
      ).should.be.eql({
        msg: ['non empty', 'not string', 'not number'],
        result: false
      })
    );

    it(
      "should all pass fail.",
      () => validateAll(
        or(
          T(b => b.length > 0, 'non empty'),
          T(b => b.constructor === Array, 'not string'),
          T(b => b.constructor === Number, 'not number')
        ),
        [],
        'yay'
      ).should.be.eql({
        msg: 'yay',
        result: true
      })
    );

    context("custom validator.", () => {
      it(
        "should throw when fail.",
        () => should.throws(() => V(
          T(b => b.length > 0, 'non empty'),
          '',
          (a, f, i, s, m) => {
            console.log("what is a", a);
            if (!a.result) {
              throw new Error(x.msg);
            }
          }
        )([], 'yay'), 'non empty')
      );
    });
  });
});
