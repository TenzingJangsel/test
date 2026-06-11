/**
 * Domain types mirroring the Firestore schema written by lumini.html.
 *
 * Paths:
 *   artifacts/{APP_ID}/public/data/users_directory/{uid}  -> UserDirectoryEntry
 *   artifacts/{APP_ID}/users/{uid}/profile/main           -> UserProfile
 *   artifacts/{APP_ID}/public/data/posts/{pid}            -> Post
 *   artifacts/{APP_ID}/public/data/posts/{pid}/comments/{cid} -> Comment
 *   artifacts/{APP_ID}/public/data/stories/{sid}          -> Story
 *   artifacts/{APP_ID}/public/data/chats/{chatId}         -> Chat
 *   artifacts/{APP_ID}/public/data/chats/{chatId}/messages/{mid} -> Message
 *   artifacts/{APP_ID}/users/{uid}/notifications/{nid}    -> Notification
 */

import type { Timestamp } from "firebase/firestore";

export type FsTimestamp = Timestamp | null;

export interface UserDirectoryEntry {
  uid: string;
  name: string;
  photoURL?: string | null;
  headline?: string;
  followers?: string[];
  following?: string[];
  isOnline?: boolean;
  lastSeen?: FsTimestamp;
  isBanned?: boolean;
  isAdmin?: boolean;
  theme?: "light" | "dark";
}

export interface UserProfile {
  headline?: string;
  bio?: string;
  links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
  };
  savedPosts?: string[];
  savedCollections?: Record<string, string[]>;
}

export type PostType = "text" | "project" | "image" | "video";

export interface Post {
  id: string;
  text: string;
  type: PostType;
  uid: string;
  name: string;
  photoURL?: string | null;
  headline?: string;
  attachment?: string | null;
  attachmentType?: string | null;
  taggedUsers?: string[];
  tags?: string[];
  likes?: number;
  likedBy?: string[];
  commentCount?: number;
  createdAt?: FsTimestamp;
  lastEdited?: FsTimestamp;
}

export interface Comment {
  id: string;
  text: string;
  uid: string;
  name: string;
  photoURL?: string | null;
  createdAt?: FsTimestamp;
}

export interface Story {
  id: string;
  uid: string;
  name: string;
  photoURL?: string | null;
  media: string;
  type: "image" | "video";
  likes?: number;
  likedBy?: string[];
  visibility?: "public" | "followers" | "close-friends";
  targetAudience?: string[];
  createdAt?: FsTimestamp;
  expiresAt?: FsTimestamp;
}

export interface Chat {
  id: string;
  participants: string[];
  isGroup?: boolean;
  groupName?: string;
  groupPhoto?: string;
  lastMessage?: string;
  lastMessageAt?: FsTimestamp;
}

export interface Message {
  id: string;
  text?: string;
  type?: "text" | "image" | "video" | "system" | "voice";
  senderId: string;
  createdAt?: FsTimestamp;
  reactions?: Record<string, string[]>;
}

export interface Notification {
  id: string;
  type: string;
  fromUid?: string;
  fromName?: string;
  fromPhoto?: string;
  postId?: string;
  text?: string;
  read?: boolean;
  createdAt?: FsTimestamp;
}
