#!/usr/bin/env python
import sys

from twisted.internet import reactor
from twisted.python import log

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS, parse_args

if __name__ == "__main__":

    parse_args(sys.argv[1:])
    if 'logfile' in CONF_OPTIONS.keys():
        with open(CONF_OPTIONS['logfile'], 'a+') as fb:
            log.startLogging(fb)
    else:
        log.startLogging(sys.stdout)
    reactor.listenTCP(CONF_OPTIONS["port"], app)
    reactor.run()
