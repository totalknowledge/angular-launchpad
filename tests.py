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
    """ asdfasdf """
    def setUpClass(self):
        """ Setup activities for Test Cases. """
        self.known_values = {"nextval":103,
                             "data":{100:{"name":"Bob Smith", "age":23, "weight":"183 lbs"},
                                     101:{"name":"Jan Smith", "age":22, "weight":"123 lbs"},
                                     102:{"name":"Lucy Smith", "age":3, "weight":"23 lbs"}}}
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
        """ Setup activities for Test Cases. """
        response = yield httpclient.fetch(('http://localhost:8345'+url),
                                          *args,
                                          **kwargs)
        defer.returnValue(response)

    def tearDownClass(self):
        """ Setup activities for Test Cases. """
        #os.remove('pickle_jar/mock.pickle')
        self.listener.stopListening()


class GetTest(TestBaseClass):
    """ asdfasdf """
    @defer.inlineCallbacks
    def some_test_method(self):
        """ Setup activities for Test Cases. """
        res = yield self.fetchit('/api/v0/mock/')
        self.assertEquals(200, res.code)

    def another_test(self):
        """ This is a test, my only test regressed """
        self.assertEquals(200, 200)



if __name__ == "__main__":
    unittest.main(verbosity=2)
