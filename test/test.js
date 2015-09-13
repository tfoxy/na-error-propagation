var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');

var ErrorPropagation = require('..');
var nerdamer = require('nerdamer');

GLOBAL.nerdamer = nerdamer;
require('nerdamer/Calculus');
delete GLOBAL.nerdamer;

ErrorPropagation.nerdamer = nerdamer;

describe('ErrorPropagation', function() {
  'use strict';

  it('is a function', function() {
    expect(ErrorPropagation).to.be.a('function');
  });

  describe('instance', function() {

    it('is an object', function() {
      var errorPropagation = new ErrorPropagation();
      expect(errorPropagation).to.be.an('object');
    });

    it('is an instance of ErrorPropagation', function() {
      var errorPropagation = new ErrorPropagation();
      expect(errorPropagation).to.be.an.instanceOf(ErrorPropagation);
    });

    describe('.calculate', function() {

      it('accepts a number as the expression, returning the same number', function() {
        var errorPropagation = new ErrorPropagation();
        var result = errorPropagation.calculate('5');
        expect(result.value).to.equal(5);
      });

      it('returns an error of 0 when no variables are used', function() {
        var errorPropagation = new ErrorPropagation();
        var result = errorPropagation.calculate('5');
        expect(result.error).to.equal(0);
      });

      it('returns solved expression if no variable is given', function() {
        var errorPropagation = new ErrorPropagation();
        var result = errorPropagation.calculate('5 + 3');
        expect(result.value).to.equal(8);
      });

      it('throws error if no expression is given', function() {
        var errorPropagation = new ErrorPropagation();
        var fn = errorPropagation.calculate.bind(errorPropagation);
        expect(fn).to.throw(ErrorPropagation.InputError);
      });

      it('throws error if expression is invalid', function() {
        var errorPropagation = new ErrorPropagation();
        var fn = errorPropagation.calculate.bind(errorPropagation, '**3**+/-');
        expect(fn).to.throw(Error);
        fn = errorPropagation.calculate.bind(errorPropagation, '3-');
        expect(fn).to.throw(Error);
      });

      it('does not save any expression inside nerdamer', function() {
        var errorPropagation = new ErrorPropagation();
        errorPropagation.calculate('5');
        expect(nerdamer.expressions()).to.have.length(0);
      });

      it('does not save any expression inside nerdamer, even when there is an error', function() {
        var errorPropagation = new ErrorPropagation();
        var fn = errorPropagation.calculate.bind(errorPropagation, '3-');
        expect(fn).to.throw(Error);
        expect(nerdamer.expressions()).to.have.length(0);
      });

      describe('with variables', function() {

        it('throws error if variable is not an object', function() {
          var errorPropagation = new ErrorPropagation();
          var fn = errorPropagation.calculate.bind(errorPropagation, 'x', {
            x: true
          });
          expect(fn).to.throw(ErrorPropagation.InputError);
        });

        it('throws error if variable is null', function() {
          var errorPropagation = new ErrorPropagation();
          var fn = errorPropagation.calculate.bind(errorPropagation, 'x', {
            x: null
          });
          expect(fn).to.throw(ErrorPropagation.InputError);
        });

        it('throws error if variable does not have a value', function() {
          var errorPropagation = new ErrorPropagation();
          var fn = errorPropagation.calculate.bind(errorPropagation, 'x', {
            x: {error: 3}
          });
          expect(fn).to.throw(ErrorPropagation.InputError);
        });

        it('returns same value and error as x when expression is "x"', function() {
          var errorPropagation = new ErrorPropagation();
          var result = errorPropagation.calculate('x', {
            x: {value: 8, error: 3}
          });
          expect(result.value).to.equal(8);
          expect(result.error).to.equal(3);
        });

        it('returns double the value and error as x when expression is "2x"', function() {
          var errorPropagation = new ErrorPropagation();
          var result = errorPropagation.calculate('2x', {
            x: {value: 8, error: 3}
          });
          expect(result.value).to.equal(16);
          expect(result.error).to.equal(6);
        });

        it('returns x² as value and 2*x*dx as error when expression is "x^2"', function() {
          var errorPropagation = new ErrorPropagation();
          var result = errorPropagation.calculate('x^2', {
            x: {value: 8, error: 3}
          });
          expect(result.value).to.equal(8 * 8);
          expect(result.error).to.equal(2 * 8 * 3);
        });

        it('returns x+y as value and dx+dy as error when expression is "x+y"', function() {
          var x = 8, dx = 3, y = 15, dy = 7;
          var errorPropagation = new ErrorPropagation();
          var result = errorPropagation.calculate('x+y', {
            x: {value: x, error: dx},
            y: {value: y, error: dy}
          });
          expect(result.value).to.equal(x + y);
          expect(result.error).to.equal(dx + dy);
        });

        it('returns x*y as value and dx*y+dy*x as error when expression is "x*y"', function() {
          var x = 8, dx = 3, y = 15, dy = 7;
          var errorPropagation = new ErrorPropagation();
          var result = errorPropagation.calculate('x*y', {
            x: {value: x, error: dx},
            y: {value: y, error: dy}
          });
          expect(result.value).to.equal(x * y);
          expect(result.error).to.equal(dx * y + dy * x);
        });

        it('returns x+y as value and both errors when correlation is set to "both"', function() {
          var x = 8, dx = 3, y = 15, dy = 4;
          var errorPropagation = new ErrorPropagation({
            correlation: 'both'
          });
          var result = errorPropagation.calculate('x+y', {
            x: {value: x, error: dx},
            y: {value: y, error: dy}
          });
          expect(result.value).to.equal(x + y);
          expect(result.error).to.deep.equal({
            correlated: dx + dy,
            uncorrelated: 5
          });
        });

      });

      describe('events', function() {

        it('emits an input event at the start, before validating anything', function() {
          var errorPropagation = new ErrorPropagation();
          var spy = sinon.spy();
          var fn = errorPropagation.calculate.bind(errorPropagation);
          errorPropagation.on('input', spy);
          expect(fn).to.throw(Error);
          sinon.assert.calledOnce(spy);
        });

        it('emits a result event at the end, with the value and error of the result', function() {
          var errorPropagation = new ErrorPropagation();
          var spy = sinon.spy();
          errorPropagation.on('result', spy);
          errorPropagation.calculate('5');
          sinon.assert.calledOnce(spy);
          sinon.assert.calledWith(spy, {
            value: 5,
            error: 0
          });
        });

        it('emits a differential event, with the differential' +
            ' expression, value and variableName', function() {
          var errorPropagation = new ErrorPropagation();
          var spy = sinon.spy();
          errorPropagation.on('differential', spy);
          errorPropagation.calculate('x', {x: {value: 5, error: 2}});
          sinon.assert.calledOnce(spy);
          var expression = spy.args[0][0].expression;
          sinon.assert.calledWith(spy, {
            value: 1,
            variableName: 'x',
            variable: {value: 5, error: 2},
            valueWithError: 2,
            expression: expression
          });
          expect(expression.toString()).to.equal('1');
        });

      });

    });

  });

});
