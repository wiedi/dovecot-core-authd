# dovecot-core-authd

A small node.js script answering dict lookup reqeuests from dovecot.

See: <http://wiki2.dovecot.org/AuthDatabase/Dict>

## Installation

	npm install -g dovecot-core-authd
	svccfg import /opt/local/lib/node_modules/dovecot-core-authd/manifest.xml

## Configuration

The following environment variables are used for configuration:

 - <code>REDIS_SOCKET</code>: Path to UNIX socket for redis. If not set TCP to 127.0.0.1 on port 6379 is used.
 - <code>DOVECOT_AUTH_SOCKET</code>: Path to UNIX socket on which to answer requests from dovecot.

