import cPickle
import os

from base import BaseAdapter
from launchpad import settings

class PickleJar(BaseAdapter):

    def __init__(self):
        self._pickle_jar_dir = os.path.join(settings.doc_dir, 'pickle_jar')

        # Make pickle_jar if it doesn't exist
        if not os.path.exists(self._pickle_jar_dir):
            os.path.makedirs(self._pickle_jar_dir)

    def get_pickle_path(self, collection):
        return os.path.join(self._pickle_jar_dir, '{}.pickle'.format(collection))

    def touch_pickle(self, collection):
        open(self.get_pickle_path(collection), 'a+').close()

    def read_pickle(self, collection):
        # self.touch_pickle(collection)
        try:
            file_buffer = open(self.get_pickle_path(collection), 'rb')
            collection_contents = cPickle.load(file_buffer)
            file_buffer.close()
        except IOError, EOFError:
            return {'nextval': 100, 'data': {}}

        return collection_contents

    def write_pickle(self, collection, contents):
        with open(self.get_pickle_path(collection), 'wb') as file_buffer:
            cPickle.dump(contents, file_buffer)
            # file_buffer.write(cPickle.dumps(contents, 2))

    def get_collection(self, collection, order_by = None, filter_by = None, page = None):
        collection_contents = self.read_pickle(collection)
        return sorted(collection_contents['data'].values(), key = lambda x: x['id'])

    def get_record(self, collection, id):
        collection_contents = self.read_pickle(collection)
        return collection_contents['data'].get(str(id), None)

    def set_record(self, collection, record, id = None):
        
        collection_contents = self.read_pickle(collection)

        if not id:
            id = collection_contents['nextval']
            collection_contents['nextval'] += 1
        elif id >= collection_contents['nextval']:
            # TODO: Check to make sure this nextval doesn't already exist in the pickle.
            collection_contents['nextval'] = str(int(id) + 1)

        record['id'] = str(id)
        record['type'] = collection
        collection_contents['data'][str(id)] = record

        self.write_pickle(collection, collection_contents)

        return record

    def delete_collection(self, collection):
        collection_contents = {'nextval': 100, 'data': {}}
        self.write_pickle(collection, collection_contents)

    def delete_record(self, collection, id):
        collection_contents = self.read_pickle(collection)
        del(collection_contents['data'][str(id)])