import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from "../../../persistence/collection.service";
import { Post } from '../post/post';

@Component({
   selector: 'app-thread',
   providers: [CollectionService],
   templateUrl: './thread.component.html',
   styleUrls: ['./thread.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class ThreadComponent implements OnInit {
   posts: Array<Post>;
   newpost: Post;

   constructor(private service: CollectionService) {
      service.setCollection('posts');
   }

   ngOnInit() {
      this.posts = [];
      this.newpost = { "attributes": {} } as Post;
      this.service.getCollection()
         .subscribe(posts => this.posts = posts);
   }

   onDelete(index: number) {
      this.posts.splice(index, 1);
   }

   onCreate() {
      this.newpost = { "attributes": {} } as Post;
      this.service.getCollection()
         .subscribe(posts => this.posts = posts);
   }
}
