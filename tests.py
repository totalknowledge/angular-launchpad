#!/usr/bin/env python
""" sadkjfhkjd askdjfk """

import unittest
import os
import cPickle
import cyclone.web
from cyclone import httpclient
from twisted.internet import defer
from twisted.internet import reactor
import backend

class TestBaseClass(unittest.TestCase):
    """ Base Class for Test Cases for Methods """
    @classmethod
    def setUpClass(self):
        """ Setup activities for Test Cases. """
        self.known_values = {"nextval":103,
                             "schema":{},
                             "data":{100:{"id":100, "name":"Bob Smith", "age":23, "weight":"183 lbs"},
                                     101:{"id":101, "name":"Jan Smith", "age":22, "weight":"123 lbs"},
                                     102:{"id":102, "name":"Lucy Smith", "age":3, "weight":"23 lbs"}}}
        # Make pickle_jar if it doesn't exist
        if not os.path.exists("pickle_jar"):
            os.makedirs("pickle_jar")
        application = cyclone.web.Application([
            (r"/api/v0/(.*)", backend.WebServiceHandler),
            (r"/api/(.*)", backend.WebServiceHandler),
            (r"/(.*)", backend.MainHandler)
        ])
        file_buffer = open('pickle_jar/mock.pickle', 'wb')
        file_buffer.write(cPickle.dumps(self.known_values, 2))
        file_buffer.close()
        self.listener = reactor.listenTCP(8345, application)

    @defer.inlineCallbacks
    def fetchit(self, url, *args, **kwargs):
        """ Helper Function for returning HTTP requests. """
        response = yield httpclient.fetch(('http://localhost:1234'+url),
                                             *args,
                                             **kwargs)
        defer.returnValue(response)

    @classmethod
    def tearDownClass(self):
        """ Teardown activities for Test Cases. """
        #os.remove('pickle_jar/mock.pickle')
        self.listener.stopListening()


class GetTest(TestBaseClass):
    """ GET api method test. """
    # Not working checking http://cyclone.io/documentation/httpclient.html
    # Defered https://twistedmatrix.com/documents/current/api/twisted.internet.defer.html#inlineCallbacks
    @defer.inlineCallbacks
    def test_get_collection(self):
        """ Get collection test. """
        res = yield self.fetchit('/api/v0/mock/')
        self.assertEquals(200, res.code, msg="GET Collection Request returned bad code.")
        # Need check for res.body

    @defer.inlineCallbacks
    def test_get_collection(self):
        """ Get collection test. """
        res = yield self.fetchit('/api/v0/mocks/')
        self.assertEquals(200, res.code, msg="GET Collection Request returned bad code.")
        # Need check for res.body being empty [ ]

    @defer.inlineCallbacks
    def test_get_record(self):
        """ Get record test. """
        res = yield self.fetchit('/api/v0/mock/101')
        self.assertEquals(200, res.code)
        # Need check for res.body

    @defer.inlineCallbacks
    def test_get_record(self):
        """ Get record test expected failure. """
        res = yield self.fetchit('/api/v0/mock/201')
        self.assertEquals(404, res.code)
        # Need check for res.body error message


if __name__ == "__main__":
    unittest.main(verbosity=2)
