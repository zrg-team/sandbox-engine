let temp
let globalObj
const globals = new Set()

if (typeof window !== 'undefined') {
  globalObj = window
} else if (typeof global !== 'undefined') {
  globalObj = global
} else if (typeof self !== 'undefined') { // eslint-disable-line
  globalObj = self // eslint-disable-line
}
globalObj.$engineCompileToSandbox = engineCompileToSandbox
globalObj.$engineClearSandbox = engineClearSandbox

export function expose (...globalNames) {
  for (let globalName of globalNames) {
    globals.add(globalName)
  }
}

export function hide (...globalNames) {
  for (let globalName of globalNames) {
    globals.delete(globalName)
  }
}

export function hideAll () {
  globals.clear()
}

function has (target, key) {
  return globals.has(key) ? (key in target) : true
}

function get (target, key) {
  if (key === Symbol.unscopables) {
    return undefined
  }
  return temp && temp[key] ? temp[key] : target[key]
}

const hasHandler = { has }
const allHandlers = { has, get }

function engineCompileToSandbox (obj, tempVars) {
  if (tempVars) {
    temp = tempVars
    return new Proxy(obj, allHandlers)
  }
  return new Proxy(obj, hasHandler)
}

function engineClearSandbox () {
  temp = undefined
}
