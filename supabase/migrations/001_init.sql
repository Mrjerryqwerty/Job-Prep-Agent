create extension if not exists pgcrypto;

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  resume_text text not null,
  profile jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  key text primary key,
  value text not null
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  day int not null,
  slot int not null,
  title text not null,
  type text not null,
  prompt text not null,
  created_at timestamptz not null default now(),
  unique (day, slot)
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  answer text not null,
  score int,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  round int not null,
  total int not null,
  status text not null default 'active',
  summary jsonb,
  overall_score numeric,
  created_at timestamptz not null default now()
);

create table if not exists interview_turns (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references interviews(id) on delete cascade,
  idx int not null,
  question text not null,
  answer text,
  score int,
  feedback jsonb,
  unique (interview_id, idx)
);

-- Server uses the service role key. Lock everything else out.
alter table resumes enable row level security;
alter table settings enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table interviews enable row level security;
alter table interview_turns enable row level security;
