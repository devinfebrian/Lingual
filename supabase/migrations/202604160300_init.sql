create table if not exists learner_profiles (
  id uuid primary key,
  display_name text not null,
  email text not null unique,
  role text not null default 'learner' check (role in ('learner', 'admin')),
  beginner_confirmed boolean not null default true,
  daily_minutes integer not null default 10,
  goal text not null default '',
  motivation text not null default '',
  streak integer not null default 0,
  xp integer not null default 0,
  current_lesson_id text not null default '',
  completed_lesson_ids text[] not null default '{}',
  milestone_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists learning_paths (
  id text primary key,
  title text not null,
  subtitle text not null,
  description text not null
);

create table if not exists units (
  id text primary key,
  path_id text not null references learning_paths(id) on delete cascade,
  title text not null,
  description text not null,
  sort_order integer not null
);

create table if not exists lessons (
  id text primary key,
  unit_id text not null references units(id) on delete cascade,
  title text not null,
  summary text not null,
  sort_order integer not null,
  difficulty text not null check (difficulty in ('easy', 'medium')),
  jlpt_track text not null default 'future-n5',
  theme_tags text[] not null default '{}',
  published boolean not null default false
);

create table if not exists lesson_exercises (
  id text primary key,
  lesson_id text not null references lessons(id) on delete cascade,
  kind text not null check (kind in ('read', 'answer', 'write')),
  prompt text not null,
  question text not null,
  reference_answer text not null,
  explanation text not null,
  xp integer not null default 0
);

create table if not exists lesson_submissions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learner_profiles(id) on delete cascade,
  lesson_id text not null references lessons(id) on delete cascade,
  total_awarded_xp integer not null default 0,
  feedback jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists lesson_drafts (
  id uuid primary key default gen_random_uuid(),
  source_prompt text not null,
  review_state text not null default 'draft' check (review_state in ('draft', 'reviewed', 'published')),
  generated_lesson jsonb not null,
  published_lesson_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_units_path_id_sort_order on units(path_id, sort_order);
create index if not exists idx_lessons_unit_id_sort_order on lessons(unit_id, sort_order);
create index if not exists idx_lesson_exercises_lesson_id on lesson_exercises(lesson_id);
create index if not exists idx_learner_profiles_current_lesson_id on learner_profiles(current_lesson_id);
create index if not exists idx_lesson_submissions_learner_lesson on lesson_submissions(learner_id, lesson_id);

alter table learning_paths enable row level security;
alter table units enable row level security;
alter table lessons enable row level security;
alter table lesson_exercises enable row level security;
alter table learner_profiles enable row level security;
alter table lesson_submissions enable row level security;
alter table lesson_drafts enable row level security;

create policy "Published learning paths are readable"
on learning_paths
for select
using (true);

create policy "Units are readable"
on units
for select
using (true);

create policy "Published lessons are readable"
on lessons
for select
using (published = true);

create policy "Exercises for published lessons are readable"
on lesson_exercises
for select
using (
  exists (
    select 1
    from lessons
    where lessons.id = lesson_exercises.lesson_id
      and lessons.published = true
  )
);

create policy "Learners view their own profile"
on learner_profiles
for select
using (auth.uid() = id);

create policy "Learners insert their own profile"
on learner_profiles
for insert
with check (auth.uid() = id);

create policy "Learners update their own profile"
on learner_profiles
for update
using (auth.uid() = id);

create policy "Learners view their own submissions"
on lesson_submissions
for select
using (auth.uid() = learner_id);

create policy "Learners insert their own submissions"
on lesson_submissions
for insert
with check (auth.uid() = learner_id);

create policy "Admins manage lesson drafts"
on lesson_drafts
for all
using (
  exists (
    select 1
    from learner_profiles
    where learner_profiles.id = auth.uid()
      and learner_profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from learner_profiles
    where learner_profiles.id = auth.uid()
      and learner_profiles.role = 'admin'
  )
);
