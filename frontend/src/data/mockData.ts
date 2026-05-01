export type MessageStatus = 'sent' | 'delivered' | 'read';

export type MessageType = 'text' | 'image' | 'voice' | 'file' | 'video';

export interface User {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  bio?: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  type: MessageType;
  replyTo?: string;
  replyToChatId?: string; // For navigating to original message in different chat
  replyToData?: { senderId: string; senderName: string; content: string; }; // Snapshot of quoted message for display
  reactions?: {emoji: string;userIds: string[];}[];
  edited?: boolean;
  mentions?: string[];
  imageUrl?: string;
  videoUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar: string;
  participants: string[];
  messages: Message[];
  unreadCount: number;
  muted: boolean;
  pinnedMessageId?: string;
  isTyping?: boolean;
  typingUser?: string;
  groupAdmins?: string[];
}

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
  status: 'online'
};

export const users: Record<string, User> = {
  'user-1': currentUser,
  'user-2': {
    id: 'user-2',
    name: 'Sarah Chen',
    username: 'sarahchen',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'online',
    bio: 'Product Designer @ Acme Inc'
  },
  'user-3': {
    id: 'user-3',
    name: 'Marcus Johnson',
    username: 'marcusj',
    phone: '+1 555-0101',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    status: 'offline',
    lastSeen: '2 hours ago',
    bio: 'Frontend Developer'
  },
  'user-4': {
    id: 'user-4',
    name: 'Emma Wilson',
    username: 'emmaw',
    email: 'emma@example.com',
    phone: '+1 555-0102',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    status: 'online',
    bio: 'UX Researcher'
  },
  'user-5': {
    id: 'user-5',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    status: 'offline',
    lastSeen: 'yesterday',
    bio: 'Design Lead'
  },
  'user-6': {
    id: 'user-6',
    name: 'Priya Patel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    status: 'online',
    bio: 'Visual Designer'
  },
  'user-7': {
    id: 'user-7',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'offline',
    lastSeen: '5 min ago',
    bio: 'Engineering Manager'
  },
  'user-8': {
    id: 'user-8',
    name: 'Lisa Anderson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    status: 'online',
    bio: 'Marketing Director'
  }
};

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const chats: Chat[] = [
{
  id: 'chat-1',
  type: 'direct',
  name: 'Sarah Chen',
  avatar: users['user-2'].avatar,
  participants: ['user-1', 'user-2'],
  unreadCount: 3,
  muted: false,
  isTyping: true,
  typingUser: 'Sarah Chen',
  messages: [
  {
    id: 'msg-1',
    senderId: 'user-2',
    content: 'Hey! Did you see the new design mockups?',
    timestamp: new Date(now.getTime() - 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-2',
    senderId: 'user-1',
    content: 'Yes! They look amazing. Love the color palette.',
    timestamp: new Date(now.getTime() - 55 * 60 * 1000),
    type: 'text',
    status: 'read'
  },
  {
    id: 'msg-3',
    senderId: 'user-2',
    content: 'Thanks! I was thinking we could iterate on the navigation',
    timestamp: new Date(now.getTime() - 50 * 60 * 1000),
    type: 'text',
    replyTo: 'msg-2'
  },
  {
    id: 'msg-4',
    senderId: 'user-2',
    content: 'Check out this design inspiration',
    timestamp: new Date(now.getTime() - 45 * 60 * 1000),
    type: 'image',
    imageUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop'
  },
  {
    id: 'msg-5',
    senderId: 'user-1',
    content: 'This is perfect! Let me share this with the team.',
    timestamp: new Date(now.getTime() - 40 * 60 * 1000),
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '👍', userIds: ['user-2'] }]
  },
  {
    id: 'msg-6',
    senderId: 'user-2',
    content: 'Actually, I just realized we need to update the spacing',
    timestamp: new Date(now.getTime() - 35 * 60 * 1000),
    type: 'text',
    edited: true
  },
  {
    id: 'msg-voice-1',
    senderId: 'user-2',
    content: 'Voice message about the design changes',
    timestamp: new Date(now.getTime() - 25 * 60 * 1000),
    type: 'voice',
    voiceDuration: 12,
    voiceUrl:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'msg-video-1',
    senderId: 'user-2',
    content: 'Here is the prototype walkthrough',
    timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    type: 'video',
    videoUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'msg-8',
    senderId: 'user-1',
    content: "Got it, I'll review and get back to you soon!",
    timestamp: new Date(now.getTime() - 5 * 60 * 1000),
    type: 'text',
    status: 'delivered'
  }]

},
{
  id: 'chat-2',
  type: 'group',
  name: 'Design Team',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=DesignTeam',
  participants: ['user-1', 'user-2', 'user-4', 'user-5', 'user-6'],
  unreadCount: 0,
  muted: false,
  pinnedMessageId: 'msg-12',
  groupAdmins: ['user-5'],
  messages: [
  {
    id: 'msg-9',
    senderId: 'user-5',
    content: 'Team meeting at 3 PM today. Please review the agenda.',
    timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-10',
    senderId: 'user-4',
    content: "I'll be there!",
    timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000),
    type: 'text',
    reactions: [{ emoji: '👍', userIds: ['user-5', 'user-2'] }]
  },
  {
    id: 'msg-11',
    senderId: 'user-2',
    content: 'Can we discuss the new component library?',
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    type: 'text',
    replyTo: 'msg-9'
  },
  {
    id: 'msg-12',
    senderId: 'user-5',
    content:
    '📌 Design System Guidelines v2.0 - Please review before Friday',
    timestamp: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-13',
    senderId: 'user-6',
    content: 'New moodboard for the rebrand',
    timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    type: 'image',
    imageUrl:
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop'
  },
  {
    id: 'msg-14',
    senderId: 'user-1',
    content: 'Love the new color scheme! 🎨',
    timestamp: new Date(now.getTime() - 50 * 60 * 1000),
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '❤️', userIds: ['user-6', 'user-2'] }]
  },
  {
    id: 'msg-pdf-1',
    senderId: 'user-4',
    content: 'design-system-v2.pdf',
    timestamp: new Date(now.getTime() - 30 * 60 * 1000),
    type: 'file',
    fileName: 'design-system-v2.pdf',
    fileSize: '2.4 MB',
    fileUrl:
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: 'msg-voice-2',
    senderId: 'user-5',
    content: 'Quick update on the timeline',
    timestamp: new Date(now.getTime() - 20 * 60 * 1000),
    type: 'voice',
    voiceDuration: 28,
    voiceUrl:
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'msg-video-2',
    senderId: 'user-6',
    content: 'Animation prototype demo',
    timestamp: new Date(now.getTime() - 10 * 60 * 1000),
    type: 'video',
    videoUrl:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }]

},
{
  id: 'chat-3',
  type: 'direct',
  name: 'Marcus Johnson',
  avatar: users['user-3'].avatar,
  participants: ['user-1', 'user-3'],
  unreadCount: 0,
  muted: false,
  messages: [
  {
    id: 'msg-16',
    senderId: 'user-3',
    content: 'Hey, can you review my PR when you get a chance?',
    timestamp: yesterday,
    type: 'text'
  },
  {
    id: 'msg-17',
    senderId: 'user-1',
    content: "Sure thing! I'll take a look this afternoon.",
    timestamp: new Date(yesterday.getTime() + 30 * 60 * 1000),
    type: 'text',
    status: 'read'
  },
  {
    id: 'msg-file-2',
    senderId: 'user-3',
    content: 'project-specs.pdf',
    timestamp: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000),
    type: 'file',
    fileName: 'project-specs.pdf',
    fileSize: '1.8 MB',
    fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
  },
  {
    id: 'msg-18',
    senderId: 'user-1',
    content: 'Just finished the review. Left some comments.',
    timestamp: new Date(yesterday.getTime() + 4 * 60 * 60 * 1000),
    type: 'text',
    status: 'read'
  }]

},
{
  id: 'chat-4',
  type: 'direct',
  name: 'David Kim',
  avatar: users['user-7'].avatar,
  participants: ['user-1', 'user-7'],
  unreadCount: 1,
  muted: true,
  messages: [
  {
    id: 'msg-19',
    senderId: 'user-7',
    content: 'Quick question about the sprint planning',
    timestamp: new Date(now.getTime() - 20 * 60 * 1000),
    type: 'text'
  }]

},
{
  id: 'chat-5',
  type: 'direct',
  name: 'Emma Wilson',
  avatar: users['user-4'].avatar,
  participants: ['user-1', 'user-4'],
  unreadCount: 0,
  muted: false,
  messages: [
  {
    id: 'msg-20',
    senderId: 'user-4',
    content: 'The user research findings are ready!',
    timestamp: twoDaysAgo,
    type: 'text'
  },
  {
    id: 'msg-21',
    senderId: 'user-1',
    content: "Excellent! Let's schedule a review session.",
    timestamp: new Date(twoDaysAgo.getTime() + 1 * 60 * 60 * 1000),
    type: 'text',
    status: 'read'
  }]

},
{
  id: 'chat-6',
  type: 'direct',
  name: 'Lisa Anderson',
  avatar: users['user-8'].avatar,
  participants: ['user-1', 'user-8'],
  unreadCount: 0,
  muted: false,
  messages: [
  {
    id: 'msg-22',
    senderId: 'user-8',
    content: 'Campaign launch is scheduled for next week',
    timestamp: new Date(twoDaysAgo.getTime() - 1 * 60 * 60 * 1000),
    type: 'text'
  },
  {
    id: 'msg-23',
    senderId: 'user-1',
    content: 'Great! Keep me posted on the progress.',
    timestamp: new Date(twoDaysAgo.getTime() - 30 * 60 * 1000),
    type: 'text',
    status: 'read'
  }]

}];


export const sharedMedia = [
'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=400&fit=crop',
'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop',
'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop'];

// Call types and mock data (from Sidebar.tsx)
export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  timestamp: Date;
  duration?: string;
}

export const mockCalls: Call[] = [
  {
    id: 'call-1',
    contactId: 'user-2',
    contactName: 'Sarah Chen',
    contactAvatar: users['user-2'].avatar,
    type: 'incoming',
    callType: 'video',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '15:30'
  },
  {
    id: 'call-2',
    contactId: 'user-3',
    contactName: 'Marcus Johnson',
    contactAvatar: users['user-3'].avatar,
    type: 'outgoing',
    callType: 'audio',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    duration: '8:45'
  },
  {
    id: 'call-3',
    contactId: 'user-4',
    contactName: 'Emma Wilson',
    contactAvatar: users['user-4'].avatar,
    type: 'missed',
    callType: 'video',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 'call-4',
    contactId: 'user-7',
    contactName: 'David Kim',
    contactAvatar: users['user-7'].avatar,
    type: 'incoming',
    callType: 'audio',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: '4:20'
  }
];

// CallLog types and mock data (from MobileCallsView.tsx)
export interface CallLog {
  id: string;
  contactId: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: Date;
  duration?: string;
}

export const mockCallLogs: CallLog[] = [
  {
    id: 'call-1',
    contactId: 'user-2',
    type: 'video',
    direction: 'incoming',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    duration: '12:34'
  },
  {
    id: 'call-2',
    contactId: 'user-3',
    type: 'voice',
    direction: 'missed',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    id: 'call-3',
    contactId: 'user-4',
    type: 'voice',
    direction: 'outgoing',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: '5:21'
  },
  {
    id: 'call-4',
    contactId: 'user-7',
    type: 'video',
    direction: 'outgoing',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: '45:02'
  },
  {
    id: 'call-5',
    contactId: 'user-5',
    type: 'voice',
    direction: 'incoming',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: '2:15'
  },
  {
    id: 'call-6',
    contactId: 'user-8',
    type: 'voice',
    direction: 'missed',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'call-7',
    contactId: 'user-6',
    type: 'video',
    direction: 'incoming',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    duration: '18:47'
  }
];

// UserSettings type (from MobileSettingsView.tsx)
export interface UserSettings {
  notifications: {
    sound: boolean;
    vibration: boolean;
    messagePreview: boolean;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    readReceipts: boolean;
  };
  twoFactorEnabled: boolean;
  language: string;
  wallpaper: string;
}

export const defaultUserSettings: UserSettings = {
  notifications: {
    sound: true,
    vibration: true,
    messagePreview: true
  },
  privacy: {
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    readReceipts: true
  },
  twoFactorEnabled: false,
  language: 'English',
  wallpaper: 'default'
};