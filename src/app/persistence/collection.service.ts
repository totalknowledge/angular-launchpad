import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable()
export class CollectionService {
  apiUrl: string;
  collection: string;

  constructor(private http: HttpClient) {
    this.apiUrl = '/api/v0/';
  }

  setCollection(coll: string, api = this.apiUrl) {
    this.apiUrl = api;
    this.collection = coll;
  }

  setApiUrl(api = this.apiUrl) {
    this.apiUrl = api;
  }

  getCollection(coll = this.collection, api = this.apiUrl) {
    return this.http.get(api + coll)
      .pipe(map(res => res["data"]));
  }

  getSchema(coll = this.collection, api = this.apiUrl) {
    return this.http.get(api + "schema/" + coll);
  }

  getSchemas(api = this.apiUrl) {
    return this.http.get(api + "schema");
  }

  getRecord(id: string, coll = this.collection, api = this.apiUrl) {
    return this.http.get(api + coll + '/' + id)
      .pipe(map(res => res["data"]));
  }

  deleteRecord(id: string, coll = this.collection, api = this.apiUrl) {
    return this.http.delete(api + coll + '/' + id);
  }

  saveRecord(id: string, saveObj, coll = this.collection, api = this.apiUrl) {
    return this.http.put(api + coll + '/' + id, JSON.stringify(saveObj));
  }

  patchRecord(id: string, saveFragment, coll = this.collection, api = this.apiUrl) {
    return this.http.patch(api + coll + '/' + id, JSON.stringify(saveFragment));
  }

  createRecord(saveObj, coll = this.collection, api = this.apiUrl) {
    return this.http.post(api + coll, JSON.stringify(saveObj))
      .pipe(map(res => res["data"]));
  }

  static serviceFactory(http: HttpClient, collection: string) {
    const service = new CollectionService(http);
    service.setCollection(collection);
    return service;
  }
}
