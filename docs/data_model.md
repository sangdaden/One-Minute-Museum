# Data Model — Bảo Tàng 1 Phút

## 1. MVP Local Storage

MVP có thể bắt đầu bằng localStorage.

Key: `one_minute_museum_exhibitions`

Value:
```json
[
  {
    "id": "uuid",
    "object_name": "dép tổ ong",
    "mode": "Vietnamese Culture",
    "language": "vi",
    "title": "...",
    "hook": "...",
    "what_it_is": "...",
    "origin_or_context": "...",
    "three_fun_facts": ["...", "...", "..."],
    "design_or_cultural_insight": "...",
    "why_it_matters": "...",
    "reflection_question": "...",
    "share_quote": "...",
    "hashtags": ["BaoTang1Phut"],
    "created_at": "2026-06-06T10:00:00Z"
  }
]
```

## 2. SQL Schema

Nếu dùng Supabase/Postgres:

```sql
create table exhibitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  object_name text not null,
  mode text not null,
  language text not null default 'vi',
  title text not null,
  hook text not null,
  what_it_is text not null,
  origin_or_context text not null,
  three_fun_facts jsonb not null,
  design_or_cultural_insight text not null,
  why_it_matters text not null,
  reflection_question text not null,
  share_quote text not null,
  hashtags jsonb not null default '[]',
  created_at timestamptz not null default now()
);
```

## 3. Suggested Objects

```sql
create table suggested_objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  collection_name text not null,
  description text null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
```

Seed data:

```sql
insert into suggested_objects (name, collection_name, sort_order) values
('Dép tổ ong', 'Vietnam Everyday Collection', 1),
('Ghế nhựa đỏ', 'Vietnam Everyday Collection', 2),
('Ly cà phê sữa đá', 'Vietnam Everyday Collection', 3),
('Remote TV bọc nilon', 'Vietnam Everyday Collection', 4),
('Áo mưa', 'Vietnam Everyday Collection', 5),
('Xe máy', 'Vietnam Everyday Collection', 6),
('Mũ bảo hiểm', 'Vietnam Everyday Collection', 7),
('Phích nước', 'Vietnam Everyday Collection', 8),
('Nồi cơm điện', 'Vietnam Everyday Collection', 9),
('Quạt máy', 'Vietnam Everyday Collection', 10),
('Túi nilon đi chợ', 'Vietnam Everyday Collection', 11),
('Bút bi Thiên Long', 'Vietnam Everyday Collection', 12);
```

## 4. Future Tables

### users
Nếu cần auth.

```sql
create table users (
  id uuid primary key,
  email text unique,
  display_name text,
  created_at timestamptz not null default now()
);
```

### collections

```sql
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  name text not null,
  description text null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
```

### collection_items

```sql
create table collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references collections(id),
  exhibition_id uuid references exhibitions(id),
  created_at timestamptz not null default now()
);
```
