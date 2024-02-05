import { Component, ViewEncapsulation } from '@angular/core';
import { CollectionService } from "../../persistence/collection.service";

@Component({
   selector: 'app-corkboard',
   providers: [CollectionService],
   templateUrl: './corkboard.component.html',
   styleUrls: ['./corkboard.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class CorkboardComponent {

   constructor() { }
}
