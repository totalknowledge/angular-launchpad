#!/usr/bin/python

import os, sys, cgi, json, cPickle

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

# Make pickle_jar if it doesn't exist
if not os.path.exists("pickle_jar"):
	os.makedirs("pickle_jar")

# Grab the REQUEST_METHOD collection and id if exists from the Request
id = 0
if 'PATH_INFO' in os.environ:
	path_info = os.environ['PATH_INFO'].split('/')
else:
	path_info = ["",'default']

if len(path_info) > 1:
	collection = path_info[1]
	file_path = 'pickle_jar/' + collection + '.pickle'
	open(file_path, 'a+').close()

if len(path_info) > 2:
	id = path_info[2]
	
if 'REQUEST_METHOD' in os.environ:
	request_method = os.environ['REQUEST_METHOD']
else:
	request_method = "GET"

if request_method == "GET":
	if id:
		result = getPickle(file_path)
		try:
			response_obj = {"data":{str(id):result["data"][str(id)]}}
			status_code = '200 OK'
		except:
			status_code = '404 Not Found'
	else:
		response_obj = {"data":getPickle(file_path)["data"]}
		status_code = '200 OK'

elif request_method == "PUT" or request_method == "POST":
	save_obj = getPickle(file_path)
	if id:
		save_obj["data"][str(id)] = json.loads(sys.stdin.read())
		status_code = '200 OK'
	else:
		id = save_obj["nextval"]
		save_obj["data"][str(id)] = json.loads(sys.stdin.read())
		save_obj["nextval"] = save_obj["nextval"] + 1
		status_code = '201 Created'
	response_obj = {"data":{str(id):save_obj["data"][str(id)]}}
	savePickle(file_path, save_obj)

elif request_method == "DELETE":
	if id:
		save_obj = getPickle(file_path)
		try:
			del save_obj["data"][str(id)]
			savePickle(file_path, save_obj)
			status_code = '204 No Content'
		except:
			status_code = '404 Not Found'
	else:
		savePickle(file_path, {"nextval":100,
							   "data":{}
							  })
		status_code = '204 No Content'

print "Status: %s\r" % status_code
print "Content-type:application/json\r\n"

if not (status_code == '204 No Content' or status_code == '404 Not Found'):
	print json.dumps(response_obj)
