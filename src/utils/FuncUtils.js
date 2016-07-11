//  from https://github.com/igorsvee/react-redux-app/blob/master/js/adminRedux/utils/FuncUtils.js
import _ from 'lodash'


function truthy(obj) {
  return (obj !== false) && (obj != null)
}

// function doWhen($,cond, action){
//  return function(cond,action){
//    console.log("!!cond "+!!cond+" == $"+$)
//    if (!$ ? not(truthy(cond)) : truthy(cond) )
//      return action();
//    else
//      return undefined;
//  }
// }

// const doWhenYes = doWhen(true);
// const doWhenNo = doWhen(false)

export function doWhenYes(cond, action) {
  if (truthy(cond))
    return action();

  return undefined
}


function doWhenNo(action, cond) {
  if (not(truthy(cond)))
    return action();

  return undefined
}


export function not(val) {
  return !val
}

function throwNow(type, msg) {
  if (arguments.length < throwNow.length) {
    return throwNow.bind(this, ...arguments)
  } else {
    throw new type(msg);
  }
}

function makeExceptionThunk(errorType, msg) {
  if (arguments.length < makeExceptionThunk.length) {
    return makeExceptionThunk.bind(this, ...arguments)
  } else {
    return function () {
      throwNow(errorType, msg)
    }
  }
}

export const error = throwNow(Error);
export const typeError = throwNow(TypeError);
export const referenceError = throwNow(ReferenceError);

export function maybe(cb) {
  return doWhenYes(_.isFunction(cb), cb)
}

function throwWhenNot(errorType, cond, msg) {
  if (arguments.length < throwWhenNot.length) {
    return throwWhenNot.bind(this, ...arguments)
  } else {
    return doWhenNo(makeExceptionThunk(errorType, msg), cond)
  }

}

const typeErrorWhenNot = throwWhenNot(TypeError);
const referenceErrorWhenNot = throwWhenNot(ReferenceError);

export const DEFAULT_ASSERT_FAIL_MESSAGE = 'Predicate condition failed';

/**
 * Throws TypeError if predicate condition fails (false or null is returned from it)
 * @param anything to test
 * @param predicate
 * @param msg error message defaults to DEFAULT_ASSERT_FAIL_MESSAGE
 */
export function assertType(anything, predicate, msg = DEFAULT_ASSERT_FAIL_MESSAGE) {
  typeErrorWhenNot(_.isFunction(predicate), "predicate !== function");
  typeErrorWhenNot(predicate(anything), msg);
}

export function existy(val) {
  return not(_.isNil(val))
}


export function assertExistence(val, msg = `${val} doesn't exist.`) {
  referenceErrorWhenNot(existy(val), msg)
}

