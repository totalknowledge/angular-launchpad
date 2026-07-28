# angular-launchpad

Angular Launchpad is a rapid prototyping shell for Angular applications that need a lightweight dynamic web-service backend. The frontend is updated for Angular 22 and the backend now stores Launchpad collections in embedded Wardrobe instead of local pickle files.

## Dependencies

* Node.js 24.16.0
* npm 11.13.0 or newer
* Python 3.14
* pip
* Rust toolchain, required to build the local `wardrobe-embedded` Python binding
* A sibling checkout of Wardrobe at `../wardrobe`

## Getting Code And Starting

Clone the repository with `git clone https://github.com/totalknowledge/angular-launchpad.git`.

### Additional Setup Steps

* `python -m pip install -r requirements.txt`
* `npm install`

The Python requirements install Tornado, coverage, and the local editable Wardrobe embedded binding from `../wardrobe/bindings/python/wardrobe-embedded`.
`npm start` also checks these Python runtime requirements and installs any missing pieces before building the Angular app.

### Running Tests

* Angular tests and coverage: `npm test`
* Python backend tests: `python test.py`
* Python backend coverage: `npm run test:py`
* Python backend HTML coverage report: `npm run test:py:html`

If you wish to use SSL then generate the key and certificate files in the keys directory add them to the launchpad.conf file as "certfile" and "keyfile". Then define "ssl_port" in launchpad.conf as well.

## Starting Angular And Backend Processes

* Angular dev server: `ng serve`
* Production frontend build plus Python backend: `npm start`
* Production frontend build: `npm run build:prod`

## Writing Angular

The [Angular documentation](https://angular.dev) site is the current resource for Angular guides, API docs, and update guidance.

## Backend Storage

The backend uses embedded Wardrobe storage. Runtime data is written to `wardrobe_data` by default, configurable with `wardrobe_dir` in `launchpad.conf`.
API responses send no-store cache headers so dynamic prototype data is not hidden behind browser or service-worker caches.

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

## Modernization Checklist

* [x] Angular packages updated for Angular 22.
* [x] Angular Material/CDK updated with the Angular framework packages.
* [x] Angular unit tests migrated from Jest/Karma-style assumptions to Vitest.
* [x] Node runtime documented as 24.16.0.
* [x] Python runtime documented as 3.14.
* [x] Python backend coverage wired through `npm run test:py`.
* [x] Angular docs reference updated to `angular.dev`.
* [x] Local pickle storage replaced with embedded Wardrobe storage.
* [x] Runtime generated storage ignored via `wardrobe_data`.
