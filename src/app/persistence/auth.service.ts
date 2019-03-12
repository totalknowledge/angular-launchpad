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
    this.user = JSON.parse(sessionStorage.getItem("user")) || {"attributes":{}};
  }
  hasPermission(permissionList: Array<any>, parentPermList: Array<any>) {
    if(this.user.attributes.permission == 'admin') {
      return true;
    }
    if(permissionList.includes('inherited')) {
      permissionList = permissionList.concat(parentPermList);
    }
    if(permissionList.includes(this.user.attributes.permission)) {
      return true;
    }
    return false;
  }
  signIn(usr, pwd): Observable<any> {
    this.user = {}
    return this.http.get('/api/v0/user').map(res => {
      this.user = res['data'].filter(function(obj){
        return obj.attributes.userName === usr;
      })[0];
      if(this.user['attributes']['passWord'] === Md5.hashStr(pwd)) {
        this.user.token = 'Xas98798sdfu9uw9eH';
        sessionStorage.setItem('user', JSON.stringify(this.user));
        sessionStorage.setItem('token', this.token);
        this.user['attributes']['status'] = "Signed In";
        this.user['attributes']['lastLogin'] = new Date();
        this.http.patch('/api/v0/user/'+this.user.id, {"attributes": this.user.attributes}).subscribe(
          res => {}
        );
      } else {
        this.user = {"attributes":{}};
      }
      return this.user;
    });
  }
  signOut(): Observable<any> {
    let id = this.user.id;
    let atts = this.user.attributes;
    atts.status = "Signed Out";
    this.user = null;
    this.token = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    return this.http.patch('/api/v0/user/'+id, {"attributes": atts});
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
