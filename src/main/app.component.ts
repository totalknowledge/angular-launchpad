import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
      <div class="card g--12 nudge-right tabs tab-demo" [ngSwitch]="tabnav.top">

        <input type="radio" name="tabs" id="tab1" checked>
        <div class="tab-label-content" id="tab1-content">
          <label for="tab1" (click)="setTab('setup')">Pricing and Delivery</label>
          <div class="tab-content container g--12" id="setup-panel" *ngSwitchCase="'setup'">
            <my-package>Loading...</my-package>
          </div>
        </div>

        <input type="radio" name="tabs" id="tab2">
        <div class="tab-label-content" id="tab2-content">
          <label for="tab2" (click)="setTab('quote')">Quote</label>
          <div class="tab-content container g--12" id="quote-panel" *ngSwitchCase="'quote'">
            lkkkko
          </div>
        </div>

        <input type="radio" name="tabs" id="tab3">
        <div class="tab-label-content" id="tab3-content">
          <label for="tab3" (click)="setTab('admin')">Admin</label>
          <div class="tab-content container g--12" id="default-panel" *ngSwitchDefault>Error...</div>
        </div>

        <div class="slide slide-demo"></div>

      </div>
    `
})
export class AppComponent {
  tabnav = {"top":"setup"};
  setTab(tab){
    this.tabnav.top = tab;
  }
}
