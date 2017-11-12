export default {

    mapStatusToClass(status) {

        if (status === 429) {
            return 'is-dark';
        }

        if (status >= 200 && status < 300) {
            return 'is-success';
        }

        if (status >= 300 && status < 400) {
            return 'is-info';
        }

        if (status >= 400 && status < 500) {
            return 'is-warning';
        }

        if (status >= 500 && status < 600) {
            return 'is-danger';
        }
    }
}
