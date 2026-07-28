import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

const ngswBypassOptions = {
  headers: {
    'ngsw-bypass': 'true'
  }
};

@Injectable()
export class CollectionService {
  apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = '/api/v0/';
  }

  setApiUrl(api = this.apiUrl) {
    this.apiUrl = api;
  }

  getCollection(coll: string, api = this.apiUrl) {
    return this.http.get(api + coll, ngswBypassOptions)
      .pipe(map(res => res["data"]));
  }

  getSchema(coll: string, api = this.apiUrl) {
    return this.http.get(api + "schema/" + coll, ngswBypassOptions);
  }

  getSchemas(api = this.apiUrl) {
    return this.http.get(api + "schema", ngswBypassOptions);
  }

  getRecord(coll: string, id: string, api = this.apiUrl) {
    return this.http.get(api + coll + '/' + id, ngswBypassOptions)
      .pipe(map(res => res["data"]));
  }

  deleteRecord(coll: string, id: string, api = this.apiUrl) {
    return this.http.delete(api + coll + '/' + id, ngswBypassOptions);
  }

  saveRecord(coll: string, id: string, saveObj, api = this.apiUrl) {
    return this.http.put(api + coll + '/' + id, JSON.stringify(saveObj), ngswBypassOptions);
  }

  patchRecord(coll: string, id: string, saveFragment, api = this.apiUrl) {
    return this.http.patch(api + coll + '/' + id, JSON.stringify(saveFragment), ngswBypassOptions);
  }

  createRecord(coll: string, saveObj, api = this.apiUrl) {
    return this.http.post(api + coll, JSON.stringify(saveObj), ngswBypassOptions)
      .pipe(map(res => res["data"]));
  }

  static serviceFactory(http: HttpClient) {
    const service = new CollectionService(http);
    return service;
  }
}
