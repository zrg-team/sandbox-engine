import { parseCode } from './parser'
import { executorExpression } from './executor'

const codeCache = new Map()

export function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let executor = executorExpression(src)

  if (typeof executor === 'function') {
    return executor
  }
  throw new TypeError('Executor must be a function.')
}

export function compileAsyncSanbox (src) {
  return compileSanbox(src, true)
}

export function compileSanbox (src, isAsync = false) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let code = codeCache.get(src)
  if (!code) {
    code = parseCode(src, isAsync)
    codeCache.set(src, code)
  }

  if (typeof code === 'function') {
    return code
  }

  const context = {}
  if (isAsync) {
    return async function evaluateCode (state, tempVars) {
      let i = 0
      async function next () {
        Object.assign(context, tempVars)
        if (i < code.limiters.length) {
          const limiter = code.limiters[i++]
          const args = limiter.argExpressions.map(evaluateArgExpression, state)
          limiter.effect(next, context, ...args)
        } else {
          await code.exec(state, tempVars)
        }
      }
      await next()
    }
  }
  return function evaluateCode (state, tempVars) {
    let i = 0
    function next () {
      Object.assign(context, tempVars)
      if (i < code.limiters.length) {
        const limiter = code.limiters[i++]
        const args = limiter.argExpressions.map(evaluateArgExpression, state)
        limiter.effect(next, context, ...args)
      } else {
        code.exec(state, tempVars)
      }
    }
    next()
  }
}

function evaluateArgExpression (argExpression) {
  return argExpression(this)
}
