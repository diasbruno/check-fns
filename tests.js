require('should');

const {
    tester,
    object,
    all,
    or,
    validate
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
           tester(isOne, 'is one')(1).should.be.eql({
               msg: '',
               result: true
           }));

        it("should fail to validate.", () =>
           tester(notOne, 'not one')(1).should.be.eql({
               msg: 'not one',
               result: false
           }));
    });

    context("composition", () => {
        context("all(...)", () => {
            it("should pass.", () =>
               all(tester(isOne, 'is one'),
                   tester(lessThan2, 'less than 2'))(1).should.be.eql({
                       msg: '',
                       result: true
                   }));

            it("should fail first item.", () =>
               all(tester(notOne, 'not one'),
                   tester(isOne, 'is one'))(1).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));

            it("should fail last item.", () =>
               all(tester(isOne, 'is one'),
                   tester(notOne, 'not one'))(1).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));
        });

        context("or", () => {
            it("should fail last, but pass.", () =>
               or(tester(isOne, 'is one'),
                  tester(notOne, 'not one'))(1).should.be.eql({
                      msg: '',
                      result: true
                  }));

            it("should fail first, but pass.", () =>
               or(tester(notOne, 'not one'),
                  tester(isOne, 'is one'))(1).should.be.eql({
                      msg: '',
                      result: true
                  }));

            it("should fail all.", () =>
               or(tester(notOne, 'not one'),
                   tester(notOne, 'not one'))(1).should.be.eql({
                       msg: 'not one',
                       result: false
                   }));
        });
    });

    context("object", () => {
        it("should pass.", () =>
           object({
               c: all(min(0), max(2))
           })({ c: 1 }).should.be.eql({
               msg: '',
               result: true
           }));

        it("should fail.", () =>
           object({ c: all(min(0), max(2)) })({ c: -1 }).should.be.eql({
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
});
