import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, User } from './persistence/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  user: User;
  passwd: string;
  loggedin: boolean;
  displayName: string;

  constructor(protected service: AuthService, private dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
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
      next: (signedOutObject) => {
        this.user = signedOutObject;
        this.router.navigate(['/']);
        this.loggedin = false;
      }
    });
  }
}
