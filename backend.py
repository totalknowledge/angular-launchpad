#!/usr/bin/env python
import sys

from twisted.internet import reactor
from twisted.python import log

from launchpad.app import app
from launchpad.settings import CONF_OPTIONS

if __name__ == "__main__":

    log.startLogging(sys.stdout)
    reactor.listenTCP(CONF_OPTIONS["port"], app)
    reactor.run()
