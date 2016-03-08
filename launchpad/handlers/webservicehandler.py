import json

from launchpad.adapters.picklejar import PickleJar

import cyclone.web


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
                self.set_status(200)
                self.write(response_obj)
                self.set_header("Content-Type", "application/vnd.api+json")
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":pkl_jr.get_pickle()["data"].values()}
            response_obj['data'].sort(key = lambda x: x['id'])
            self.set_status(200)
            self.write(response_obj)
            self.set_header("Content-Type", "application/vnd.api+json")

    def post(self, path):
        pkl_jr = PickleJar(path)
        save_obj = pkl_jr.get_pickle()
        new_id = save_obj["nextval"]
        if self.request.body:
            record = json.loads(self.request.body)
            if isinstance(record, dict) and type in record.keys():
                record_type = record['type']
            else:
                record_type = pkl_jr.get_type()
        else:
            record = ""
            record_type = False
        if isinstance(record, dict) and record_type == pkl_jr.get_type():
            if not pkl_jr.get_id():
                record.update({"id":str(save_obj["nextval"]),"type":pkl_jr.get_type()})
                save_obj["data"][str(new_id)] = record
                save_obj["nextval"] = save_obj["nextval"] + 1
                try:
                    pkl_jr.save_pickle(save_obj)
                    response_obj = {"data":save_obj["data"][str(new_id)]}
                    self.set_status(201)
                except:
                    response_obj = {"error":{"title": "Error saving record."}}
                    self.set_status(500)
            else:
                response_obj = {"error":{"title":"Forbidden"}}
                self.set_status(403)
        elif record_type != pkl_jr.get_type():
            response_obj = {"error":{"title":"Conflict"}}
            self.set_status(409)
        else:
            response_obj = {"error":{"title":"Bad Request"}}
            self.set_status(400)
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

    def head(self, path):
        pkl_jr = PickleJar(path)
        pkl_id = pkl_jr.get_id()
        if pkl_id:
            try:
                result = pkl_jr.get_pickle()
                response_obj = {"data":result["data"][str(pkl_id)]}
                self.set_header("Content-Type", "application/vnd.api+json")
                self.set_status(200)
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":pkl_jr.get_pickle()["data"].values()}
            self.set_header("Content-Type", "application/vnd.api+json")
            self.set_status(200)

    def options(self, path):
        self.set_status(200)
        self.set_header("Allow", "HEAD, GET, PUT, PATCH, POST, DELETE, HEAD, OPTIONS")

    def default(self, path):
        self.set_status(405)
        self.write({"error":{"title":"Method Not Allowed"}})
