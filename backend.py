#!/usr/bin/env python3
from __future__ import absolute_import
import sys, os
import tornado.ioloop
import tornado.log
import tornado.httpserver

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS, parse_args


def listen_http(port):
    try:
        app.listen(port)
    except OSError as error:
        if getattr(error, "winerror", None) == 10048:
            print(
                "Port {} is already in use. Stop the existing backend.py process "
                "or start this server on another port with --port <port>.".format(port),
                file=sys.stderr,
                flush=True,
            )
            sys.exit(1)
        raise
    print(
        "Angular Launchpad backend running on http://localhost:{}".format(port),
        flush=True,
    )


def listen_ssl_or_http():
    certfile = CONF_OPTIONS.get("certfile")
    keyfile = CONF_OPTIONS.get("keyfile")
    ssl_port = CONF_OPTIONS.get("ssl_port")
    http_port = CONF_OPTIONS["port"]

    if not ssl_port:
        listen_http(http_port)
        return

    if not certfile or not keyfile or not os.path.exists(certfile) or not os.path.exists(keyfile):
        print(
            "SSL disabled: configured certfile/keyfile were not found; "
            "falling back to HTTP.",
            flush=True,
        )
        listen_http(http_port)
        return

    try:
        http_server = tornado.httpserver.HTTPServer(
            app, ssl_options={
                "certfile": os.path.join(certfile),
                "keyfile": os.path.join(keyfile)
            }
        )
        http_server.listen(ssl_port)
    except Exception as error:
        print(
            "SSL startup failed ({}); falling back to HTTP.".format(error),
            flush=True,
        )
        listen_http(http_port)
        return

    print(
        "Angular Launchpad backend running on https://localhost:{}".format(ssl_port),
        flush=True,
    )


if __name__ == "__main__":

    parse_args(sys.argv[1:])
    if 'logfile' in list(CONF_OPTIONS.keys()):
        with open(CONF_OPTIONS['logfile'], 'a+') as fb:
            tornado.options.options['log_file_prefix'].set(CONF_OPTIONS['logfile'])
    else:
        tornado.log.enable_pretty_logging()

    listen_ssl_or_http()
    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        print("Angular Launchpad backend shutting down.", flush=True)
    finally:
        tornado.ioloop.IOLoop.current().stop()
