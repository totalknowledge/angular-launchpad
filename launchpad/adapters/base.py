from abc import ABCMeta, abstractmethod

class BaseAdapter(object):
    __metaclass__ = ABCMeta

    @abstractmethod
    def get_collection(self, collection, order_by = None, filter_by = None, page = None):
        return []

    @abstractmethod
    def get_record(self, collection, id):
        return {}

    @abstractmethod
    def set_record(self, collection, record, id):
        return []

    @abstractmethod
    def delete_collection(self, collection):
        return []

    @abstractmethod
    def delete_record(self, collection, id):
        return []
