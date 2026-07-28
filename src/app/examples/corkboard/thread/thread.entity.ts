import { Forum } from "../forum/forum.entity";
import { Post } from "../post/post.entity";

export class Thread {
    id?: string;
    _id?: string;
    title?: string;
    board?: string;
    forumId?: string;
    creator?: string;
    views?: number;
    locked?: boolean;
    pinned?: boolean;
    originPost?: Post;
    lastPost?: Post;
    forum?: Forum;
    createdTS?: string;
    updatedTS?: string;
}
