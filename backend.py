#!/usr/bin/env python
""" Webserver focused on returning arbitrary api calls """

import os
import sys
import json
import cPickle
import cyclone.web

from twisted.internet import reactor
from twisted.python import log

class PickleJar(object):
    """ Store persistant data in pickle files. """
    def __init__(self, path):
        self.record_id = 0
        self.path_info = path.split('/')
        if len(self.path_info) > 1:
            self.record_id = self.path_info[1]
        self.collection = self.path_info[0]
        self.file_path = 'pickle_jar/' + self.collection + '.pickle'
        self.file_buffer = open(self.file_path, 'a+').close()
        self.collection_contents = {}
    def get_id(self):
        """ Return the ID of the record if any. """
        return self.record_id
    def get_type(self):
        """ Retrive collection type """
        return self.collection
    def get_pickle(self):
        """ Retrive collection from disk. """
        try:
            self.file_buffer = open(self.file_path, 'rb')
            self.collection_contents = cPickle.load(self.file_buffer)
            self.file_buffer.close()
        except EOFError:
            self.collection_contents = {"nextval":100, "data":{}}
        return self.collection_contents
    def save_pickle(self, obj):
        """ Save collection to disk. """
        self.file_buffer = open(self.file_path, 'wb')
        self.file_buffer.write(cPickle.dumps(obj, 2))
        self.file_buffer.close()

class MainHandler(cyclone.web.RequestHandler):
    """ Return files from app and node_modules otherwise return index.html"""
    def get(self, path):
        if path.startswith('app/') or path.startswith('node_modules/'):
            try:
                with open(path, 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        elif path == 'favicon.ico':
            try:
                with open(path, 'rb') as request_page:
                    self.write(request_page.read())
                    self.set_status(200)
            except Exception as e:
                self.write('''<h1 style="font-family: Arial, Helvetica, sans-serif;
                           margin: 20px;">404 File Not Found</h1>''')
                self.set_status(404)
        else:
            with open('index.html', 'r') as request_page:
                self.write(request_page.read())
                self.set_status(200)

class WebServiceHandler(cyclone.web.RequestHandler):
    """ Return arbitrary api calls in json format. """
    def get(self, path):
        # Grab the REQUEST_METHOD collection and id if exists from the Request
        pkl_jr = PickleJar(path)
        pkl_id = pkl_jr.get_id()
        if pkl_id:
            try:
                result = pkl_jr.get_pickle()
                response_obj = {"data":result["data"][str(pkl_id)]}
                self.set_header("Content-Type", "application/vnd.api+json")
                self.set_status(200)
                self.write(response_obj)
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":pkl_jr.get_pickle()["data"].values()}
            self.set_header("Content-Type", "application/vnd.api+json")
            self.set_status(200)
            self.write(response_obj)

    def post(self, path):
        pkl_jr = PickleJar(path)
        save_obj = pkl_jr.get_pickle()
        new_id = save_obj["nextval"]
        record = json.loads(self.request.body)
        record.update({"id":save_obj["nextval"],"type":pkl_jr.get_type()})
        save_obj["data"][str(new_id)] = record
        save_obj["nextval"] = save_obj["nextval"] + 1

        try:
            pkl_jr.save_pickle(save_obj)
            response_obj = {"data":save_obj["data"][str(new_id)]}
            self.set_status(201)
        except:
            response_obj = {"message":"Error saving record."}
            self.set_status(500)
        self.write(response_obj)

    def put(self, path):
        pkl_jr = PickleJar(path)
        pkl_id = pkl_jr.get_id()

        save_obj = pkl_jr.get_pickle()
        save_obj["data"][str(pkl_id)] = json.loads(self.request.body)

        response_obj = {"data":{str(pkl_id):save_obj["data"][str(pkl_id)]}}
        pkl_jr.save_pickle(save_obj)
        self.write(response_obj)

    def delete(self, path):
        pkl_jr = PickleJar(path)
        pkl_id = pkl_jr.get_id()

        if pkl_id:
            save_obj = pkl_jr.get_pickle()
            try:
                del save_obj["data"][str(pkl_id)]
                pkl_jr.save_pickle(save_obj)
                self.set_status(204)
            except:
                self.set_status(404)
        else:
            pkl_jr.save_pickle({"nextval":100, "data":{}})
            self.set_status(204)

    def patch(self, path):
        pkl_jr = PickleJar(path)
        pkl_id = pkl_jr.get_id()
        save_obj = pkl_jr.get_pickle()
        temp_obj = save_obj["data"][str(pkl_id)]
        merge_obj = json.loads(self.request.body)
        temp_obj.update(merge_obj)
        save_obj["data"][str(pkl_id)] = temp_obj
        response_obj = {"data":{str(pkl_id):temp_obj}}
        pkl_jr.save_pickle(save_obj)
        self.write(response_obj)

if __name__ == "__main__":

    # Make pickle_jar if it doesn't exist
    if not os.path.exists("pickle_jar"):
        os.makedirs("pickle_jar")

    web_app = cyclone.web.Application([
        (r"/api/v0/(.*)", WebServiceHandler),
        (r"/api/(.*)", WebServiceHandler),
        (r"/(.*)", MainHandler)
    ])

    log.startLogging(sys.stdout)
    reactor.listenTCP(1234, web_app)
    reactor.run()
