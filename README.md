conga-profiler
==============

WORK IN PROGRESS

overview
--------

- web interface to view profile information on each request
- toolbar in dev environment overlays ontop of site, connects to websocket to send / receive information
- monitor every client js event that is fired, in order
    - if recording is enabled, save it for playback later
    - if recording is not enabled, but error recording is, save all steps up until the error
- interact with a stopwatch service for manual profiling and automated graph reports
    - every event listener uses the stopwatch service and so each event is automatically profiled on a high level
- add custom sections to profiler, and implement custom data collectors for your custom sections



```
profiler:
    
    # optional, if ommitted, true is used
    enabled: true
    
    # required
    bass:
        manager: default.nedb
    
    # optional, if omitted, true is used with defaults
    monitoring:
        enabled: true
        delay_idle: 1000
        delay_request: 50
    
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
```