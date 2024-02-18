import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService, User } from './persistence/auth.service';
import { DialogService } from './examples/dialog/dialog.service';

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
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<unknown>;

  constructor(protected service: AuthService, private dialog: DialogService, private router: Router) { }

  ngOnInit(): void {
    this.user = this.service.getUser();
    if (this.user.id) {
      this.loggedin = true;
    }
  }

  signIn() {
    this.dialog.open(this.dialogTemplate, [{ label: 'Close', onClick: () => this.dialog.close() }], { name: '', password: '' }).subscribe(result => {
      // Process the result
      if (result) {
        this.service.signIn(result['name'], result['password']).subscribe(result => {
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
