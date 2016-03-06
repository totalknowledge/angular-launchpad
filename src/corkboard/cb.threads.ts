
import {Component, OnInit} from 'angular2/core';
import {CollectionService} from "./cb.services";
import {Post} from "./cb.posts";

@Component({
   selector: 'cb-thread',
   bindings: [CollectionService],
   directives: [Post],
   templateUrl: '/app/corkboard/partials/thread.html'
})
export class Thread implements OnInit {
   posts:Array<Object>;
   newpost:Object;
   service:CollectionService;

   constructor(service:CollectionService) {
      this.service = service;
   }

   ngOnInit() {
      this.posts = [];
      this.newpost = {"attributes":{}};
      this.service.getCollection("posts")
         .subscribe(posts => this.posts = posts);
   }

   onDelete(index) {
      this.posts.splice(index, 1);
   }

   onCreate() {
      this.newpost = {"attributes":{}};
      this.service.getCollection("posts")
         .subscribe(posts => this.posts = posts);
   }
}
