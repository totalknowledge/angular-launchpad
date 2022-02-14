#!/usr/bin/env python3
from __future__ import absolute_import
import sys, os
import tornado.ioloop
import tornado.log
import tornado.httpserver

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS, parse_args

if __name__ == "__main__":

    parse_args(sys.argv[1:])
    if 'logfile' in list(CONF_OPTIONS.keys()):
        with open(CONF_OPTIONS['logfile'], 'a+') as fb:
            tornado.options.options['log_file_prefix'].set(CONF_OPTIONS['logfile'])
    else:
        tornado.log.enable_pretty_logging()

    if 'ssl_port' in list(CONF_OPTIONS.keys()):
        try:
            http_server = tornado.httpserver.HTTPServer(
                app, ssl_options = {
                    "certfile": os.path.join(CONF_OPTIONS["certfile"]),
                    "keyfile": os.path.join(CONF_OPTIONS["keyfile"])
                }
            )
            http_server.listen(CONF_OPTIONS["ssl_port"])
        except:
            app.listen(CONF_OPTIONS["port"])
    else:
        app.listen(CONF_OPTIONS["port"])
    try:
        tornado.ioloop.IOLoop.current().start()
    except:
        tornado.ioloop.IOLoop.instance().stop()
