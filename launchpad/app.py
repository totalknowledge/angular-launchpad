from __future__ import absolute_import
import os
import sys

import tornado.web
from launchpad import settings
from launchpad.adapters.picklejar import PickleJar

# Make pickle_jar if it doesn't exist
if not os.path.exists(os.path.join(settings.doc_dir, "pickle_jar")):
        os.makedirs(os.path.join(settings.doc_dir, "pickle_jar"))
        pkl_jr = PickleJar("user")
        usersInit = {"data": { "100": {
                            "attributes": {
                                "userName": "admin",
                                "firstName": "System",
                                "permission": "admin",
                                "lastName": "Administrator",
                                "passWord": "c33b138a163847cdb6caeeb7c9a126b4",
                                "email": "admin@localhost.com"
                            },
                            "type": "user",
                            "id": "100"}},
                        "nextval": 101
                    }
        pkl_jr.save_pickle(usersInit)
        pkl_jr = PickleJar("schema")
        userSchema = {"data": { "100": {
                          "id": "100",
                          "type": "collection",
                          "create": ["admin"],
                          "read": ["admin"],
                          "update": ["admin"],
                          "tip": "Users that can access Angular Launchpad protected areas.",
                          "schema": "locked",
                          "collection": "user",
                          "class": ["user"],
                          "attributes": {
                            "id": {
                              "type": "identity",
                              "create": ["system"],
                              "read": ["inherited"],
                              "delete": ["inherited"],
                              "tip": "System generated User ID.",
                              "label": "ID",
                              "class": ["userid"],
                              "order": 1
                            },
                            "userName": {
                              "type": "text",
                              "required": True,
                              "create": ["inherited"],
                              "read": ["inherited"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": True,
                              "key": "primary",
                              "tip": "Unique identifier for Sign In.",
                              "label": "User Name",
                              "class": ["username"],
                              "order": 0
                            },
                            "firstName": {
                              "type": "text",
                              "required": True,
                              "create": ["inherited"],
                              "read": ["inherited"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": True,
                              "tip": "User's first name.",
                              "label": "First Name",
                              "class": ["userfirstname"],
                              "order": 2
                            },
                            "lastName": {
                              "type": "text",
                              "required": True,
                              "create": ["inherited"],
                              "read": ["inherited"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": True,
                              "tip": "User's last name.",
                              "label": "Last Name",
                              "class": ["userlastname"],
                              "order": 3
                            },
                            "lastLogin": {
                              "type": "datetime-local",
                              "required": True,
                              "create": ["system"],
                              "read": ["inherited"],
                              "update": ["system"],
                              "delete": ["inherited"],
                              "indexed": False,
                              "tip": "When the user was last signed in.",
                              "label": "Last Login",
                              "class": ["userlastlogin"],
                              "order": 4
                            },
                            "passWord": {
                              "type": "password",
                              "required": True,
                              "create": ["inherited"],
                              "read": ["system"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": False,
                              "order": 5
                            },
                            "status": {
                              "type": "select",
                              "values": ["Signed Out", "Inactive", "Signed In"],
                              "required": True,
                              "create": ["system"],
                              "read": ["inherited"],
                              "update": ["system"],
                              "delete": ["inherited"],
                              "indexed": False,
                              "tip": "User's status.",
                              "label": "Status",
                              "class": ["userstatus"],
                              "order": 6
                            },
                            "permission": {
                              "type": "select",
                              "values": ["admin", "user", "beta"],
                              "required": True,
                              "create": ["inherited"],
                              "read": ["inherited"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": False,
                              "tip": "User's permissions.",
                              "label": "Permission",
                              "class": ["userpermission"],
                              "order": 7
                            },
                            "email": {
                              "type": "email",
                              "required": True,
                              "create": ["inherited"],
                              "read": ["inherited"],
                              "update": ["inherited"],
                              "delete": ["inherited"],
                              "indexed": True,
                              "tip": "User's email.",
                              "label": "Email",
                              "class": ["useremail"],
                              "order": 8
                            }
                          },
                          "links": {
                            "self": "api/v0/schema/100",
                            "collection": "api/v0/collection"
                          }
                        }},
                        "nextval": 101
                    }
        pkl_jr.save_pickle(userSchema)

# Late import
from launchpad.handlers import MainHandler
from launchpad.handlers import WebServiceHandler

app = tornado.web.Application([
        (r"/api/v0/(.*)", WebServiceHandler),
        (r"/api/(.*)", WebServiceHandler),
        (r"/(.*)", MainHandler)
    ])
