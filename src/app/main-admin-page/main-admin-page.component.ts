import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { CollectionService } from "../persistence/collection.service";
import { AuthService, User } from "../persistence/auth.service";
import { Md5 } from 'ts-md5';

@Component({
  selector: 'app-main-admin-page',
  imports: [
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    DatePipe,
    FormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './main-admin-page.component.html',
  styleUrl: './main-admin-page.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MainAdminPageComponent implements OnInit {
  displayedColumns = [];
  editableColumns = [];
  fieldType = {};
  fieldLabel = {};
  fieldSelections = {};
  dataSource: MatTableDataSource<User>;
  user: User;
  signedinuser: User = {} as User;
  backupcopy: string;
  edit: boolean;
  users: Array<User>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private service: CollectionService, private auth: AuthService) {
    this.users = [];
    this.user = createNewUser();
  }
  ngOnInit() {
    this.service.getCollection("user")
      .subscribe(users => {
        this.users = users;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    this.service.getRecord("schema", "100")
      .subscribe({
        next: res => {
          const read = [];
          const create = [];
          for (const item in res.attributes) {
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
        }
      });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  populateUser(usr: User) {
    this.user = usr;
  }

  editUser() {
    this.edit = true;
    this.backupcopy = JSON.stringify(this.user);
  }

  cancelEdit() {
    this.user = JSON.parse(this.backupcopy);
    this.edit = false;
  }

  clearUser() {
    this.user = createNewUser();
  }

  patchUser() {
    this.service.patchRecord("user", this.user.id, this.user).subscribe({
      next: () => {
        this.edit = false;
      }
    });
  }

  resetpassword() {
    this.user.attributes.password = Md5.hashStr("Friday");
    this.service.patchRecord("user", this.user.id, {
      "attributes": {
        "password": this.user.attributes.password
      }
    })
      .subscribe(() => {
        this.user.password = Md5.hashStr("Friday");
      });
  }

  createUser() {
    this.service.createRecord("user", this.user).subscribe(
      result => {
        this.user.id = result.id;
        this.users.push(this.user);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.user = createNewUser();
      });
  }
}

export function createNewUser(): User {
  return { "attributes": {} } as User;
}
