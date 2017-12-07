import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CollectionService } from "../persistence/collection.service";
import { AuthService } from "../persistence/auth.service";
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-main-admin-page',
  providers: [CollectionService, AuthService],
  templateUrl: './main-admin-page.component.html',
  styleUrls: ['./main-admin-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainAdminPageComponent implements OnInit {
  service: CollectionService;
  auth: AuthService;
  displayedColumns = [];
  editableColumns = [];
  fieldType = {};
  fieldLabel = {};
  fieldSelections = {};
  dataSource: MatTableDataSource<any>;
  user: any;
  signedinuser: any = {};
  backupcopy: string;
  edit: boolean;
  users:Array<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(service:CollectionService, auth:AuthService) {
    this.service = service;
    this.auth = auth;
    this.service.setCollection("user");
    this.users = [];
    this.user = createNewUser();
  }
  ngOnInit() {
    this.service.getCollection()
        .subscribe(users => {
          this.users = users;
          this.dataSource = new MatTableDataSource(this.users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
    this.service.getRecord("100", "schema")
        .subscribe(res => {
          let read = [];
          let create = [];
          for (var item in res.attributes) {
            if (this.auth.hasPermission(res.attributes[item].read, res.read)) {
              read[res.attributes[item].order] = item;
              if (this.auth.hasPermission(res.attributes[item].create, res.create)) {
                create[res.attributes[item].order] = item;
              }
            }
            this.fieldLabel[item] = res.attributes[item].label;
            this.fieldType[item] = res.attributes[item].type;
            if (res.attributes[item].values) {
              this.fieldSelections[item] = res.attributes[item].values;
            }
          }
          this.displayedColumns = read.filter(String);
          this.editableColumns = create.filter(String);
        });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  populateUser(usr:any){
    this.user = usr;
  }

  editUser(){
    this.edit = true;
    this.backupcopy = JSON.stringify(this.user);
  }

  cancelEdit(){
    this.user = JSON.parse(this.backupcopy);
    this.edit = false;
  }

  clearUser(){
    this.user = createNewUser();
  }

  patchUser(){
    this.service.patchRecord(this.user.id, this.user)
      .subscribe( result => {
          this.edit = false;
      });
  }

  resetPassWord(){
    this.user.attributes.passWord = Md5.hashStr("Friday");
    this.service.patchRecord(this.user.id, {"attributes": {
      "passWord": this.user.attributes.passWord}})
      .subscribe( result => {
          this.user.passWord = Md5.hashStr("Friday");
      });
  }

  createUser(){
    this.service.createRecord(this.user).subscribe(
      result => {
        this.user.id = result.id;
        this.users.push(this.user);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.user = createNewUser();
      });
  }
}

function createNewUser(): any {
  return { "attributes": {} };
}
