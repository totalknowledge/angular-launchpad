import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CollectionService } from "../persistence/collection.service";
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-main-admin-page',
  providers: [CollectionService],
  templateUrl: './main-admin-page.component.html',
  styleUrls: ['./main-admin-page.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainAdminPageComponent implements OnInit {
  service: CollectionService;
  displayedColumns = [];
  editableColumns = ['userName', 'firstName', 'lastName', 'email'];
  fieldType = {};
  fieldLabel = {};
  dataSource: MatTableDataSource<any>;
  user: any;
  backupcopy: string;
  edit: boolean;
  users:Array<any>;
  next_id: number;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(service:CollectionService) {
    this.service = service;
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
    this.service.getCollection("app.user.model.json", "assets/json/")
        .subscribe(res => {
          let temp = [];
          for (var item in res.attributes) {
            if (res.attributes[item].read[0]=="admin" ||
                (res.attributes[item].read[0]=="inherited" &&
                 res.read == "admin")) {
              temp[res.attributes[item].order] = item;
            }
              this.fieldLabel[item] = res.attributes[item].label;
              this.fieldType[item] = res.attributes[item].type;
          }
          this.displayedColumns = temp.filter(String);
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
    this.service.patchRecord(this.user.id, {"attributes": this.user.attributes})
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
