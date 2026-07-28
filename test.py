#!/usr/bin/env python3

"""
A unittest setup for testing the backend.py application.

Methods tested:
* GET
* DELETE
"""

import os
import json
import tempfile
import unittest
from unittest import mock

from tornado.testing import AsyncHTTPTestCase

from launchpad import settings
from launchpad.adapters.wardrobejar import WardrobeJar


class InMemoryWardrobeEngine(object):
    """Small Wardrobe-compatible engine for backend unit tests."""

    def __init__(self):
        self.records = {}
        self.upserts = []

    def reset(self):
        self.records = {}
        self.upserts = []

    def read(self, filter=None, options=None):
        pointer = self.get_pointer(filter)
        if pointer:
            return {"Record": self.records.get(pointer)}
        return {"Records": list(self.records.values())}

    def upsert(self, payload, filter=None, options=None):
        drawer = self.get_drawer(filter)
        record_id = payload.get("_id")
        pointer = "@{}:{}".format(drawer, record_id)
        self.records[pointer] = payload
        self.upserts.append((payload, filter, options))
        return {"Pointers": [pointer]}

    def get_pointer(self, filter):
        if isinstance(filter, dict):
            return filter.get("pointer")
        if isinstance(filter, str) and ":" in filter:
            return filter
        return None

    def get_drawer(self, filter):
        if isinstance(filter, dict):
            return filter.get("drawer")
        if isinstance(filter, str):
            return filter.strip("@")
        return "launchpad_collections"


WARDROBE_TEST_ENGINE = InMemoryWardrobeEngine()
WardrobeJar.set_engine_factory(lambda path: WARDROBE_TEST_ENGINE)

from launchpad import app
from launchpad.handlers.mainhandler import MainHandler


class BaseTestCase(AsyncHTTPTestCase):
    """ Base class for Test Case methods. """

    def __init__(self, methodName='runTest'):
        self._app = None
        self._known_values = None

        super().__init__(methodName)

    def setUp(self):
        """ Setup activities for test cases. """

        # Ensure Wardrobe contains known values for each test.
        self.setup_wardrobe()

        super().setUp()

    def tearDown(self):
        """ Teardown activities for test cases. """

        super().tearDown()

    def get_app(self):
        """ Create an instance of our tornado application. """
        if not self._app:
            self._app = app.app

        return self._app

    def setup_wardrobe(self):
        """Set up our embedded Wardrobe fixture."""

        WARDROBE_TEST_ENGINE.reset()
        for collection, data in self.get_known_values().items():
            self.store_collection(collection, data)

    def store_collection(self, collection, data):
        """Helper method to store mock data in Wardrobe."""
        WardrobeJar(collection).save_collection(data)

    def get_known_values(self):
        """ Return our mock values for all tests. """

        if not self._known_values:
            self._known_values = {
                'mock': {
                    'nextval': 103,
                    'schema': {},
                    'data': {
                        '100': {'id': '100', 'name': 'Bob Smith', 'age': 23, 'weight': '183 lbs'},
                        '101': {'id': '101', 'name': 'Jan Smith', 'age': 22, 'weight': '123 lbs'},
                        '102': {'id': '102', 'name': 'Lucy Smith', 'age': 3, 'weight': '23 lbs'},
                    }
                },
                'empty': {
                    'nextval': 100,
                    'schema': {},
                    'data': {}
                }
            }

        return self._known_values


class GetTest(BaseTestCase):

    def test_get_collection(self):
        """ Get collection test. """
        res = self.fetch('/api/v0/mock/')
        data_body = json.loads(res.body)['data']
        data_length = len(data_body)
        self.assertEqual(
            200, res.code, msg="Expect code 200, got {}".format(res.code))
        self.assertEqual(
            3, data_length, msg="Expected data length of 3, got {}".format(data_length))
        self.assertEqual(self.get_known_values()['mock']['data']['100']['name'],
                          data_body[0]["name"],
                          msg="Expected {}, got {}".format(self.get_known_values()['mock']['data']['100']['name'], data_body[0]["name"]))
        self.assertEqual(
            'no-store, no-cache, must-revalidate, max-age=0',
            res.headers['Cache-Control'],
        )

    def test_get_empty_collection(self):
        """ Get empty collection test. """
        res = self.fetch('/api/v0/empty/')
        data_length = len(json.loads(res.body)['data'])
        self.assertEqual(
            200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual(
            0, data_length, msg="Expeced data length of 0, got {}".format(data_length))

    def test_get_record(self):
        """ Get record test. """
        res = self.fetch('/api/v0/mock/100')
        self.assertEqual(
            200, res.code, msg="Expected code 200, got {}".format(res.code))
        # Need check for res.body

    def test_get_missing_record(self):
        """ Get missing record test. """
        res = self.fetch('/api/v0/mock/201/')
        self.assertEqual(
            404, res.code, msg="ExpectedCode 404, got {}".format(res.code))


class DeleteTest(BaseTestCase):

    def test_delete_record(self):
        """ Delete record test. """
        res = self.fetch('/api/v0/mock/101/', method='DELETE')
        self.assertEqual(
            204, res.code, msg="Expected code 204, got {}".format(res.code))

    def test_delete_missing_record(self):
        """ Delete missing record test. """
        res = self.fetch('/api/v0/mock/201/', method='DELETE')
        self.assertEqual(
            404, res.code, msg="ExpectedCode 404, got {}".format(res.code))

    def test_delete_collection(self):
        """ Delete collection test. """
        res = self.fetch('/api/v0/mock/', method='DELETE')
        self.assertEqual(
            204, res.code, msg="Expect code 204, got {}".format(res.code))

    def test_delete_empty_collection(self):
        """ Delete empty collection test. """
        res = self.fetch('/api/v0/empty/', method='DELETE')
        self.assertEqual(
            204, res.code, msg="Expected code 204, got {}".format(res.code))


class MethodTest(BaseTestCase):

    def test_put_record(self):
        """ Put record test. """
        record = {"id": "100", "name": "Updated Smith", "age": 24, "weight": "180 lbs"}
        res = self.fetch('/api/v0/mock/100', method='PUT', body=json.dumps(record))
        data = json.loads(res.body)['data']

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual(record, data["100"])

    def test_patch_record(self):
        """ Patch record test. """
        patch = {"age": 24, "profile": {"city": "Tulsa"}}
        res = self.fetch('/api/v0/mock/100', method='PATCH', body=json.dumps(patch))
        data = json.loads(res.body)['data']["100"]

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual(24, data["age"])
        self.assertEqual("Tulsa", data["profile"]["city"])
        self.assertEqual("Bob Smith", data["name"])

    def test_head_collection(self):
        """ Head collection test. """
        res = self.fetch('/api/v0/mock/', method='HEAD')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual('application/vnd.api+json', res.headers['Content-Type'])

    def test_head_record(self):
        """ Head record test. """
        res = self.fetch('/api/v0/mock/100', method='HEAD')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual('application/vnd.api+json', res.headers['Content-Type'])

    def test_head_missing_record(self):
        """ Head missing record test. """
        res = self.fetch('/api/v0/mock/201/', method='HEAD')

        self.assertEqual(404, res.code, msg="Expected code 404, got {}".format(res.code))

    def test_options(self):
        """ Options test. """
        res = self.fetch('/api/v0/mock/', method='OPTIONS')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertIn('GET', res.headers['Allow'])


class PostTest(BaseTestCase):

    def test_post_missing_record_id(self):
        """ Post empty record to id test. """
        res = self.fetch('/api/v0/mock/101/', method='POST', body='')
        self.assertEqual(
            400, res.code, msg="Expected code 400, got {}".format(res.code))

    def test_post_missing_record(self):
        """ Post empty record test. """
        res = self.fetch('/api/v0/mock/', method='POST', body='')
        self.assertEqual(
            400, res.code, msg="ExpectedCode 400, got {}".format(res.code))

    def test_post_record(self):
        """ Create record test. """
        res = self.fetch('/api/v0/mock/', method='POST', body=json.dumps({"name": "Lisa Smith", "age": 65, "weight": "120 lbs"}))
        self.assertEqual(
            201, res.code, msg="Expect code 201, got {}".format(res.code))

    def test_post_record_wrong_type(self):
        """ Create record with wrong type test. """
        res = self.fetch('/api/v0/mock/', method='POST', body=json.dumps({"name": "Lisa Smith", "type": "65", "weight": "120 lbs"}))
        self.assertEqual(
            409, res.code, msg="Expect code 409, got {}".format(res.code))

    def test_post_record_id(self):
        """ Attempt to post to id test. """
        res = self.fetch('/api/v0/mock/100', method='POST', body=json.dumps({"name": "Lisa Smith", "age": 65, "weight": "120 lbs"}))
        self.assertEqual(
            403, res.code, msg="Expect code 403, got {}".format(res.code))

    def test_post_list(self):
        """ Attempt to post a list. """
        res = self.fetch('/api/v0/mock/100', method='POST', body=json.dumps([{"name": "Lisa Smith", "age": 65, "weight": "120 lbs"}]))
        self.assertEqual(
            400, res.code, msg="Expect code 400, got {}".format(res.code))


class MainHandlerTest(BaseTestCase):

    def setUp(self):
        os.makedirs(os.path.join('www', 'browser'), exist_ok=True)
        with open(os.path.join('www', 'browser', 'index.html'), 'w', encoding='utf-8') as index_file:
            index_file.write('<html>index</html>')
        with open(os.path.join('www', 'browser', 'sample.js'), 'w', encoding='utf-8') as js_file:
            js_file.write('console.log("sample");')
        with open(os.path.join('www', 'browser', 'styles.css'), 'w', encoding='utf-8') as css_file:
            css_file.write('body { color: black; }')

        super().setUp()

    def test_serves_file_with_known_mimetype(self):
        """ Serve file test. """
        res = self.fetch('/styles.css')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual('text/css', res.headers['Content-Type'])
        self.assertIn('color', res.body.decode('utf-8'))

    def test_adds_default_extension(self):
        """ Serve default extension test. """
        res = self.fetch('/sample')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertEqual('application/javascript', res.headers['Content-Type'])
        self.assertIn('sample', res.body.decode('utf-8'))

    def test_falls_back_to_index(self):
        """ Serve index fallback test. """
        res = self.fetch('/missing-route')

        self.assertEqual(200, res.code, msg="Expected code 200, got {}".format(res.code))
        self.assertIn('index', res.body.decode('utf-8'))

    def test_missing_static_asset_returns_404(self):
        """ Missing static asset test. """
        res = self.fetch('/missing-main.js')

        self.assertEqual(404, res.code, msg="Expected code 404, got {}".format(res.code))
        self.assertNotIn('index', res.body.decode('utf-8'))

    def test_rejects_unsafe_path(self):
        """ Unsafe path test. """
        with self.assertRaises(ValueError):
            MainHandler.get_file_path('../launchpad.conf')


class WardrobeJarTest(unittest.TestCase):

    def setUp(self):
        self.original_options = settings.CONF_OPTIONS.copy()
        WardrobeJar.set_engine_factory(lambda path: WARDROBE_TEST_ENGINE)
        WARDROBE_TEST_ENGINE.reset()

    def tearDown(self):
        settings.CONF_OPTIONS = self.original_options
        WardrobeJar.set_engine_factory(lambda path: WARDROBE_TEST_ENGINE)

    def test_sanitizes_collection_and_reads_id(self):
        """ Collection sanitization test. """
        jar = WardrobeJar('mock-collection/123')

        self.assertEqual('mockcollection', jar.collection)
        self.assertEqual('123', jar.get_id())
        self.assertEqual('mockcollection', jar.get_type())

    def test_missing_collection_returns_default_collection(self):
        """Missing collection test."""
        jar = WardrobeJar('brandnew')

        self.assertEqual({"nextval": 100, "data": {}}, jar.get_collection())

    def test_save_and_reload_collection(self):
        """Save collection test."""
        jar = WardrobeJar('persisted')
        collection = {"nextval": 101, "data": {"100": {"id": "100"}}}
        jar.save_collection(collection)

        self.assertEqual(collection, WardrobeJar('persisted').get_collection())

    def test_save_uses_wardrobe_record_shape(self):
        """Wardrobe payload shape test."""
        collection = {"nextval": 101, "data": {}}

        WardrobeJar('sample').save_collection(collection)

        payload, filter, options = WARDROBE_TEST_ENGINE.upserts[0]
        self.assertEqual("sample", payload["_id"])
        self.assertEqual("sample", payload["collection"])
        self.assertEqual(collection, payload["contents"])
        self.assertEqual({"drawer": "launchpad_collections"}, filter)
        self.assertIsNone(options)

    def test_storage_path_uses_absolute_and_relative_config(self):
        """Wardrobe path configuration test."""
        absolute_path = os.path.join(tempfile.gettempdir(), "launchpad-wardrobe-test")
        settings.CONF_OPTIONS["wardrobe_dir"] = absolute_path

        self.assertEqual(absolute_path, WardrobeJar.storage_path())

        settings.CONF_OPTIONS["wardrobe_dir"] = "custom_wardrobe_data"
        self.assertEqual(
            os.path.join(settings.doc_dir, "custom_wardrobe_data"),
            WardrobeJar.storage_path(),
        )

    def test_engine_is_cached_until_reset(self):
        """Wardrobe engine cache test."""
        calls = []

        def factory(path):
            calls.append(path)
            return InMemoryWardrobeEngine()

        WardrobeJar.set_engine_factory(factory)

        first = WardrobeJar.engine()
        second = WardrobeJar.engine()

        self.assertIs(first, second)
        self.assertEqual(1, len(calls))

        WardrobeJar.reset_engine()
        self.assertIsNot(first, WardrobeJar.engine())

    def test_missing_wardrobe_binding_has_actionable_error(self):
        """Missing Wardrobe binding test."""
        original_import = __import__

        def guarded_import(name, *args, **kwargs):
            if name == "wardrobe_embedded":
                raise ImportError("missing wardrobe")
            return original_import(name, *args, **kwargs)

        WardrobeJar.set_engine_factory(None)
        with mock.patch("builtins.__import__", side_effect=guarded_import):
            with self.assertRaisesRegex(RuntimeError, "wardrobe-embedded is required"):
                WardrobeJar.engine()

    def test_extract_record_accepts_known_wardrobe_shapes(self):
        """Wardrobe result shape test."""
        record = {"contents": {"nextval": 100, "data": {}}}

        cases = [
            (None, None),
            ({}, None),
            ({"Record": record}, record),
            ({"record": record}, record),
            ({"Records": [record]}, record),
            ({"Records": []}, None),
            ({"records": [record]}, record),
            ({"records": []}, None),
            (record, record),
            ([record], record),
            ([], None),
            ("unexpected", None),
        ]

        for result, expected in cases:
            with self.subTest(result=result):
                self.assertEqual(expected, WardrobeJar.extract_record(result))


class SettingsTest(unittest.TestCase):

    def setUp(self):
        self.original_options = settings.CONF_OPTIONS.copy()

    def tearDown(self):
        settings.CONF_OPTIONS = self.original_options

    def test_parse_args_updates_options(self):
        """ Settings argument parsing test. """
        settings.parse_args([
            '--port', '9999',
            '--log', 'launchpad.log',
            '--database', 'wardrobe:test',
            '--password', 'secret',
        ])

        self.assertEqual(9999, settings.CONF_OPTIONS['port'])
        self.assertEqual('launchpad.log', settings.CONF_OPTIONS['logfile'])
        self.assertEqual('wardrobe:test', settings.CONF_OPTIONS['database'])
        self.assertEqual('secret', settings.CONF_OPTIONS['password'])

    def test_parse_args_loads_config_file(self):
        """ Settings config parsing test. """
        with tempfile.NamedTemporaryFile('w', delete=False, encoding='utf-8') as config_file:
            json.dump({"port": 7777, "database": "wardrobe"}, config_file)
            config_path = config_file.name

        try:
            settings.parse_args(['--conf', config_path])
            self.assertEqual(7777, settings.CONF_OPTIONS['port'])
            self.assertEqual('wardrobe', settings.CONF_OPTIONS['database'])
        finally:
            os.remove(config_path)

    def test_parse_args_help_and_version_exit(self):
        """ Settings exit option test. """
        with self.assertRaises(SystemExit):
            settings.parse_args(['--help'])
        with self.assertRaises(SystemExit):
            settings.parse_args(['--version'])


if __name__ == '__main__':
    unittest.main()
