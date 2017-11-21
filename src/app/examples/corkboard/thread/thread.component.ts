import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from "../service.service";
import { PostComponent } from "../post/post.component";

@Component({
   selector: 'app-thread',
   providers: [CollectionService],
   templateUrl: './thread.component.html',
   styleUrls: ['./thread.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class ThreadComponent implements OnInit {
   posts:Array<Object>;
   newpost:Object;
   service:CollectionService;

   constructor(service:CollectionService) {
      this.service = service;
   }

   ngOnInit() {
      this.posts = [];
      this.newpost = {"attributes":{}};
      this.service.getCollection()
         .subscribe(posts => this.posts = posts);
   }

   onDelete(index) {
      this.posts.splice(index, 1);
   }

   onCreate() {
      this.newpost = {"attributes":{}};
      this.service.getCollection()
         .subscribe(posts => this.posts = posts);
   }
}
