export function executorExpression (src) {
  return new Function( // eslint-disable-line
    'context',
    'tempVars',
    `const sandbox = $engineCompileToSandbox(context, tempVars)
    try {
      with (sandbox) {
        return ${src}
      }
    } catch (err) {
      if (!(err instanceof TypeError)) {
        throw err
      }
    }
    $engineClearSandbox()`
  )
}

export function executorCode (src, isAsync) {
  if (isAsync) {
    // AsyncFunction is not common
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    return new AsyncFunction( // eslint-disable-line
      'context',
      'tempVars',
      `
      const $sandbox = $engineCompileToSandbox(context, tempVars)
      with ($sandbox) {
        try {
          ${src}
        } catch (error) {
          return error.message
        }
      }
      $engineClearSandbox()
      `
    )
  }
  return new Function( // eslint-disable-line
    'context',
    'tempVars',
    `
    const $sandbox = $engineCompileToSandbox(context, tempVars)
    with ($sandbox) {
      try {
        ${src}
      } catch (error) {
        return error.message
      }
    }
    $engineClearSandbox()
    `
  )
}
