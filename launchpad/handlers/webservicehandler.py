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
                self.set_header("Content-Type", "application/vnd.api+json")
                self.set_status(200)
                self.write(response_obj)
            except:
                response_obj = {"message":"Record not found."}
                self.set_status(404)
        else:
            response_obj = {"data":pkl_jr.get_pickle()["data"].values()}
            response_obj['data'].sort(key = lambda x: x['id'])
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
