import os, json

doc_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

with open('launchpad.conf', 'r') as fb:
   CONF_OPTIONS = json.load(fb, strict=False)
