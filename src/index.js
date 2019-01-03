import { Observable } from 'rxjs'
import plugin, { pluginName } from './babel-plugins/babel-plugin-convert-call'

const babel = require('@babel/standalone')
const sanboxEngine = require('./engine')

const DEFAULT_PRESETS = [
  'es2017',
  ['stage-0', { legacy: false, decoratorsBeforeExport: true }]
]
const DEFAULT_PLUGINS = [
  'transform-spread',
  'transform-classes',
  'transform-block-scoping',
  'proposal-function-bind',
  'transform-arrow-functions',
  'proposal-class-properties',
  'transform-async-to-generator',
  'proposal-object-rest-spread',
  'proposal-export-default-from',
  'transform-block-scoped-functions',
  'proposal-async-generator-functions',
  pluginName
]
// Javascript sanbox required for exec the javascript code without threatened main application
export default class Sandbox {
  constructor (global, variables, presets = undefined, plugins = undefined) {
    this.presets = presets || DEFAULT_PRESETS
    this.plugins = plugins || DEFAULT_PLUGINS
    this.variables = variables

    this.responseObserver = null
    this.responseSubscription = null
    // Make a generator function for response result
    this.responseObservable = new Observable((observer) => {
      this.responseObserver = observer
    })
    this.global = this.prepareGlobalObjects(global || {})
    babel.registerPlugin(pluginName, plugin)
  }
  prepareGlobalObjects (inputs) {
    return {
      // Type
      String,
      Object,
      Array,
      Number,
      Date,
      Error,
      // Global function
      JSON,
      Symbol,
      Promise,
      Math,
      RegExp,
      ...this.customGlobalObjects(),
      ...inputs
    }
  }
  exec (source, callbacks = {}) {
    try {
      const result = babel.transform(source, {
        presets: this.presets,
        plugins: this.plugins
      }).code
      if (this.responseSubscription) {
        this.responseSubscription.unsubscribe()
      }
      this.responseSubscription = this.responseObservable.subscribe({
        next: callbacks.onMessage || undefined,
        error: callbacks.onError || undefined,
        complete: this.processComplete
      })
      const code = sanboxEngine.compileSanbox(result)
      const resultExcuse = code(
        { ...this.global, window: this.global },
        this.variables || {}
      )
      if (resultExcuse) {
        this.sendOutput(resultExcuse)
      }
    } catch (err) {
      return err.message
    }
  }
  sendOutput (message) {
    this.responseObserver && this.responseObserver.next(message)
  }
  processComplete () {
    this.responseSubscription && this.responseSubscription.unsubscribe()
    this.responseSubscription = null
  }
  customGlobalObjects () {
    return {
      $stop: () => {
        this.responseSubscription && this.responseSubscription.unsubscribe()
      },
      $log: (message) => {
        this.sendOutput(message)
      }
    }
  }
}
