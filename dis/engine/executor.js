"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.executorExpression=executorExpression,exports.executorCode=executorCode;function asyncGeneratorStep(a,b,c,d,e,f,g){try{var h=a[f](g),i=h.value}catch(a){return void c(a)}h.done?b(i):Promise.resolve(i).then(d,e)}function _asyncToGenerator(a){return function(){var b=this,c=arguments;return new Promise(function(d,e){function f(a){asyncGeneratorStep(h,d,e,f,g,"next",a)}function g(a){asyncGeneratorStep(h,d,e,f,g,"throw",a)}var h=a.apply(b,c);f(void 0)})}}function executorExpression(a){return new Function(// eslint-disable-line
"context","tempVars","const sandbox = $engineCompileToSandbox(context, tempVars)\n    try {\n      with (sandbox) {\n        return ".concat(a,"\n      }\n    } catch (err) {\n      if (!(err instanceof TypeError)) {\n        throw err\n      }\n    }\n    $engineClearSandbox()"))}function executorCode(a,b){if(b){// AsyncFunction is not common
var c=Object.getPrototypeOf(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/regeneratorRuntime.mark(function a(){return regeneratorRuntime.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:case"end":return a.stop();}},a,this)}))).constructor;return new c(// eslint-disable-line
"context","tempVars","\n      const $sandbox = $engineCompileToSandbox(context, tempVars)\n      with ($sandbox) {\n        try {\n          ".concat(a,"\n        } catch (error) {\n          return error.message\n        }\n      }\n      $engineClearSandbox()\n      "))}return new Function(// eslint-disable-line
"context","tempVars","\n    const $sandbox = $engineCompileToSandbox(context, tempVars)\n    with ($sandbox) {\n      try {\n        ".concat(a,"\n      } catch (error) {\n        return error.message\n      }\n    }\n    $engineClearSandbox()\n    "))}