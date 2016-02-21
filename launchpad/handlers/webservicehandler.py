import json

from launchpad.app import db

import cyclone.web


class WebServiceHandler(cyclone.web.RequestHandler):

    def parse_path(self, path):
        self.record_id = 0
        self.path_info = path.split('/')
        if len(self.path_info) > 1:
            self.record_id = self.path_info[1]
        self.collection = self.path_info[0]

        # return self.collection, self.record_id

    """ Return arbitrary api calls in json format. """
    def get(self, path):
        self.parse_path(path)
        if self.record_id:
            result = db.get_record(self.collection, self.record_id)
        else:
            result = db.get_collection(self.collection)

        if result is not None:
            response_obj = {'data': result}
            self.set_status(200)
            self.write(response_obj)
            self.set_header("Content-Type", "application/vnd.api+json")
        else:
            self.set_status(404)

    def post(self, path):
        self.parse_path(path)
        record = json.loads(self.request.body)
            response_obj = {'data': db.set(self.collection, record)}
            self.set_status(201)
        except:
            response_obj = {'message': 'Error saving record.'}
            self.set_status(500)
        self.write(response_obj)

    def put(self, path):
        self.parse_path(path)
        result = json.loads(self.request.body)
        response_obj = {'data': db.set(self.collection, result, self.record_id)}
        self.write(response_obj)

    def patch(self, path):
        self.parse_path(path)
        record = json.loads(self.request.body)
        temp_obj = db.get_record(self.collection, self.record_id)
        temp_obj.update(record)
        response_obj = {'data': db.set(self.collection, temp_obj, self.record_id)}
        self.write(response_obj)

    def delete(self, path):
        self.parse_path(path)
        try:
            if self.record_id:
                db.delete_record(self.collection, self.record_id)
            else:
                db.delete_collection(self.collection)
            self.set_status(204)
        except:
            self.set_status(404)

    def head(self, path):
        self.parse_path(path)
        if self.record_id:
            result = db.get_record(self.collection, self.record_id)
        else:
            result = db.get_collection(self.collection)

        if result:
            response_obj = {'data': result}
            self.set_status(200)
            self.write(response_obj)
            self.set_header("Content-Type", "application/vnd.api+json")
        else:
            self.set_status(404)

    def options(self, path):
        self.set_status(200)
        self.set_header("Allow", "HEAD, GET, PUT, PATCH, POST, DELETE, HEAD, OPTIONS")
