import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class MainPageComponent {
  title = 'Angular Launchpad';
  constructor() {

  }
}
