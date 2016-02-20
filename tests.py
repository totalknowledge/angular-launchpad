#!/usr/bin/env trial

"""
A trial unittest setup for testing the backend.py application.
Base on a reply on stackoverflow about unittesting cyclone apps
http://stackoverflow.com/questions/12807992/how-do-i-write-tests-for-cyclone-in-the-style-of-tornado/14977944#14977944

Methods tested:
* GET
* DELETE
"""

import os
import cPickle
import json

import cyclone.web
from twisted.trial import unittest
from twisted.internet import defer, reactor
from cyclone import httpclient

import backend


class BaseTestCase(unittest.TestCase):
    """ Base class for Test Case methods. """

    def setUp(self, *args, **kwargs):
        """ Setup activities for test cases. """

        self._port = 8345
        self._app = self.get_app()
        self._listener = None

        # Ensure the picklejar exists and fill it with our known values
        self.setup_pickle_jar()

        # Create our app to use for our tests
        if self._app:
            self._listener = reactor.listenTCP(self._port, self._app)

        return unittest.TestCase.setUp(self, *args, **kwargs)

    def tearDown(self):
        """ Teardown activities for test cases. """

        if self._listener:
            self._listener.stopListening()

    def get_app(self):
        """ Create an instance of our cyclone application. """

        self._app = cyclone.web.Application([
            (r"/api/v0/(.*)", backend.WebServiceHandler),
            (r"/api/(.*)", backend.WebServiceHandler),
            (r"/(.*)", backend.MainHandler)
        ])

        return self._app

    def setup_pickle_jar(self):
        """ Set up our pickle jar. """

        if not os.path.exists("pickle_jar"):
            os.makedirs("pickle_jar")

        file_buffer = open('pickle_jar/mock.pickle', 'wb')
        file_buffer.write(cPickle.dumps(self.get_known_values(), 2))
        file_buffer.close()

    def get_known_values(self):
        """ Save our test values to the pickle jar. """

        self._known_values = {"nextval":103,
                         "schema":{},
                         "data":{100:{"id":100, "name":"Bob Smith", "age":23, "weight":"183 lbs"},
                                 101:{"id":101, "name":"Jan Smith", "age":22, "weight":"123 lbs"},
                                 102:{"id":102, "name":"Lucy Smith", "age":3, "weight":"23 lbs"}}}

        return self._known_values

    @defer.inlineCallbacks
    def fetch(self, url, *args, **kwargs):
        """ Helper method to expose an easy method to fetch a url. """

        response = yield httpclient.fetch('http://localhost:{}{}'.format(self._port, url), *args, **kwargs)
        defer.returnValue(response)


class GetTest(BaseTestCase):

    @defer.inlineCallbacks
    def test_get_collection(self):
        """ Get collection test. """
        res = yield self.fetch('/api/v0/mock/')
        data_body = json.loads(res.body)['data']
        data_length = len(data_body)
        self.assertEquals(200, res.code, msg="Expect code 200, got {}".format(res.code))
        self.assertEquals(3, data_length, msg="Expected data length of 3, got {}".format(data_length))
        self.assertEquals(self.get_known_values()['data'][100]['name'],
                          data_body['100']['name'],
                          msg="Expected {}, got {}".format(self.get_known_values()['data'][100]['name'], data_body['100']['name']))

    @defer.inlineCallbacks
    def test_get_empty_collection(self):
        """ Get empty collection test. """
        res = yield self.fetch('/api/v0/empty/')
        data_length = len(json.loads(res.body)['data'])
        self.assertEquals(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual(0, data_length, msg="Expeced data length of 0, got {}".format(data_length))

    @defer.inlineCallbacks
    def test_get_record(self):
        """ Get record test. """
        res = yield self.fetch('/api/v0/mock/101/')
        self.assertEquals(200, res.code, msg="Expected code 200, got {}".format(res.code))
        # Need check for res.body

    @defer.inlineCallbacks
    def test_get_missing_record(self):
        """ Get missing record test. """
        res = yield self.fetch('/api/v0/mock/201/')
        self.assertEquals(404, res.code, msg="ExpectedCode 404, got {}".format(res.code))


class DeleteTest(BaseTestCase):

    @defer.inlineCallbacks
    def test_delete_record(self):
        """ Delete record test. """
        res = yield self.fetch('/api/v0/mock/101/', method='DELETE')
        self.assertEquals(204, res.code, msg="Expected code 204, got {}".format(res.code))
        # Need check for res.body

    @defer.inlineCallbacks
    def test_delete_missing_record(self):
        """ Delete missing record test. """
        res = yield self.fetch('/api/v0/mock/201/', method='DELETE')
        self.assertEquals(404, res.code, msg="ExpectedCode 404, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_delete_collection(self):
        """ Delete collection test. """
        res = yield self.fetch('/api/v0/mock/', method='DELETE')
        self.assertEquals(204, res.code, msg="Expect code 204, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_delete_empty_collection(self):
        """ Delete empty collection test. """
        res = yield self.fetch('/api/v0/empty/', method='DELETE')
        self.assertEquals(204, res.code, msg="Expected code 204, got {}".format(res.code))
