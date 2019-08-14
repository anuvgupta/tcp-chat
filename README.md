# tcp-chat

TCP socket chat server in Node

## features

Commands can be invoked with `:cmd` syntax. Arguments are passed space-separated after the command name, as `:cmd {arg1} {arg2} {arg3}`.
Available commands:

-   `:name {name}` – set name (alias n)
    -   Your name (or `anonymous`, if unset) will prefix your messages
-   `:quit` – leave chat (alias q)
-   `:help` – list commands (h)

## usage

Requires latest `node`, but no packages.  
Run with `node chat {port}` (or `npm test` for testing). Clients can connect with telnet: `telnet localhost {port}`.
