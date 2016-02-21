import os

from launchpad import settings

import cyclone.web


class MainHandler(cyclone.web.RequestHandler):
    """ Return files from app and node_modules otherwise return index.html"""

    @staticmethod
    def get_file_path(path):
        return os.path.join(settings.doc_dir, path)

    def get(self, path):
        if path.startswith('app/') or path.startswith('node_modules/'):
            try:
                with open(self.get_file_path(path), 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        elif path == 'favicon.ico':
            try:
                with open(self.get_file_path(path), 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        else:
            with open(self.get_file_path('index.html'), 'r') as request_page:
                self.write(request_page.read())
                self.set_status(200)
