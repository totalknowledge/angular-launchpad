#!/usr/bin/env python

import os, sys, json, cPickle
import cyclone.web

from twisted.internet import reactor
from twisted.python import log

def getPickle(fp):
	try:
		rfile = open(fp, 'rb')
		rfile_contents = cPickle.load(rfile)
		rfile.close()
		return rfile_contents
	except EOFError:
		return {"nextval":100,
				"data":{}
			   }

def savePickle(fp, obj):
	wfile = open(fp, 'wb')
	wfile.write(cPickle.dumps(obj, 2))
	wfile.close()

class MainHandler(cyclone.web.RequestHandler):
    def get(self):
        self.write("Hello, world get")
    def post(self):
        self.write("Hello, world post")
    def put(self):
        self.write("Hello, world put")
    def delete(self):
        self.write("Hello, world delete")
    def patch(self):
        self.write("Hello, world patch")

class WebServiceHandler(cyclone.web.RequestHandler):
    def get(self, path):
		# Grab the REQUEST_METHOD collection and id if exists from the Request
		id = 0
		path_info = path.split('/')

		collection = path_info[0]
		file_path = 'pickle_jar/' + collection + '.pickle'
		open(file_path, 'a+').close()

		if len(path_info) > 1:
			id = path_info[1]

		if id:
			result = getPickle(file_path)
			try:
				response_obj = {"data":{str(id):result["data"][str(id)]}}
				self.write(response_obj)
			except:
				self.set_status(404)
		else:
			response_obj = {"data":getPickle(file_path)["data"]}
			self.write(response_obj)

    def post(self, path):
		path_info = path.split('/')

		collection = path_info[0]
		file_path = 'pickle_jar/' + collection + '.pickle'
		open(file_path, 'a+').close()

		save_obj = getPickle(file_path)
		id = save_obj["nextval"]
		save_obj["data"][str(id)] = json.loads(self.request.body)
		save_obj["nextval"] = save_obj["nextval"] + 1
		self.set_status(201)
		response_obj = {"data":{str(id):save_obj["data"][str(id)]}}
		savePickle(file_path, save_obj)
		self.write(response_obj)

    def put(self, path):
		id=0
		path_info = path.split('/')
		collection = path_info[0]
		file_path = 'pickle_jar/' + collection + '.pickle'
		open(file_path, 'a+').close()

		if len(path_info) > 1:
			id = path_info[1]

		save_obj = getPickle(file_path)
		save_obj["data"][str(id)] = json.loads(self.request.body)

		response_obj = {"data":{str(id):save_obj["data"][str(id)]}}
		savePickle(file_path, save_obj)
		self.write(response_obj)

    def delete(self, path):
		id=0
		path_info = path.split('/')

		collection = path_info[0]
		file_path = 'pickle_jar/' + collection + '.pickle'
		open(file_path, 'a+').close()

		if len(path_info) > 1:
			id = path_info[1]

		if id:
			save_obj = getPickle(file_path)
			try:
				del save_obj["data"][str(id)]
				savePickle(file_path, save_obj)
				self.set_status(204)
			except:
				self.set_status(404)
		else:
			savePickle(file_path, {"nextval":100,
								   "data":{}
								  })
			self.set_status(204)

    def patch(self, path):
        self.write("Not Implemented")

if __name__ == "__main__":

	# Make pickle_jar if it doesn't exist
	if not os.path.exists("pickle_jar"):
		os.makedirs("pickle_jar")

	application = cyclone.web.Application([
		(r"/", MainHandler),
		(r"/ws/(.*)", WebServiceHandler)
	])

	log.startLogging(sys.stdout)
	reactor.listenTCP(1234, application)
	reactor.run()
