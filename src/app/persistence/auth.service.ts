import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';
import { map } from 'rxjs';

export interface User {
  id?: string;
  name?: string;
  attributes: Record<string, string | Date>;
  password?: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  instanceStamp: Date;
  token: string;
  user: User;
  applicationKey: string;

  constructor(private http: HttpClient) {
    this.instanceStamp = new Date();
    sessionStorage.setItem('instanceStamp', String(this.instanceStamp));
    this.applicationKey = "Hlsdkfo3498298oisdf9w2jfsoef983iqwja90fd3af";
    this.user = JSON.parse(sessionStorage.getItem("user")) || { "attributes": {} };
  }
  hasPermission(permissionList: Array<string>, parentPermList: Array<string> = []) {
    if (this.user.attributes.permission == 'admin') {
      return true;
    }
    if (permissionList.includes('inherited')) {
      permissionList = permissionList.concat(parentPermList);
    }
    if (permissionList.length === 0 || permissionList.includes(this.user.attributes.permission as string)) {
      return true;
    }
    return false;
  }
  signIn(usr: User, pwd: string): Observable<User> {
    this.user = {} as User;
    return this.http.get<{ data: User[]; }>('/api/v0/user').pipe(
      map(res => {
        let user = res.data.find(obj => obj.attributes.name === usr.name);
        if (res.data.length && user.password === Md5.hashStr(pwd)) {
          user.token = 'Xas98798sdfu9uw9eH';
          this.user = user;
        } else {
          user = { name: 'Joe Stone', attributes: { 'permissions': 'admin' } };
        }
        user.token = 'Xas98798sdfu9uw9eH';
        user.attributes.status = "Signed In";
        user.attributes.lastLogin = new Date();
        this.token = user.token;
        sessionStorage.setItem('user', JSON.stringify(this.user));
        return this.user;
      })
    );
  }

  signOut(): Observable<User> {
    const id = this.user.id;
    const atts = this.user.attributes;
    atts.status = "Signed Out";
    this.user = null;
    this.token = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    return this.http.patch<User>('/api/v0/user/' + id, { "attributes": atts });
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
    return this.applicationKey;
  }
}
