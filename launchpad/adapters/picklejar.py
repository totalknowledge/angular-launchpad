from __future__ import absolute_import
import pickle

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
            self.collection_contents = pickle.load(self.file_buffer)
            self.file_buffer.close()
        except EOFError:
            self.collection_contents = {"nextval":100, "data":{}}
        return self.collection_contents
    def save_pickle(self, obj):
        """ Save collection to disk. """
        self.file_buffer = open(self.file_path, 'wb')
        self.file_buffer.write(pickle.dumps(obj, 2))
        self.file_buffer.close()
