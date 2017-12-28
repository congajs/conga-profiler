conga-profiler
==============

Add runtime profiling to your CongaJS application.

See the [documentation](/docs) for more information.

Configuration
-------------

```
profiler:
    
    # optional, if omitted, true is used
    # possible values are true, false, request
    # request means, only enabled for matched requests
    enabled: request
    
    # required
    bass:
        manager: default.nedb
    
    # optional, if omitted, true is used with defaults
    monitoring:
        # whether or not to enable stat monitoring
        # even if this is true, profiler.enabled must be set to either true or request or monitoring will not run 
        enabled: true
        
        # tells the ProfilerStatService how often to check for stats when there are no active requests
        delay_idle: 1000
        
        # tells the ProfilerStatService how often to check for stats when there is 1 or more active requests 
        delay_request: 50
        
        # tells the ProfilerStatService how to persist the stats - possible values are "all" and "request"  
        # request meaning only persist the stats that occur during a request
        # all meaning persist every stat
        persist: request
    
    # optional
    security:
        authenticator: '@security.firewall.authenticator.http_basic'
        provider:
            memory:
                users:
                    profiler:
                        password: let-me-in
                        roles: ROLE_PROFILER
    # optional
    # even if not enabled, matchers may trigger a profiler on a request
    matchers:
        local:
            ip: 127.0.0.1
        
        foo:
            route: ^/api/blah/some/component
        
        bar: '@service.id'
    
    # optional
    # if you are working on the dashboard and want to profile the requests
    profile_dashboard: true
```