#!/usr/bin/env python

import os, sys, json, cPickle
import cyclone.web

from twisted.internet import reactor
from twisted.python import log

class PickleJar():
	def __init__(self, path):
		self.id = 0
		self.path_info = path.split('/')
		if len(self.path_info) > 1:
			self.id = self.path_info[1]
		self.collection = self.path_info[0]
		self.file_path = 'pickle_jar/' + self.collection + '.pickle'
		open(self.file_path, 'a+').close()
	def getID(self):
		return self.id
	def getPickle(self):
		try:
			self.file_buffer = open(self.file_path, 'rb')
			self.collection_contents = cPickle.load(self.file_buffer)
			self.file_buffer.close()
		except EOFError:
			self.collection_contents = {"nextval":100, "data":{}}
		return self.collection_contents
	def savePickle(self, obj):
		self.file_buffer = open(self.file_path, 'wb')
		self.file_buffer.write(cPickle.dumps(obj, 2))
		self.file_buffer.close()

class MainHandler(cyclone.web.RequestHandler):
    def get(self, path):
		if path.startswith('app/') or path.startswith('node_modules/'):
			try:
				with open(path, 'rb') as request_page:
					self.write(request_page.read())
					self.set_status(200)
			except:
				self.write("<h1 style='font-family: Arial, Helvetica, sans-serif ; margin: 20px ;'>404 File Not Found</h1>")
				self.set_status(404)
		elif path == 'favicon.ico':
			try:
				with open(path, 'rb') as request_page:
					self.write(request_page.read())
					self.set_status(200)
			except:
				self.write("")
				self.set_status(200)
		else:
			with open('index.html', 'r') as request_page:
				self.write(request_page.read())
				self.set_status(200)

class WebServiceHandler(cyclone.web.RequestHandler):
    def get(self, path):
		# Grab the REQUEST_METHOD collection and id if exists from the Request
		pkl_jr = PickleJar(path)
		pkl_id = pkl_jr.getID()
		if pkl_id:
			try:
				result = pkl_jr.getPickle()
				response_obj = {"data":{str(pkl_id):result["data"][str(pkl_id)]}}
				self.write(response_obj)
			except:
				response_obj = {"message":"Record not found."}
				self.set_status(404)
		else:
			response_obj = {"data":pkl_jr.getPickle()["data"]}
			self.write(response_obj)

    def post(self, path):
		pkl_jr = PickleJar(path)
		save_obj = pkl_jr.getPickle()
		new_id = save_obj["nextval"]

		save_obj["data"][str(new_id)] = json.loads(self.request.body)
		save_obj["nextval"] = save_obj["nextval"] + 1

		try:
			pkl_jr.savePickle(save_obj)
			response_obj = {"data":{str(new_id):save_obj["data"][str(new_id)]}}
			self.set_status(201)
		except:
			response_obj = {"message":"Error saving record."}
			self.set_status(500)
		self.write(response_obj)

    def put(self, path):
		pkl_jr = PickleJar(path)
		pkl_id = pkl_jr.getID()

		save_obj = pkl_jr.getPickle()
		save_obj["data"][str(pkl_id)] = json.loads(self.request.body)

		response_obj = {"data":{str(pkl_id):save_obj["data"][str(pkl_id)]}}
		pkl_jr.savePickle(save_obj)
		self.write(response_obj)

    def delete(self, path):
		pkl_jr = PickleJar(path)
		pkl_id = pkl_jr.getID()

		if pkl_id:
			save_obj = pkl_jr.getPickle()
			try:
				del save_obj["data"][str(pkl_id)]
				pkl_jr.savePickle(save_obj)
				self.set_status(204)
			except:
				self.set_status(404)
		else:
			pkl_jr.savePickle({"nextval":100, "data":{} })
			self.set_status(204)

    def patch(self, path):
		pkl_jr = PickleJar(path)
		pkl_id = pkl_jr.getID()
		save_obj = pkl_jr.getPickle()
		temp_obj = save_obj["data"][str(pkl_id)]
		merge_obj = json.loads(self.request.body)
		temp_obj.update(merge_obj)
		save_obj["data"][str(pkl_id)] = temp_obj
		response_obj = {"data":{str(pkl_id):temp_obj}}
		pkl_jr.savePickle(save_obj)
		self.write(response_obj)

if __name__ == "__main__":

	# Make pickle_jar if it doesn't exist
	if not os.path.exists("pickle_jar"):
		os.makedirs("pickle_jar")

	application = cyclone.web.Application([
		(r"/api/v0/(.*)", WebServiceHandler),
		(r"/api/(.*)", WebServiceHandler),
		(r"/(.*)", MainHandler)
	])

	log.startLogging(sys.stdout)
	reactor.listenTCP(1234, application)
	reactor.run()
