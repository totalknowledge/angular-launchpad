from __future__ import absolute_import
import pickle
import re

class PickleJar(object):
    """ Store persistant data in pickle files. """
    def __init__(self, path):
        self.record_id = 0
        self.path_info = path.split('/')
        if len(self.path_info) > 1:
            self.record_id = self.path_info[1]
        self.collection = self.sanitize_collection(self.path_info[0])
        self.file_path = 'pickle_jar/' + self.collection + '.pickle'
        self.file_buffer = open(self.file_path, 'a+').close()
        self.collection_contents = {}
    def sanitize_collection(self, collection_name):
        """ make sure collection_name is only alpha/numeric """
        sanitized_collection = re.sub(r'[^a-zA-Z0-9]', '', collection_name)
        return sanitized_collection
    def get_id(self):
        """ Return the ID of the record if any. """
        return self.record_id
    def get_type(self):
        """ Retrive collection type """
        return self.collection
    def get_pickle(self):
        """ Retrive collection from disk. """
        try:
            with open(self.file_path, 'rb') as file_buffer:
                self.collection_contents = pickle.load(file_buffer)
        except EOFError:
            self.collection_contents = {"nextval": 100, "data": {}}
        return self.collection_contents
    def save_pickle(self, obj):
        """ Save collection to disk. """
        with open(self.file_path, 'wb') as file_buffer:
            pickle.dump(obj, file_buffer, pickle.HIGHEST_PROTOCOL)
