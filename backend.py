#!/usr/bin/env python
import sys

from twisted.internet import reactor
from twisted.python import log

from backend.app import app


if __name__ == "__main__":

    log.startLogging(sys.stdout)
    reactor.listenTCP(1234, app)
    reactor.run()