import os, sys, json, getopt

doc_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

with open('launchpad.conf', 'r') as fb:
   CONF_OPTIONS = json.load(fb, strict=False)

def parse_args(argv):
   global CONF_OPTIONS
   try:
      opts, args = getopt.getopt(argv,"hp:c:vl:d:",
                                 ["help",
                                  "port=",
                                  "conf=",
                                  "version",
                                  "log=",
                                  "database=",
                                  "pw=",
                                  "password="])
   except getopt.GetoptError:
      print('test.py -p <portnumber> -c <configfile> -d <database:port> -p <password>')
      sys.exit(2)
   for opt, arg in opts:
     if opt in ('-h', "--help"):
         print('Usage: backend.py [options]')
         print()
         print('Options:')
         print('-h, --help \t\tprint this message')
         print('-v, --version \t\tprint Launchpad version')
         print('-p, --port \t\tprovide portnumber for Launchpad to use')
         print('-c, --conf \t\tuse configuration file provided')
         print('-l, --log \t\tlog to file instead of standard out')
         print('--db, --database \teither pickle or mongodb:portnumber')
         print('--pw, --password \tpassword used with mongodb')
         print()
         print('Documentation can be found at https://github.com/totalknowledge/angular2-launchpad')
         sys.exit()
     elif opt in ("-v", "--version"):
         print('v0.1')
         sys.exit()
     elif opt in ("-c", "--conf"):
         with open(arg, 'r') as fb:
            CONF_OPTIONS = json.load(fb, strict=False)
     elif opt in ("-p", "--port"):
         CONF_OPTIONS["port"] = int(arg)
     elif opt in ("-l", "--log"):
         CONF_OPTIONS["logfile"] = arg
     elif opt in ("-d", "--database"):
         CONF_OPTIONS["database"] = arg
     elif opt in ("-w", "--password"):
         CONF_OPTIONS["password"] = arg
