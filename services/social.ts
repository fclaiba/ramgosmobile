export type UserProfile = {
  id: string;
  name: string;
  avatarUrl?: string;
  handle?: string; // @handle opcional
};

export type Comment = {
  id: string;
  postId: string;
  author: UserProfile;
  text: string;
  createdAt: string;
};

export type Post = {
  id: string;
  author: UserProfile;
  text?: string;
  imageUrl?: string;
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
  createdAt: string;
};

let CURRENT_USER: UserProfile = { id: 'u_me', name: 'Tú', handle: 'tu' };

const USERS: UserProfile[] = [
  CURRENT_USER,
  { id: 'support', name: 'Soporte Urgente', handle: 'soporte' },
  { id: 'u1', name: 'Sofía', handle: 'sofia', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: 'u2', name: 'Max', handle: 'max', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: 'u3', name: 'Luna', handle: 'luna', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
];

let FOLLOWING: Set<string> = new Set(['u1']);

let POSTS: Post[] = [
  {
    id: 'p1',
    author: USERS[1],
    text: '¡Nueva promo en mi tienda de gadgets! 20% off con código MAX15',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1200&auto=format&fit=crop',
    likes: 12,
    likedByMe: false,
    comments: [],
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: 'p2',
    author: USERS[2],
    text: 'Busco recomendaciones de bares con música en vivo 🎵',
    likes: 3,
    likedByMe: false,
    comments: [],
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
];

export function getCurrentUser(): UserProfile { return CURRENT_USER; }
export function listSuggestedFollows(): UserProfile[] {
  return USERS.filter((u) => u.id !== CURRENT_USER.id && !FOLLOWING.has(u.id));
}
export function listFollowing(): UserProfile[] {
  return USERS.filter((u) => FOLLOWING.has(u.id));
}
export function follow(userId: string) { FOLLOWING.add(userId); notify(userId, { kind: 'follow', actor: CURRENT_USER }); }
export function unfollow(userId: string) { FOLLOWING.delete(userId); }

export function listFeed(): Post[] {
  return POSTS
    .filter((p) => FOLLOWING.has(p.author.id) || p.author.id === CURRENT_USER.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUserById(userId: string): UserProfile | undefined {
  return USERS.find((u) => u.id === userId);
}

export function listUserPosts(userId: string): Post[] {
  return POSTS.filter((p) => p.author.id === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPost(input: { text?: string; imageUrl?: string }): Post {
  const trimmed = (input.text || '').trim();
  const limited = trimmed.length > 280 ? trimmed.slice(0, 280) : trimmed;
  const post: Post = {
    id: 'p_' + Math.random().toString(36).slice(2, 9),
    author: CURRENT_USER,
    text: limited || undefined,
    imageUrl: input.imageUrl,
    likes: 0,
    likedByMe: false,
    comments: [],
    createdAt: new Date().toISOString(),
  };
  POSTS = [post, ...POSTS];
  indexHashtagsForPost(post);
  notifyMentions(post);
  return post;
}

export function toggleLike(postId: string): Post | undefined {
  const p = POSTS.find((x) => x.id === postId);
  if (!p) return undefined;
  p.likedByMe = !p.likedByMe;
  p.likes += p.likedByMe ? 1 : -1;
  if (p.likedByMe && p.author.id !== CURRENT_USER.id) notify(p.author.id, { kind: 'like', actor: CURRENT_USER, postId: p.id });
  return p;
}

export function addComment(postId: string, text: string): Comment | undefined {
  const p = POSTS.find((x) => x.id === postId);
  if (!p) return undefined;
  const c: Comment = {
    id: 'c_' + Math.random().toString(36).slice(2, 9),
    postId,
    author: CURRENT_USER,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  p.comments.push(c);
  if (p.author.id !== CURRENT_USER.id) notify(p.author.id, { kind: 'comment', actor: CURRENT_USER, postId: p.id, commentId: c.id });
  return c;
}

export type Message = {
  id: string;
  from: UserProfile;
  to: UserProfile;
  text: string;
  createdAt: string;
};

function convIdFor(a: string, b: string): string {
  return [a, b].sort().join('_');
}

const CONVERSATIONS: Record<string, Message[]> = {};

export function listMessagesWith(userId: string): Message[] {
  const cid = convIdFor(CURRENT_USER.id, userId);
  return (CONVERSATIONS[cid] || []).slice().sort((x, y) => x.createdAt.localeCompare(y.createdAt));
}

export function sendMessage(toUserId: string, text: string): Message {
  const to = getUserById(toUserId);
  if (!to) throw new Error('User not found');
  const msg: Message = {
    id: 'm_' + Math.random().toString(36).slice(2, 9),
    from: CURRENT_USER,
    to,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  const cid = convIdFor(CURRENT_USER.id, toUserId);
  if (!CONVERSATIONS[cid]) CONVERSATIONS[cid] = [];
  CONVERSATIONS[cid].push(msg);
  notify(toUserId, { kind: 'message', actor: CURRENT_USER });
  return msg;
}

export function listConversations(): Array<{ user: UserProfile; lastMessage?: Message }> {
  const byUserId: Record<string, Message | undefined> = {};
  Object.entries(CONVERSATIONS).forEach(([, msgs]) => {
    const last = msgs[msgs.length - 1];
    if (!last) return;
    const other = last.from.id === CURRENT_USER.id ? last.to : last.from;
    const prev = byUserId[other.id];
    if (!prev || prev.createdAt < last.createdAt) byUserId[other.id] = last;
  });
  return Object.entries(byUserId)
    .map(([uid, last]) => ({ user: getUserById(uid)!, lastMessage: last }))
    .filter((x) => !!x.user)
    .sort((a, b) => (b.lastMessage?.createdAt || '').localeCompare(a.lastMessage?.createdAt || ''));
}

// Notifications
export type NotificationKind = 'like' | 'comment' | 'follow' | 'message';
export type NotificationItem = {
  id: string;
  userId: string; // recipient
  kind: NotificationKind;
  actor: UserProfile;
  postId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
};

const NOTIFS: NotificationItem[] = [];

function notify(userId: string, payload: { kind: NotificationKind; actor: UserProfile; postId?: string; commentId?: string }) {
  const n: NotificationItem = {
    id: 'n_' + Math.random().toString(36).slice(2, 9),
    userId,
    kind: payload.kind,
    actor: payload.actor,
    postId: payload.postId,
    commentId: payload.commentId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  NOTIFS.unshift(n);
}

export function listNotifications(): NotificationItem[] {
  return NOTIFS.filter((n) => n.userId === CURRENT_USER.id).slice();
}

export function markNotificationRead(notificationId: string) {
  const n = NOTIFS.find((x) => x.id === notificationId && x.userId === CURRENT_USER.id);
  if (n) n.read = true;
}

// Hashtags and search
const TAG_INDEX: Record<string, Set<string>> = {};

function extractHashtags(text?: string): string[] {
  if (!text) return [];
  const tags = text.match(/#[\p{L}0-9_]+/gu) || [];
  return tags.map((t) => t.slice(1).toLowerCase());
}

function indexHashtagsForPost(post: Post) {
  const tags = extractHashtags(post.text);
  tags.forEach((tag) => {
    if (!TAG_INDEX[tag]) TAG_INDEX[tag] = new Set();
    TAG_INDEX[tag].add(post.id);
  });
}

export function getPostsByHashtag(tag: string): Post[] {
  const key = tag.toLowerCase();
  const ids = Array.from(TAG_INDEX[key] || []);
  return POSTS.filter((p) => ids.includes(p.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function searchUsers(query: string): UserProfile[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return USERS.filter((u) => u.name.toLowerCase().includes(q) || (u.handle || '').toLowerCase().includes(q));
}

export function searchHashtags(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.keys(TAG_INDEX).filter((t) => t.includes(q)).slice(0, 20);
}

// Mentions and stories
function extractMentions(text?: string): string[] {
  if (!text) return [];
  const ms = text.match(/@[\p{L}0-9_]+/gu) || [];
  return ms.map((m) => m.slice(1).toLowerCase());
}

function notifyMentions(post: Post) {
  const mentions = extractMentions(post.text);
  if (mentions.length === 0) return;
  const byHandle: Record<string, UserProfile> = {};
  USERS.forEach((u) => { if (u.handle) byHandle[u.handle.toLowerCase()] = u; });
  mentions.forEach((h) => {
    const user = byHandle[h];
    if (user && user.id !== CURRENT_USER.id) notify(user.id, { kind: 'comment', actor: CURRENT_USER, postId: post.id });
  });
}

export type Story = {
  id: string;
  author: UserProfile;
  imageUrl?: string;
  text?: string;
  createdAt: string;
  expiresAt: string;
  viewedByMe?: boolean;
};

let STORIES: Story[] = [
  { id: 's1', author: USERS[1], imageUrl: 'https://images.unsplash.com/photo-1554597499-5769f2828070?q=80&w=1200&auto=format&fit=crop', createdAt: new Date(Date.now() - 2*3600_000).toISOString(), expiresAt: new Date(Date.now() + 22*3600_000).toISOString(), viewedByMe: false },
  { id: 's2', author: USERS[2], text: 'Probando menú nuevo hoy! #gastronomia', createdAt: new Date(Date.now() - 1*3600_000).toISOString(), expiresAt: new Date(Date.now() + 23*3600_000).toISOString(), viewedByMe: false },
];

export function listStories(): Story[] {
  const now = Date.now();
  return STORIES.filter((s) => new Date(s.expiresAt).getTime() > now && (FOLLOWING.has(s.author.id) || s.author.id === CURRENT_USER.id));
}

export function listStoriesByUser(userId: string): Story[] {
  const now = Date.now();
  return STORIES.filter((s) => s.author.id === userId && new Date(s.expiresAt).getTime() > now);
}

export function markStoryViewed(storyId: string) {
  const s = STORIES.find((x) => x.id === storyId);
  if (s) s.viewedByMe = true;
}


