import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CollectionService } from "../../../persistence/collection.service";
import { Post } from '../post/post';
import { PostComponent } from '../post/post.component';
import { Thread } from './thread.entity';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
   selector: 'app-thread',
   providers: [CollectionService],
   imports: [PostComponent, CommonModule, RouterLink, MatButtonModule, MatCardModule],
   templateUrl: './thread.component.html',
   styleUrls: ['./thread.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class ThreadComponent implements OnInit {
   threadId!: string;
   thread?: Thread;
   newpost!: Post;
   posts$!: Observable<Array<Post>>;
   private readonly collection = 'posts';

   constructor(
      private service: CollectionService,
      private route: ActivatedRoute
   ) { }

   ngOnInit() {
      this.initNewPost();
      this.route.paramMap.subscribe(params => {
         this.threadId = params.get('id') || '';
         this.initNewPost();
         this.fetchThread();
      });
      this.refreshPosts();
   }

   fetchThread() {
      if (!this.threadId) return;
      this.service.getRecord('threads', this.threadId).subscribe((thread: any) => {
         this.thread = thread;
         this.refreshPosts();
      });
   }

   onDelete() {
      this.refreshPosts();
   }

   onCreate() {
      this.initNewPost();
      this.refreshPosts();
   }

   onCancel() {
      this.initNewPost();
   }

   isOriginPost(post: Post): boolean {
      if (!this.thread?.originPost) return false;
      const originId = (this.thread.originPost as any).id || (this.thread.originPost as any)._id;
      return post.id === originId || (post as any)._id === originId;
   }

   private initNewPost() {
      this.newpost = {
         threadId: this.threadId,
         attributes: {
            threadId: this.threadId
         }
      } as Post;
   }

   private refreshPosts() {
      this.posts$ = this.service.getCollection(this.collection).pipe(
         map((allPosts: any[]) => {
            const filtered = allPosts.filter(post => {
               if (!this.threadId) return true;
               const isOrigin = this.isOriginPost(post);
               const matchesThreadId = post.threadId === this.threadId || 
                                       post.attributes?.['threadId'] === this.threadId ||
                                       post.attributes?.threadId === this.threadId;
               return isOrigin || matchesThreadId;
            });

            return filtered.sort((left, right) => {
               const timeL = left.attributes?.['createdTS'];
               const timeR = right.attributes?.['createdTS'];
               if (timeL && timeR) {
                  return new Date(timeR).getTime() - new Date(timeL).getTime();
               }
               const idL = parseInt(left.id || '0');
               const idR = parseInt(right.id || '0');
               return idL - idR;
            });
         })
      );
   }
}
