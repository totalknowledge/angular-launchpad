import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { forkJoin } from 'rxjs';

import { CollectionService } from '../../../persistence/collection.service';
import { Forum } from './forum.entity';
import { Thread } from '../thread/thread.entity';
import { Post } from '../post/post';
import { PostComponent } from '../post/post.component';

@Component({
  selector: 'app-forum',
  providers: [CollectionService],
  imports: [
    DatePipe,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    PostComponent,
    RouterLink,
  ],
  templateUrl: './forum.html',
  styleUrl: './forum.scss',
})
export class ForumComponent implements OnInit {
  forums: Forum[] = [];
  threadsByForum: Record<string, Thread[]> = {};
  creatingForum = false;
  creatingThreadFor = '';
  newForum: Forum = this.createForumDraft();
  originPostDrafts: Record<string, Post> = {};

  private readonly forumCollection = 'forums';
  private readonly threadCollection = 'threads';

  constructor(private service: CollectionService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.refresh();
  }

  forumKey(forum: Forum) {
    return forum.id ?? forum._id ?? '';
  }

  threadsForForum(forum: Forum) {
    return this.threadsByForum[this.forumKey(forum)] ?? [];
  }

  showNewForumForm() {
    this.newForum = this.createForumDraft();
    this.creatingForum = true;
  }

  cancelNewForum() {
    this.creatingForum = false;
    this.newForum = this.createForumDraft();
  }

  createForum() {
    const now = new Date().toISOString();
    const forum = {
      ...this.newForum,
      createdTS: now,
      editedTS: now,
    };

    this.service.createRecord(this.forumCollection, forum).subscribe(() => {
      this.cancelNewForum();
      this.refresh();
    });
  }

  showNewThreadForm(forum: Forum) {
    const forumId = this.forumKey(forum);
    this.creatingThreadFor = forumId;
    this.originPostDrafts[forumId] = this.createOriginPostDraft();
  }

  cancelNewThread(forum: Forum) {
    const forumId = this.forumKey(forum);
    delete this.originPostDrafts[forumId];
    if (this.creatingThreadFor === forumId) {
      this.creatingThreadFor = '';
    }
  }

  createThread(forum: Forum, originPost: Post) {
    const forumId = this.forumKey(forum);
    const now = new Date().toISOString();
    const thread = {
      title: originPost.attributes?.name,
      forumId,
      forum,
      originPost,
      createdTS: now,
      updatedTS: now,
    };

    this.service.createRecord(this.threadCollection, thread).subscribe(() => {
      this.cancelNewThread(forum);
      this.refresh();
    });
  }

  private refresh() {
    forkJoin({
      forums: this.service.getCollection(this.forumCollection),
      threads: this.service.getCollection(this.threadCollection),
    }).subscribe(({ forums, threads }) => {
      this.forums = this.sortForums(forums as Forum[]);
      this.threadsByForum = this.groupThreads(threads as Thread[]);
      this.changeDetector.detectChanges();
    });
  }

  private groupThreads(threads: Thread[]) {
    return this.sortThreads(threads).reduce<Record<string, Thread[]>>((groups, thread) => {
      const forumId = thread.forumId ?? this.forumKey(thread.forum ?? {});
      if (!forumId) {
        return groups;
      }
      groups[forumId] = groups[forumId] ?? [];
      groups[forumId].push(thread);
      return groups;
    }, {});
  }

  private sortForums(forums: Forum[]) {
    return [...forums].sort((left, right) => this.compareNewestFirst(left, right));
  }

  private sortThreads(threads: Thread[]) {
    return [...threads].sort((left, right) => this.compareNewestFirst(left, right));
  }

  private compareNewestFirst(left: Forum | Thread, right: Forum | Thread) {
    return this.timestamp(right) - this.timestamp(left);
  }

  private timestamp(record: Forum | Thread) {
    const thread = record as Thread;
    const forum = record as Forum;
    const value = thread.updatedTS ?? forum.editedTS ?? record.createdTS;

    if (value) {
      return new Date(value).getTime();
    }

    return Number(record.id ?? record._id ?? 0);
  }

  private createForumDraft() {
    return {} as Forum;
  }

  private createOriginPostDraft() {
    return { attributes: {} } as Post;
  }
}
