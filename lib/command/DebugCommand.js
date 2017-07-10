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

/**
 * This command runs conga in debug mode
 */
module.exports = {

    /**
     * Set up configuration for this command
     * @type {Object}
     */
    config: {
        command: "debug",
        description: "Run your app with --inspect and --debug-brk so you can debug and profile your code in chrome dev-tools.",
        options: { },
        arguments: [ ]
    },

    /**
     * Run the command
     * @return {void}
     */
    run: (container, args, options, cb) => {

        // TODO: finish

        cb();

    }
};