-- VitalRise — Supabase schema.
-- Run in the Supabase SQL editor. All access goes through the server with the
-- service-role key; RLS is enabled with no policies, so anon/browser keys can read nothing.

create extension if not exists pgcrypto;

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null,
  country text,
  locale text,
  email text,
  phone text,
  first_name text,
  marketing_consent boolean not null default false,
  sms_consent boolean not null default false,
  headline text,
  ab_variant text check (ab_variant in ('A', 'B')),
  utm jsonb,
  followup_step int not null default 1,
  purchased boolean not null default false,
  unsubscribed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quiz_responses_followup_idx
  on quiz_responses (followup_step, created_at)
  where purchased = false and unsubscribed = false;
create index if not exists quiz_responses_email_idx on quiz_responses (email);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_customer_id text,
  email text,
  plan text,
  bump boolean not null default false,
  amount_cents int,
  currency text,
  upsells jsonb not null default '[]'::jsonb,
  status text not null default 'paid',
  quiz_id uuid references quiz_responses(id) on delete set null,
  utm jsonb,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on orders (created_at desc);

-- Projects created before the utm columns existed.
alter table quiz_responses add column if not exists utm jsonb;
alter table orders add column if not exists utm jsonb;
create index if not exists quiz_responses_utm_content_idx on quiz_responses ((utm->>'utm_content'));
create index if not exists orders_utm_content_idx on orders ((utm->>'utm_content'));

create table if not exists vsl_cache (
  id uuid primary key default gen_random_uuid(),
  persona text not null check (persona in ('woman', 'man', 'senior')),
  locale text not null,
  heygen_video_id text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (persona, locale)
);

alter table quiz_responses enable row level security;
alter table orders enable row level security;
alter table vsl_cache enable row level security;

-- Public bucket for the finished VSL videos (HeyGen links expire, so we re-host them).
insert into storage.buckets (id, name, public)
values ('vsl', 'vsl', true)
on conflict (id) do nothing;
