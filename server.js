#!/usr/bin/env node
"use strict"

var fs      = require('fs')
var net     = require('net')
var path    = require('path')
var mkdirp  = require('mkdirp')
var carrier = require('carrier')
var redis   = require('redis')


var config = {
	'redis_socket': process.env.REDIS_SOCKET,
	'socket':       process.env.DOVECOT_AUTH_SOCKET || '/var/run/dovecot-core-authd/socket',
	'hkey_prefix':  'mail.account:obj:',
	'key':          'password'

}

var client = redis.createClient(config.redis_socket)
var server = net.createServer(function(conn) {
	carrier.carry(conn, function parser(line) {
		var cmd  = line[0]
		var args = line.slice(1)

		switch(cmd) {
		case 'H': // Hello
			break
		case 'L': // Lookup
			args = args.split('/')
			if(args.length < 3) {
				conn.write('F\n')
				break
			}
			if(args[1] == 'passdb') {
				client.hget(config.hkey_prefix + args[2], config.key, function(err, reply) {
					if(err) {
						conn.write('F\n')
						return
					}
					if(!reply) {
						conn.write('N\n')
						return
					}
					conn.write('O' + JSON.stringify({"password": "{CRYPT}" + reply}) + '\n')
				})
			} else {
				conn.write('F\n')
			}
			break
		case 'I': // Iterate
		default:
			conn.write('F\n')
		}
	})
})

server.on('error', function(err) {
	var addr = this.address()
	var self = this

	// Reuse unix socket if possible
	if(err.code == 'EADDRINUSE') {
		var testSocket = net.connect(addr, function(){
			console.log('unixsocket: Socket is in use ', err)
			process.exit()
		})
		testSocket.on('error', function(err) {
			if (err.code == 'ECONNREFUSED') {
				fs.unlink(addr)
				self.listen(addr)
			} else {
				console.log('unixsocket: Socket error ', err)
				process.exit()
			}
		})
	}
})

client.on("error", function (err) {
	console.log("Error " + err);
})

mkdirp.sync(path.dirname(config.socket), parseInt('700', 8), function(){})
server.listen(config.socket)

