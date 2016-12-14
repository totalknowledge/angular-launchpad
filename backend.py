#!/usr/bin/env python
import sys
import tornado.ioloop
import tornado.log

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS, parse_args

if __name__ == "__main__":

    parse_args(sys.argv[1:])
    if 'logfile' in CONF_OPTIONS.keys():
        with open(CONF_OPTIONS['logfile'], 'a+') as fb:
            tornado.options.options['log_file_prefix'].set(CONF_OPTIONS['logfile'])
    else:
        tornado.log.enable_pretty_logging()
    app.listen(CONF_OPTIONS["port"])
    tornado.ioloop.IOLoop.current().start()
