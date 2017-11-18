let timeout = null;
let username = null;
let password = null;
let deniedRoute = null;

const checkOptions = options => {
    if (username && password) {
        options = Object.assign({headers: {}}, options || {});
        options.headers.Authorization = 'Basic ' +
            (new Buffer(username + ':' + password)).toString('base64');
    }
    return options;
};

const checkTimer = () => {
    if (timeout) {
        timeout = clearTimeout(timeout);
    }
    // 10 minute timeout
    timeout = setTimeout(() => {
        username = null;
        password = null;
    }, 600000);
};

export default class HttpService {

    static authenticate(user, pass) {
        username = user;
        password = pass;
        checkTimer();
    }

    static route($router) {
        let route = { name: 'profiler' };
        if (deniedRoute) {
            route = deniedRoute;
            deniedRoute = null;
        }
        $router.push(route);
    }

    static get($http, $router, url, options) {
        checkTimer();
        options = checkOptions(options);
        return $http.get(url, options).catch(response => {
            if (response.status === 401 || response.status === 403) {
                if (!deniedRoute) {
                    deniedRoute = Object.assign({}, $router.history.current);
                }
                $router.push({ name: 'profiler.login' });
            }
        });
    }

}