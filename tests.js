require('should');

const {
    tester,
    keepFirst,
    listMessages,
    object,
    all,
    or,
    validate,
    V
} = require('./index');

const min = a => tester((b) => b > a, 'min');
const max = a => tester(b => b < a, 'max');

const regexp = rg => tester(b => rg.test(b), 'regexp');

const isOne = b => b == 1;
const notOne = b => b != 1;
const lessThan2 = b => b < 2;

describe("validatefn", () => {
    context("tester", () => {
        it("should validate.", () =>
           tester(isOne, 'is one')(null, '', 1).should.be.eql({
               msg: '',
               result: true
           }));

        it("should fail to validate.", () =>
           tester(notOne, 'not one')(null, '', 1).should.be.eql({
               msg: 'not one',
               result: false
           }));
    });

    context("composition", () => {
        context("all(...)", () => {
            it("should pass.", () =>
               all(tester(isOne, 'is one'),
                   tester(lessThan2, 'less than 2')
                  )(
                   keepFirst, '', 1
               ).should.be.eql({
                       msg: '',
                       result: true
                   }));

            it("should fail first item.", () =>
               all(tester(notOne, 'not one'),
                   tester(isOne, 'is one')
                  )(
                   keepFirst, '', 1
               ).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));

            it("should fail last item.", () =>
               all(tester(isOne, 'is one'),
                   tester(notOne, 'not one')
                  )(
                   keepFirst, '', 1
               ).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));
        });

        context("or", () => {
            it("should fail last, but pass.", () =>
               or(tester(isOne, 'is one'),
                  tester(notOne, 'not one')
                 )(
                   keepFirst, '', 1
               ).should.be.eql({
                      msg: '',
                      result: true
                  }));

            it("should fail first, but pass.", () =>
               or(tester(notOne, 'not one'),
                  tester(isOne, 'is one')
                 )(
                   keepFirst, '', 1
               ).should.be.eql({
                      msg: '',
                      result: true
                  }));

            it("should fail all.", () =>
               or(tester(notOne, 'not one'),
                  tester(notOne, 'not one')
                 )(
                   keepFirst, '', 1
               ).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));
        });
    });

    context("object", () => {
        it("should pass.", () =>
           object({
               c: all(min(0), max(2))
           })(keepFirst, '', { c: 1 }).should.be.eql({
               msg: '',
               result: true
           }));

        it("should fail.", () =>
           object({
               c: all(min(0), max(2))
           })(keepFirst, '', { c: -1 }).should.be.eql({
               msg: 'min',
               result: false
           }));
    });

    context("validate", () => {
        it("should pass.", () => {
            validate(
                object({
                    c: all(min(1), max(10))
                })
            )({ c: 5 }).should.be.eql(true)
        });
    });

    context("V", () => {
        it("should all pass.", () => {
            V(
                all(min(1), max(10)),
                listMessages,
                []
            )(5).should.be.eql({
                msg: [],
                result: true
            })
        });

        it("should all fail.", () => {
            V(
                all(min(1), max(10)),
                listMessages,
                []
            )(0).should.be.eql({
                msg: ['min'],
                result: false
            })
        });

        it("should or pass.", () => {
            V(
                or(min(1), max(10)),
                listMessages,
                []
            )(0).should.be.eql({
                msg: [],
                result: true
            })
        });


        it("should or fail.", () => {
            V(
                or(tester(b => b.length > 0, 'non empty'),
		   tester(b => b.constructor === String, 'not string')),
                listMessages,
                []
            )([]).should.be.eql({
                msg: ['non empty', 'not string'],
                result: false
            })
        });
    });
});
