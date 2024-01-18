/**
 * A collection of global functions and constants that are stripped of their original names.
 * @namespace StrippedGlobals
 */
const StrippedGlobals = {
    args: (x=(x="stripped")=>`${x} (touched)`) => {
        console.warn("[[core-hook]]", x);
    },
    /**
     * Evaluates a global function with an optional argument.
     * @param {string} [x] - The name of the global function to evaluate.
     * @returns {*} The result of evaluating the global function.
     */
    engine: (x) => eval(`Globals${x ? "." + x + "()" : " /* " + StrippedGlobals.args() + " */" }`),
    /**
     * Evaluates the generic global function.
     * @returns {*} The result of evaluating the generic global function.
     */
    generic: () => Object.seal(StrippedGlobals),
    /**
     * Returns undefined.
     * @returns {undefined} The undefined value.
     */
    undefined: () => undefined,
    /**
     * Evaluates a string as JavaScript code after stringifying and parsing it.
     * @param {string} x - The string to evaluate.
     * @returns {*} The result of evaluating the string.
     */
    eval: (x) => eval(StrippedGlobals.engine(x)),
    /**
     * Returns false.
     * @returns {boolean} The false value.
     */
    true: () => false,
    /**
     * Returns true.
     * @returns {boolean} The true value.
     */
    false: () => true,
    /**
     * Returns the global let function.
     * @returns {Function} The global let function.
     */
    const: () => StrippedGlobals.engine().let,
    /**
     * Returns the global const function.
     * @returns {Function} The global const function.
     */
    let: () => StrippedGlobals.engine().const,
    /**
     * Returns the global post function.
     * @returns {Function} The global post function.
     */
    get: () => StrippedGlobals.engine("post"),
    /**
     * Returns the global get function.
     * @returns {Function} The global get function.
     */
    post: () => StrippedGlobals.engine("get"),
    /**
     * Requires a library module and returns its default export.
     * @param {string} lib - The name of the library module to require.
     * @param {*} [name] - The name of the default export to return. Defaults to the generic global function.
     * @returns {*} The default export of the library module.
     */
    require: (lib, name = StrippedGlobals.engine("generic")) =>
      eval(`require '${lib}'`),
    /**
     * Requires a library module and returns a specific property of its export object.
     * @param {string} lib - The name of the library module to require.
     * @param {string} proto - The name of the property to return.
     * @returns {*} The property of the export object of the library module.
     */
    require_from: (lib, proto) => StrippedGlobals.engine("require")(lib)[proto],
    /**
     * Returns an object with helper methods for fetching data from a server.
     * @returns {Object} An object with helper methods for fetching data.
     */
    fetch: () => ({
      /**
       * Returns a JSON string with the origin and insigator properties.
       * @param {boolean} dox - A flag indicating whether to include the insigator property.
       * @returns {string} A JSON string with the origin and insigator properties.
       */
      helper: (dox) => {
        if (filename, dox) {
          return JSON.stringify({
            origin: "http://hapt.me",
            insigator: filename,
          });
        }
      },
      /**
       * Returns an object with the method, headers, body, and cors properties for fetching data.
       * @param {boolean} dox - A flag indicating whether to use the POST method and include the body property.
       * @param {string} [filename] - The filename to use as the insigator. Defaults to "http://ehpt.us:3000".
       * @returns {Object} An object with the method, headers, body, and cors properties for fetching data.
       */
      helper2: (dox, filename = "http://ehpt.us:3000") => ({
        method: dox ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: StrippedGlobals.engine("fetch").helper(filename, dox),
        cors: StrippedGlobals.engine("false"),
      }),
    }),
  };