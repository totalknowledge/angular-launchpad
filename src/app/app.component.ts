import { Component, Inject } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, User } from './persistence/auth.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  providers: [AuthService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  dialog: MatDialog;
  user: User;
  passwd: string;
  loggedin: boolean;
  displayName: string;

  constructor(protected service: AuthService, dialog: MatDialog, private router: Router) {
    this.dialog = dialog;
    this.user = this.service.getUser();
    if (this.user.id) {
      this.loggedin = true;
    }
  }
  signIn() {
    const dialogRef = this.dialog.open(SignInDialogComponent, {
      width: '20%',
      data: { name: "", password: "" }
    });

    dialogRef.afterClosed().subscribe({
      next: result => {
        this.service.signIn(result.name, result.password).subscribe(result => {
          this.user = result;
          if (this.user.id) {
            this.loggedin = true;
          }
        });
      }
    });
  }
  signOut() {
    this.service.signOut().subscribe({
      next: () => {
        this.user = { "attributes": {} };
        this.router.navigate(['/']);
        this.loggedin = false;
      }
    });
  }
}

/* Dialog Popup for sign in. */
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './app.sign-in-dialog.component.html',
})
export class SignInDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SignInDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
