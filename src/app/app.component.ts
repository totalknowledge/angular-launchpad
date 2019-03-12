import { Component, Inject } from '@angular/core';
import { Router } from "@angular/router"
import { AuthService } from './persistence/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Md5 } from 'ts-md5/dist/md5';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-root',
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  service: AuthService;
  dialog: MatDialog;
  user: any;
  passwd: string;
  loggedin: boolean;
  displayName: string;

  constructor(service:AuthService, dialog: MatDialog, private router: Router){
    this.service = service;
    this.dialog = dialog;
    this.router = router;
    this.user = this.service.getUser();
    if(this.user.id){
      this.loggedin = true;
    }
  }
  signIn(){
    let dialogRef = this.dialog.open(SignInDialog, {
      width: '20%',
      data: { name: "", password: "" }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.service.signIn(result.name, result.password).subscribe(result => {
        this.user = result;
        if(this.user.id){
          this.loggedin = true;
        }
      });
    });
  }
  signOut(){
    this.service.signOut().subscribe(result => {});
    this.user = {"attributes":{}};
    this.router.navigate(['/'])
    this.loggedin = false;
  }
}

/* Dialog Popup for sign in. */
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './app.signindialog.html',
})
export class SignInDialog {

  constructor(
    public dialogRef: MatDialogRef<SignInDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
