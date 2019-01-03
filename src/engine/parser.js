import { executorCode } from './executor'

const limiters = new Map()

export function limiter (name, handler) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Second argument must be a function.')
  }
  if (limiters.has(name)) {
    throw new Error(`A limiter named ${name} is already registered.`)
  }
  limiters.set(name, handler)
  return this
}

const limiterRegex = /(?:[^&]|&&)+/g
const argsRegex = /\S+/g

export function parseCode (src, isAsync) {
  const tokens = src.match(limiterRegex)
  if (tokens.length === 1) {
    return executorCode(tokens[0], isAsync)
  }

  const code = {
    exec: executorCode(tokens[0], isAsync),
    limiters: []
  }
  for (let i = 1; i < tokens.length; i++) {
    const limiterTokens = tokens[i].match(argsRegex)
    const limiterName = limiterTokens.shift()
    const effect = limiters.get(limiterName)
    if (!effect) {
      throw new Error(`There is no limiter named: ${limiterName}.`)
    }
    code.limiters.push({effect, argExpressions: limiterTokens.map(executorCode)})
  }
  return code
}
