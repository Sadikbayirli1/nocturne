-- Nocturne app schema

create table if not exists profiles (
  user_id text primary key,
  display_name text not null default 'Listener',
  avatar_url text,
  status text not null default 'available',
  music_muted boolean not null default false,
  locale text not null default 'tr',
  appearance text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists friendships (
  id text primary key,
  requester_id text not null,
  addressee_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id)
);
create index if not exists friendships_requester_idx on friendships (requester_id);
create index if not exists friendships_addressee_idx on friendships (addressee_id);

create table if not exists rooms (
  id text primary key,
  name text not null,
  owner_id text not null,
  password_hash text,
  theme text not null default 'violet',
  created_at timestamptz not null default now()
);
create index if not exists rooms_owner_idx on rooms (owner_id);

create table if not exists room_members (
  room_id text not null,
  user_id text not null,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index if not exists room_members_user_idx on room_members (user_id);

create table if not exists join_requests (
  id text primary key,
  room_id text not null,
  user_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);
create index if not exists join_requests_room_idx on join_requests (room_id, status);

create table if not exists queue_items (
  id text primary key,
  room_id text not null,
  track jsonb not null,
  sort_order integer not null,
  added_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists queue_items_room_idx on queue_items (room_id, sort_order);

create table if not exists room_playback (
  room_id text primary key,
  track jsonb,
  is_playing boolean not null default false,
  position_ms integer not null default 0,
  started_at bigint,
  volume integer not null default 80,
  controller_id text,
  controller_name text,
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  room_id text not null,
  user_id text not null,
  kind text not null default 'text',
  body text not null default '',
  media_url text,
  created_at timestamptz not null default now()
);
create index if not exists messages_room_idx on messages (room_id, created_at);

create table if not exists message_acks (
  message_id text not null,
  user_id text not null,
  stage text not null,
  at timestamptz not null default now(),
  primary key (message_id, user_id, stage)
);

create table if not exists library_tracks (
  id text primary key,
  user_id text not null,
  track jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists library_tracks_user_idx on library_tracks (user_id, created_at);

create table if not exists listen_history (
  id text primary key,
  room_id text not null,
  track jsonb not null,
  played_by text,
  played_at timestamptz not null default now()
);
create index if not exists listen_history_room_idx on listen_history (room_id, played_at);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null default '',
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at);
