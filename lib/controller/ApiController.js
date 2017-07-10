/*
 * This file is part of the conga-profiler module.
 *
 * (c) Anthony Matarazzo <email@anthonymatarazzo.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// framework libs
const Controller = require('conga-framework').Controller;

/**
 * The ApiController handles all the routes necessary for the backend profiler panel
 *
 * TODO: Some sort of security / firewall for profiler api calls
 *
 * @Route('/_profiler/api')
 */
class ApiController extends Controller {

    /**
     * @Route("/access/token", name="_profiler.api.create_access_token", methods=["POST"])
     */
    createAccessToken(req, res) {
        this.container.get('profiler.dashboard')
            .generateAccessToken()
            .then(token => res.return({ success: true, token }))
            .catch(err => res.return({ success: false, message: err.message }, 500));
    }

}

module.exports = ApiController;