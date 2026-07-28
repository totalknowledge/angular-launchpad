from __future__ import absolute_import
import json
from collections.abc import Mapping

from launchpad.adapters.wardrobejar import WardrobeJar

import tornado.web

def deepupdate(dictinto, dictfrom):
    for attribute, value in dictfrom.items():
        if isinstance(value, Mapping):
            dictinto[attribute] = deepupdate(dictinto.get(attribute, {}), value)
        else:
            dictinto[attribute] = value
    return dictinto

class WebServiceHandler(tornado.web.RequestHandler):
    """ Return arbitrary api calls in json format. """
    def set_default_headers(self):
        self.set_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.set_header("Pragma", "no-cache")
        self.set_header("Expires", "0")

    def get(self, path):
        # Grab the REQUEST_METHOD collection and id if exists from the Request
        jar = WardrobeJar(path)
        record_id = jar.get_id()
        if record_id:
            try:
                result = jar.get_collection()
                response_obj = {"data":result["data"][str(record_id)]}
                self.set_status(200)
                self.write(response_obj)
                self.set_header("Content-Type", "application/vnd.api+json")
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":list(jar.get_collection()["data"].values())}
            response_obj['data'].sort(key = lambda x: x['id'])
            self.set_status(200)
            self.write(response_obj)
            self.set_header("Content-Type", "application/vnd.api+json")

    def post(self, path):
        jar = WardrobeJar(path)
        save_obj = jar.get_collection()
        new_id = save_obj["nextval"]
        if self.request.body:
            record = json.loads(self.request.body.decode('utf-8'))
            if isinstance(record, dict) and 'type' in record:
                record_type = record['type']
            else:
                record_type = jar.get_type()
        else:
            record = ""
            record_type = False
        if isinstance(record, dict) and record_type == jar.get_type():
            if not jar.get_id():
                record.update({"id":str(save_obj["nextval"]),"type":jar.get_type()})
                save_obj["data"][str(new_id)] = record
                save_obj["nextval"] = save_obj["nextval"] + 1
                try:
                    jar.save_collection(save_obj)
                    response_obj = {"data":save_obj["data"][str(new_id)]}
                    self.set_status(201)
                except:
                    response_obj = {"error":{"title": "Error saving record."}}
                    self.set_status(500)
            else:
                response_obj = {"error":{"title":"Forbidden"}}
                self.set_status(403)
        elif not isinstance(record, dict):
            response_obj = {"error":{"title":"Bad Request"}}
            self.set_status(400)
        elif record_type != jar.get_type():
            response_obj = {"error":{"title":"Conflict"}}
            self.set_status(409)
        else:
            response_obj = {"error":{"title":"Bad Request"}}
            self.set_status(400)
        self.write(response_obj)

    def put(self, path):
        jar = WardrobeJar(path)
        record_id = jar.get_id()

        save_obj = jar.get_collection()
        save_obj["data"][str(record_id)] = json.loads(self.request.body.decode('utf-8'))

        response_obj = {"data":{str(record_id):save_obj["data"][str(record_id)]}}
        jar.save_collection(save_obj)
        self.write(response_obj)

    def delete(self, path):
        jar = WardrobeJar(path)
        record_id = jar.get_id()

        if record_id:
            save_obj = jar.get_collection()
            try:
                del save_obj["data"][str(record_id)]
                jar.save_collection(save_obj)
                self.set_status(204)
            except:
                self.set_status(404)
        else:
            jar.save_collection({"nextval":100, "data":{}})
            self.set_status(204)

    def patch(self, path):
        jar = WardrobeJar(path)
        record_id = jar.get_id()
        save_obj = jar.get_collection()
        temp_obj = save_obj["data"][str(record_id)]
        merge_obj = json.loads(self.request.body.decode('utf-8'))
        deepupdate(temp_obj, merge_obj)
        save_obj["data"][str(record_id)] = temp_obj
        response_obj = {"data":{str(record_id):temp_obj}}
        jar.save_collection(save_obj)
        self.write(response_obj)

    def head(self, path):
        jar = WardrobeJar(path)
        record_id = jar.get_id()
        if record_id:
            try:
                result = jar.get_collection()
                response_obj = {"data":result["data"][str(record_id)]}
                self.set_header("Content-Type", "application/vnd.api+json")
                self.set_status(200)
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":list(jar.get_collection()["data"].values())}
            self.set_header("Content-Type", "application/vnd.api+json")
            self.set_status(200)

    def options(self, path):
        self.set_status(200)
        self.set_header("Allow", "HEAD, GET, PUT, PATCH, POST, DELETE, HEAD, OPTIONS")

    def default(self, path):
        self.set_status(405)
        self.write({"error":{"title":"Method Not Allowed"}})
