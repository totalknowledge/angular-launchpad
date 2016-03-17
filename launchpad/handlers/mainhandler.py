import os

from launchpad import settings

import cyclone.web


class MainHandler(cyclone.web.RequestHandler):
    """ Return files from app and node_modules otherwise return index.html"""

    def initialize(self):
        self.valid_paths = tuple(settings.CONF_OPTIONS["contentdirs"])
        self.mimetypes = settings.CONF_OPTIONS["mimetypes"]
        self.default_extension = settings.CONF_OPTIONS["defaultextension"]

    @staticmethod
    def get_file_path(path):
        path_segment = path.split('?',1)[0]
        return os.path.join(settings.doc_dir, path_segment)

    def get(self, path):
        if path.startswith(self.valid_paths):
            filetype = path.split('.')[-1]
            if filetype not in self.mimetypes:
                path = path + '.' + self.default_extension
                filetype = self.default_extension
            try:
                with open(self.get_file_path(path), 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
                    if filetype in self.mimetypes.keys():
                        self.set_header("Content-Type", self.mimetypes[filetype])
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        elif path == 'favicon.ico':
            try:
                with open(self.get_file_path(path), 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
                    self.set_header("Content-Type", "image/x-icon")
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        else:
            with open(self.get_file_path('index.html'), 'rb') as request_page:
                self.write(request_page.read())
                self.set_status(200)
    def default(self, path):
        self.set_status(405)
        self.write({"error":{"title":"Method Not Allowed"}})
