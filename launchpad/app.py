import os
import sys

import cyclone.web

from adapters import picklejar

db = picklejar.PickleJar()

# Late import
from handlers import MainHandler, WebServiceHandler

app = cyclone.web.Application([
        (r"/api/v0/(.*)", WebServiceHandler),
        (r"/api/(.*)", WebServiceHandler),
        (r"/(.*)", MainHandler)
    ])
