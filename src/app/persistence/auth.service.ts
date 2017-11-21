import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
  instanceStamp: Date;
  token: string;
  user: any;
  applicationKey: string;

  constructor(private http:HttpClient) {
    this.instanceStamp = new Date();
    sessionStorage.setItem('instanceStamp', String(this.instanceStamp));
    this.applicationKey = "Hlsdkfo3498298oisdf9w2jfsoef983iqwja90fd3af";
  }
  signIn(usr, pwd): Observable<any> {
    this.user = {}
    return this.http.get('/api/v0/user').map(res => {
      this.user = res['data'].filter(function(obj){
        return obj.userName === usr;
      })[0];
      if(this.user['passWord'] === Md5.hashStr(pwd)) {
        this.user.token = 'Xas98798sdfu9uw9eH';
        sessionStorage.setItem('user', JSON.stringify(this.user));
        sessionStorage.setItem('token', this.token);
      } else {
        this.user = {};
      }
      return this.user;
    });
  }
  signOut() {
    this.user = null;
    this.token = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    console.log('Logged Out');
  }
  getInstanceStamp() {
    return this.instanceStamp;
  }
  getToken() {
    return this.token;
  }
  getUser() {
    return this.user;
  }
  getApplicationKey() {
    return this.applicationKey
  }
}
