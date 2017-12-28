/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// conga debug

// https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27


// framework libs
const { AbstractCommand } = require('@conga/framework').command;

/**
 * This command runs conga in debug mode
 */
module.exports = class DebugCommand extends AbstractCommand {
    /**
     * The command
     *
     * @return {String}
     */
    static get command() {
        return 'debug';
    }

    /**
     * The command description
     *
     * @return {String}
     */
    static get description() {
        return 'Starts your app with --inspect and --debug-brk so you can debug and profile your code in chrome dev-tools.';
    }

    /**
     * Hash of command options
     *
     * @return {Object}
     */
    static get options() {
        return {};
    }

    /**
     * Array of command argument names
     *
     * @return {Array<String>}
     */
    static get arguments() {
        return [];
    }

    /**
     * Execute the command
     *
     * @param  {CommandInput}  input   the command input data
     * @param  {CommandOutput} output  the output writer
     * @param  {Function}      next    the next callback
     * @return {void}
     */
    execute(input, output, next) {

       // TODO: finish

        next();

    }

};