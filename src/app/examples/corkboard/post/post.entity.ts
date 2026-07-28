import { Thread } from "../thread/thread.entity";

export class Post {
    _id?: string;
    title?: string;
    content?: string;
    poster?: string;
    likes?: string[];
    thread?: Thread;
    createdTS?: string;
    editedTS?: string;
}