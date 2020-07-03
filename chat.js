const net = require('net');
const util = require('./util');

const args = process.argv.splice(2);
const port = args[0] ? parseInt(args[0]) : 3005;
const eol = "\r\n";
const max_clients = 3;
const max_logs = 10;

var server;
server = {
    log: [],
    clients: {},
    num_clients: 0,
    socket: net.createServer((socket) => {
        if (server.num_clients >= max_clients) {
            socket.end(`sorry, tcp chat is at capacity ${eol}`);
            return;
        }
        server.num_clients++;
        var client = {
            id: util.rand_id(7),
            socket: socket,
            name: ""
        };
        client.socket.setEncoding('utf8');
        while (server.clients.hasOwnProperty(client.id))
            client.id = util.rand_id(7);
        server.clients[client.id] = client;
        console.log(`client ${client.id} – connected`);
        server.send_msg(client.id, eol + "tcp chat 1.0");
        client.socket.on('data', (data) => {
            data = (`${data}`).trim();
            if (data.charAt(0) == ':') {
                var args = data.split(' ');
                var cmd = args[0].substr(1);
                args.shift();
                if (server.cmds_alias.hasOwnProperty(cmd))
                    cmd = server.cmds_alias[cmd];
                if (server.cmds.hasOwnProperty(cmd))
                    server.cmds[cmd](client, args, (msg) => {
                        server.send_msg(client.id, `${util.nice_time()} | [${cmd}] ${msg}`);
                    });
                else server.send_msg(client.id, `${util.nice_time()} | [${cmd}] command not known`);
            } else {
                var msg = {
                    data: data,
                    sender_id: client.id,
                    sender_name: client.name == "" ? "anonymous" : client.name,
                    timestamp: Date.now()
                };
                server.log.push(msg);
                if (server.log.length >= max_logs) server.log.shift();
                for (var c in server.clients) {
                    if (server.clients.hasOwnProperty(c) && c != client.id)
                        server.send_msg(c, `${util.nice_time(msg.timestamp)} | ${msg.sender_name}: ${msg.data}`);
                }
            }
        });
        client.socket.on('error', (error) => {
            console.error(`client ${client.id} – error`);
            console.error(error);
        });
        client.socket.on('close', (had_error) => {
            console.log(`client ${client.id} – closed` + (had_error ? " with error" : ""));
            server.clients[client.id] = null;
            delete server.clients[client.id];
            server.num_clients--;
        });
        server.send_msg(client.id, "type :help for commands");
        server.send_msg(client.id, "––––––––––––––––––––––––" + eol);
        for (var l in server.log) {
            var msg = server.log[l];
            server.send_msg(client.id, `${util.nice_time(msg.timestamp)} | ${msg.sender_name}: ${msg.data}`);
        }
    }),
    send_msg: (id, msg) => {
        if (server.clients.hasOwnProperty(id)) {
            server.clients[id].socket.write(`${msg} ${eol}`);
        }
    },
    close: (id) => {
        if (server.clients.hasOwnProperty(id)) {
            server.clients[id].socket.end();
        }
    },
    cmds: [],
    cmds_alias: {},
    cmd: (cmd, callback) => {
        if (typeof callback === 'string' && server.cmds.hasOwnProperty(callback))
            server.cmds_alias[cmd] = callback;
        else if (typeof callback === 'function')
            server.cmds[cmd] = callback;
    },
    listen: (p) => {
        server.socket.on('error', (error) => {
            console.error("error");
            console.error(error);
        });
        server.socket.listen(p, _ => {
            console.log(`listening on ${p}`);
        });
    },
};

server.cmd('name', (client, args, res) => {
    if (args.length < 1) {
        res("please provide name");
    } else {
        var name = (`${args[0]}`).trim();
        if (name == "")
            res("please provide non-empty name");
        else if (!util.validate_name(name))
            res("please use letters, numbers, _ underscore, - dash");
        else {
            for (var c in server.clients) {
                if (server.clients.hasOwnProperty(c)) {
                    if (server.clients[c].name.trim() == name.trim()) {
                        if (c == client.id)
                            res(`you are already ${name}`)
                        else res(`sorry, ${name} is taken`)
                        return;
                    }
                }
            }
            client.name = name;
            console.log(`client ${client.id} – name: ${name}`);
            res(`you are now ${name}`);
        }
    }
});
server.cmd('n', 'name');

server.cmd('quit', (client, _, res) => {
    res("peace out");
    server.close(client.id);
});
server.cmd('q', 'quit');

server.cmd('help', (client, _, res) => {
    res("available commands");
    var res_h = (msg) => server.send_msg(client.id, `        ${msg}`);
    res_h(":name {name}  –  set name (n)");
    res_h(":quit         –  leave chat (q)");
    res_h(":help         –  list commands (h)");
});
server.cmd('h', 'help');

server.listen(port);
