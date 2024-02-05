# angular-launchpad

Trying to figure out how to change the name.  This project is meant to be a rapid platform that Angular apps and Demo's requiring web services can be rapidly prototyped.  Up to date with Angular 16.

![Build Status](https://travis-ci.org/totalknowledge/angular-launchpad.svg?branch=master)

## Dependancies
* Python (tested with 3.10.6)
* Node.js (tested with 18.16)
* npm
* pip

## Getting code and Starting
Clone the repository with "git clone https://github.com/totalknowledge/angular-launchpad.git"

### Additional setup steps
* pip install -r requirements.txt
* npm install

If you wish to use SSL then generate the key and certificate files in the keys directory add them to the launchpad.conf file as "certfile" and "keyfile".  Then define "ssl_port" in launchpad.conf as well.

## Starting Typescript Compiler and Backend Process
npm start

## Writing Angular
The [Angular.io](https://angular.io/docs) documentation site is an excellent resource on where to start.

## Using the Dynamic API
The web services can be accessed without any additional setup.  If you want to use a collection, lets say Books, then simply start using the api of /api/books or /api/v0/books the API supports POST, PATCH, PUT, GET, and DELETE.  Using our books example we have the following possible web services for Books

### GET
 API Call      | Result
 --------------|--------
/api/books | Returns the full collection of Books
/api/books/{id} | Returns a single record with id of {id}

### POST
API Call      | Result
--------------|--------
/api/books | Creates a new record in the collection, and returns the created record.

### PUT
API Call      | Result
--------------|--------
/api/books/{id} | Updates the record {id} with the new record sent via request.

### PATCH
API Call      | Result
--------------|--------
/api/books/{id} | Updates the record {id} with a fragment of the record with updates made.

### DELETE
API Call      | Result
--------------|--------
/api/books | Deletes all records in the collection.
/api/books/{id} | Deletes record specified by {id}.
