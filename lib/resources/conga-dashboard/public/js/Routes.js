export default [

    {
        name: "profiler",
        path: "/profiler",
        component: require('./ListRequestsComponent').default,
    },
    {
        name: "profiler.login",
        path: "/profiler/login",
        component: require('./LoginComponent').default,
    },
    {
        path: "/profiler/request/:id",
        component: require('./RequestComponent').default,
        props: true,
        children: [
            {
                name: "profiler.request",
                path: "",
                component: require('./RequestOverviewComponent').default,
                props: true
            },
            {
                name: "profiler.request.collector",
                path: "collector/:name",
                component: require('./RequestCollectorComponent').default,
                props: true
            }
        ]
    }

];
