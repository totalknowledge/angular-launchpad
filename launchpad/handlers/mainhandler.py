from __future__ import absolute_import
import os

from launchpad import settings

import tornado.web


class MainHandler(tornado.web.RequestHandler):
    """ Return files from app and node_modules otherwise return index.html"""

    def initialize(self):
        self.mimetypes = settings.CONF_OPTIONS["mimetypes"]
        self.default_extension = settings.CONF_OPTIONS["defaultextension"]
        self.dir_base = "www/"

    @staticmethod
    def get_file_path(path):
        path_segment = path.split('?', 1)[0]
        cleaned_path = os.path.normpath(path_segment)
        
        # Ensure the cleaned path doesn't attempt directory traversal
        if '..' in cleaned_path or cleaned_path.startswith('/'):
            raise ValueError("Invalid path")
        
        full_path = os.path.join(settings.doc_dir, cleaned_path)
        return full_path

    def get(self, path):

        filetype = path.split('.')[-1]
        if filetype not in self.mimetypes:
            path = path + '.' + self.default_extension
            filetype = self.default_extension
        try:
            with open(self.get_file_path(self.dir_base + path), 'rb') as request_page:
                self.write(request_page.read())
                self.set_status(200)
                if filetype in list(self.mimetypes.keys()):
                    self.set_header("Content-Type", self.mimetypes[filetype])
        except:
            with open(self.get_file_path(self.dir_base + 'index.html'), 'rb') as request_page:
                self.write(request_page.read())
                self.set_status(200)

    def default(self, path):
        self.set_status(405)
        self.write({"error":{"title":"Method Not Allowed"}})
