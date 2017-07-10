/**
 * All errors from conga-profile derive from this class
 */
class ProfilerError extends Error {
    /**
     * @param {String} [msg] The error message
     * @param {Error} [previous] The previous error message
     */
    constructor(msg = 'Profiler Error', previous = null) {
        super(msg);
        this.previous = null;
        if (previous instanceof Error) {
            this.previous = previous;
            this.stack += '\n' + previous.stack;
        }
    }

    /**
     * Serialize this error
     *
     * @Rest:SerializeMethod
     *
     * @returns {Object}
     */
    toJSON() {
        let obj = { message : this.message };
        if (this.previous) {
            if (typeof this.previous.toJSON === 'function') {
                let previousObj = this.previous.toJSON() || {};
                previousObj.previousMessage = previousObj.message;
                obj = Object.assign({}, previousObj, obj);
            }
        }
        return obj;
    }
}

module.exports = ProfilerError;