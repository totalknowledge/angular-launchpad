#!/usr/bin/env python
import sys, os
import tornado.ioloop
import tornado.log
import tornado.httpserver

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS, parse_args

if __name__ == "__main__":

    parse_args(sys.argv[1:])
    if 'logfile' in CONF_OPTIONS.keys():
        with open(CONF_OPTIONS['logfile'], 'a+') as fb:
            tornado.options.options['log_file_prefix'].set(CONF_OPTIONS['logfile'])
    else:
        tornado.log.enable_pretty_logging()

    if 'ssl_port' in CONF_OPTIONS.keys():
        http_server = tornado.httpserver.HTTPServer(
            app, ssl_options = {
                "certfile": os.path.join(CONF_OPTIONS["certfile"]),
                "keyfile": os.path.join(CONF_OPTIONS["keyfile"])
            }
        )
        http_server.listen(CONF_OPTIONS["ssl_port"])
    else:
        app.listen(CONF_OPTIONS["port"])
    tornado.ioloop.IOLoop.current().start()
