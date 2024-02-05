#!/usr/bin/env python3

"""
A unittest setup for testing the backend.py application.

Methods tested:
* GET
* DELETE
"""

from __future__ import absolute_import
import os
import six.moves.cPickle
import json

from tornado.testing import AsyncHTTPTestCase
from tornado import httpclient
from tornado.ioloop import IOLoop

from launchpad import app
import six


class BaseTestCase(AsyncHTTPTestCase):
    """ Base class for Test Case methods. """

    def __init__(self, methodName):
        self._app = None
        self._known_values = None

        super(AsyncHTTPTestCase, self).__init__(methodName)

    def setUp(self):
        """ Setup activities for test cases. """

        # Ensure the picklejar exists and fill it with our known values
        self.setup_pickle_jar()

        super(AsyncHTTPTestCase, self).setUp()

    def tearDown(self):
        """ Teardown activities for test cases. """

        if self._listener:
            self._listener.stopListening()

    def get_app(self):
        """ Create an instance of our tornado application. """
        if not self._app:
            self._app = app.app

        return self._app

    def setup_pickle_jar(self):
        """ Set up our pickle jar. """

        if not os.path.exists("pickle_jar"):
            os.makedirs("pickle_jar")

        for collection, data in six.iteritems(self.get_known_values()):
            self.save_pickle(collection, data)

    def save_pickle(self, collection, data):
        """ Helper method to pickle our mock data to a file. """
        file_buffer = open('pickle_jar/{}.pickle'.format(collection), 'wb')
        file_buffer.write(six.moves.cPickle.dumps(data, 2))
        file_buffer.close()

    def get_known_values(self):
        """ Return our mock values for all tests. """

        if not self._known_values:
            self._known_values = {
                'mock': {
                    'nextval': '103',
                    'schema': {},
                    'data': {
                        '100': {'id': '100', 'name': 'Bob Smith', 'age': 23, 'weight': '183 lbs'},
                        '101': {'id': '101', 'name': 'Jan Smith', 'age': 22, 'weight': '123 lbs'},
                        '102': {'id': '102', 'name': 'Lucy Smith', 'age': 3, 'weight': '23 lbs'},
                    }
                }
            }

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
        self.assertEquals(
            200, res.code, msg="Expect code 200, got {}".format(res.code))
        self.assertEquals(
            3, data_length, msg="Expected data length of 3, got {}".format(data_length))
        self.assertEquals(self.get_known_values()['mock']['data']['100']['name'],
                          data_body[0]["name"],
                          msg="Expected {}, got {}".format(self.get_known_values()['mock']['data']['100']['name'], data_body[0]["name"]))

    @defer.inlineCallbacks
    def test_get_empty_collection(self):
        """ Get empty collection test. """
        res = yield self.fetch('/api/v0/empty/')
        data_length = len(json.loads(res.body)['data'])
        self.assertEquals(
            200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual(
            0, data_length, msg="Expeced data length of 0, got {}".format(data_length))

    @defer.inlineCallbacks
    def test_get_record(self):
        """ Get record test. """
        res = yield self.fetch('/api/v0/mock/100')
        self.assertEquals(
            200, res.code, msg="Expected code 200, got {}".format(res.code))
        # Need check for res.body

    @defer.inlineCallbacks
    def test_get_missing_record(self):
        """ Get missing record test. """
        res = yield self.fetch('/api/v0/mock/201/')
        self.assertEquals(
            404, res.code, msg="ExpectedCode 404, got {}".format(res.code))


class DeleteTest(BaseTestCase):

    @defer.inlineCallbacks
    def test_delete_record(self):
        """ Delete record test. """
        res = yield self.fetch('/api/v0/mock/101/', method='DELETE')
        self.assertEquals(
            204, res.code, msg="Expected code 204, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_delete_missing_record(self):
        """ Delete missing record test. """
        res = yield self.fetch('/api/v0/mock/201/', method='DELETE')
        self.assertEquals(
            404, res.code, msg="ExpectedCode 404, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_delete_collection(self):
        """ Delete collection test. """
        res = yield self.fetch('/api/v0/mock/', method='DELETE')
        self.assertEquals(
            204, res.code, msg="Expect code 204, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_delete_empty_collection(self):
        """ Delete empty collection test. """
        res = yield self.fetch('/api/v0/empty/', method='DELETE')
        self.assertEquals(
            204, res.code, msg="Expected code 204, got {}".format(res.code))


class PostTest(BaseTestCase):

    @defer.inlineCallbacks
    def test_post_missing_record_id(self):
        """ Post empty record to id test. """
        res = yield self.fetch('/api/v0/mock/101/', method='POST')
        self.assertEquals(
            400, res.code, msg="Expected code 400, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_post_missing_record(self):
        """ Post empty record test. """
        res = yield self.fetch('/api/v0/mock/', method='POST')
        self.assertEquals(
            400, res.code, msg="ExpectedCode 400, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_post_record(self):
        """ Create record test. """
        res = yield self.fetch('/api/v0/mock/', method='POST', body={"name": "Lisa Smith", "age": 65, "weight": "120 lbs"})
        self.assertEquals(
            201, res.code, msg="Expect code 201, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_post_record_wrong_type(self):
        """ Create record with wrong type test. """
        res = yield self.fetch('/api/v0/mock/', method='POST', body={"name": "Lisa Smith", "type": "65", "weight": "120 lbs"})
        self.assertEquals(
            409, res.code, msg="Expect code 409, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_post_record_id(self):
        """ Attempt to post to id test. """
        res = yield self.fetch('/api/v0/mock/100', method='POST', body={"name": "Lisa Smith", "age": 65, "weight": "120 lbs"})
        self.assertEquals(
            403, res.code, msg="Expect code 403, got {}".format(res.code))

    @defer.inlineCallbacks
    def test_post_list(self):
        """ Attempt to post a list. """
        res = yield self.fetch('/api/v0/mock/100', method='POST', body=[{"name": "Lisa Smith", "age": 65, "weight": "120 lbs"}])
        self.assertEquals(
            400, res.code, msg="Expect code 400, got {}".format(res.code))
