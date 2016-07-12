import {Component} from '@angular/core';
@Component({
    selector: 'my-app',
    template: '<h1>My {{appnumber}} Angular 2 App</h1>'
})
export class AppComponent {
   appnumber = 'First'
}
