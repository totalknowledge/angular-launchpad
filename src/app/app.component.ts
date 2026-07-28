import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService, User } from './persistence/auth.service';
import { DialogService } from './examples/dialog/dialog.service';

import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
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
        this.service.signIn({ name: result['name'], attributes: {} }, result['password']).subscribe(result => {
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
