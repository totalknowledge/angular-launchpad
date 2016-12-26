import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class WebService {
  private baseUrl: string = 'http://localhost:1234/api/v0';
  constructor(private http: Http) {

  }
  getCollection(collectionName: string): Observable<any[]> {
    let collection = this.http
      .get(`${this.baseUrl}/`+collectionName, {headers: this.getHeaders()})
      .map(mapCollection);
    return collection;
  }
  getRecord(): void {}
  createRecord(): void {}
  saveRecord(): void {}

  private getHeaders(){
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return headers;
  }

  function mapCollection(response:Response): any[]{
    return response.json().results.map(toRecord)
  }

  function toRecord(result:any): any{
    let record = <any>({
      id: result.id,
      url: result.url,
      name: result.name,
      weight: result.mass,
      height: result.height,
    });
    console.log('Parsed record:', record);
    return record;
  }
}
