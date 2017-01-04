# angular-demos

Trying to figure out how to change the name.  This project is meant to be a rapid platform that Angular2 apps and Demo's requiring web services can be rapidly prototyped.  The platform should actually scale pretty well __look for benchmarks in the future__ and will be even more production ready with the addition of MongoDB after initial prototype.

## Dependancies
* Python (tested with 2.7.11+ and 3.5.2)
* Visual C++ for Python 2.7
* Node.js (tested with 4.2.6)
* npm
* pip (optional)

## Getting code and Starting
Clone the repository with "git clone https://github.com/totalknowledge/angular-demos.git"

### Additional setup steps
* pip install -r requirements.txt
* npm install

## Starting Typescript Compiler and Backend Process
npm start

## Writing Angular2
The Angular2 documentation site is an excellent resource on where to start.

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
