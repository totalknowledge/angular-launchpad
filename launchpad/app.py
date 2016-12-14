import os
import sys

import tornado.web
from launchpad import settings

# Make pickle_jar if it doesn't exist
if not os.path.exists(os.path.join(settings.doc_dir, "pickle_jar")):
        os.makedirs(os.path.join(settings.doc_dir, "pickle_jar"))

# Late import
from handlers import MainHandler, WebServiceHandler

app = tornado.web.Application([
        (r"/api/v0/(.*)", WebServiceHandler),
        (r"/api/(.*)", WebServiceHandler),
        (r"/(.*)", MainHandler)
    ])
