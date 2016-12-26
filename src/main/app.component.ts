import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
      <div class="app-content">
      <md-card>
        <md-tab-group [ngSwitch]="tabnav.top">
          <md-tab (click)="setTab('setup')" label="Setup">
            <p *ngSwitchCase="'setup'"><my-package>Loading...</my-package></p>
          </md-tab>
          <md-tab (click)="setTab('quote')" label="Quote">
            <p *ngSwitchCase="'quote'">Quote Content</p>
          </md-tab>
        </md-tab-group>
      </md-card>
      </div>
    `
})
export class AppComponent {
  tabnav = {"top":"setup"};
  setTab(tab){
    this.tabnav.top = tab;
  }
}
