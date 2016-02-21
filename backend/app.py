import os
import sys

import cyclone.web

# Make pickle_jar if it doesn't exist
if not os.path.exists("../pickle_jar"):
        os.makedirs("../pickle_jar")

# Late import
from handlers import MainHandler, WebServiceHandler

app = cyclone.web.Application([
        (r"/api/v0/(.*)", WebServiceHandler),
        (r"/api/(.*)", WebServiceHandler),
        (r"/(.*)", MainHandler)
    ])