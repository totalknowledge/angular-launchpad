from __future__ import absolute_import

import os
import re

from launchpad import settings


DEFAULT_COLLECTION = {"nextval": 100, "data": {}}
LAUNCHPAD_DRAWER = "launchpad_collections"


class WardrobeJar(object):
    """Store Launchpad collections in embedded Wardrobe."""

    _engine = None
    _engine_factory = None
    _engine_path = None

    def __init__(self, path):
        self.record_id = 0
        self.path_info = path.split('/')
        if len(self.path_info) > 1:
            self.record_id = self.path_info[1]
        self.collection = self.sanitize_collection(self.path_info[0])
        self.collection_contents = {}

    @classmethod
    def set_engine_factory(cls, engine_factory):
        """Allow tests to inject a Wardrobe-compatible in-memory engine."""
        cls._engine = None
        cls._engine_path = None
        cls._engine_factory = engine_factory

    @classmethod
    def reset_engine(cls):
        cls._engine = None
        cls._engine_path = None

    @classmethod
    def storage_path(cls):
        configured_path = settings.CONF_OPTIONS.get("wardrobe_dir", "wardrobe_data")
        if os.path.isabs(configured_path):
            return configured_path
        return os.path.join(settings.doc_dir, configured_path)

    @classmethod
    def engine(cls):
        storage_path = cls.storage_path()
        if cls._engine is not None and cls._engine_path == storage_path:
            return cls._engine

        os.makedirs(storage_path, exist_ok=True)

        if cls._engine_factory is not None:
            cls._engine = cls._engine_factory(storage_path)
        else:
            try:
                from wardrobe_embedded import WardrobeEmbedded
            except ImportError as error:
                raise RuntimeError(
                    "wardrobe-embedded is required for Launchpad storage. "
                    "Run 'python -m pip install -r requirements.txt' from the "
                    "angular-launchpad workspace."
                ) from error
            cls._engine = WardrobeEmbedded.open(storage_path)

        cls._engine_path = storage_path
        return cls._engine

    def sanitize_collection(self, collection_name):
        """Make sure collection_name is only alpha/numeric."""
        return re.sub(r'[^a-zA-Z0-9]', '', collection_name)

    def get_id(self):
        """Return the ID of the record if any."""
        return self.record_id

    def get_type(self):
        """Retrieve collection type."""
        return self.collection

    def get_collection(self):
        """Retrieve a Launchpad collection from Wardrobe."""
        result = self.engine().read({"pointer": self.pointer()})
        record = self.extract_record(result)
        if record and "contents" in record:
            self.collection_contents = record["contents"]
        else:
            self.collection_contents = dict(DEFAULT_COLLECTION)
        return self.collection_contents

    def save_collection(self, obj):
        """Save a Launchpad collection to Wardrobe."""
        self.collection_contents = obj
        self.engine().upsert(
            {
                "_id": self.collection,
                "collection": self.collection,
                "contents": obj,
            },
            {"drawer": LAUNCHPAD_DRAWER},
        )

    def pointer(self):
        return "@{}:{}".format(LAUNCHPAD_DRAWER, self.collection)

    @staticmethod
    def extract_record(result):
        if not result:
            return None
        if isinstance(result, dict):
            if "Record" in result:
                return result["Record"]
            if "record" in result:
                return result["record"]
            if "Records" in result:
                records = result["Records"]
                return records[0] if records else None
            if "records" in result:
                records = result["records"]
                return records[0] if records else None
            if "contents" in result:
                return result
        if isinstance(result, list):
            return result[0] if result else None
        return None
