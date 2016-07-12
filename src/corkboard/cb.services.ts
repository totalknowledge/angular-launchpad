import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class CollectionService {
    constructor(private http:Http) {
      this.http = http;
    }
    getCollection(collection) {
      return this.http.get('/api/v0/'+collection)
         .map(res => res.json().data);
    }
    getRecord(collection:string, id:string) {
      return this.http.get('/api/v0/'+collection+'/'+id)
         .map(res => res.json().data);
    }
    deleteRecord(collection:string, id:string) {
      return this.http.delete('/api/v0/'+collection+'/'+id)
    }
    saveRecord(collection:string, id:string, saveObj) {
      return this.http.put('/api/v0/'+collection+'/'+id, JSON.stringify(saveObj))
    }
    patchRecord(collection:string, id:string, saveFragment) {
      return this.http.patch('/api/v0/'+collection+'/'+id, JSON.stringify(saveFragment))
    }
    createRecord(collection:string, saveObj) {
      return this.http.post('/api/v0/'+collection, JSON.stringify(saveObj))
    }
}
