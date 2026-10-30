-- People who use the app. Identity key is email (shared-passcode app, not strong auth).
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create unique index if not exists candidates_email_key on candidates (lower(email));

alter table resumes
  add column candidate_id uuid not null references candidates(id) on delete cascade,
  add column file_path text,
  add column file_name text;

alter table assignments
  add column candidate_id uuid not null references candidates(id) on delete cascade;
alter table assignments drop constraint if exists assignments_day_slot_key;
alter table assignments add constraint assignments_candidate_day_slot_key unique (candidate_id, day, slot);

alter table interviews
  add column candidate_id uuid not null references candidates(id) on delete cascade;

alter table interview_turns
  add column audio_path text,
  add column audio_bytes int;

-- AI-written assessments, kept so the admin can re-read them without regenerating.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now()
);

alter table candidates enable row level security;
alter table reports enable row level security;

-- Private buckets: original resume files and recorded interview answers.
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false), ('answers', 'answers', false)
on conflict (id) do nothing;
