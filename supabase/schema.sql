-- ============================================
-- SmartPlan Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  currency text default 'INR',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- 2. DESTINATIONS (curated places)
-- ============================================
create table public.destinations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  country text not null,
  region text not null check (region in ('domestic', 'international')),
  description text,
  image_url text,
  budget_min integer not null,
  budget_max integer not null,
  currency text default 'INR',
  avg_daily_cost integer not null,
  best_months integer[] default '{}',
  vibes text[] default '{}',
  activities text[] default '{}',
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now() not null
);

-- ============================================
-- 3. TRIPS (user's travel plans)
-- ============================================
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete set null,
  title text not null,
  budget integer not null,
  duration_days integer not null default 3,
  start_date date,
  vibe text check (vibe in ('adventure', 'relaxation', 'cultural', 'romantic', 'party', 'nature', 'spiritual', 'foodie', 'urban', 'offbeat')),
  travelers integer default 1,
  status text default 'planning' check (status in ('planning', 'confirmed', 'completed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ============================================
-- 4. ITINERARY DAYS
-- ============================================
create table public.itinerary_days (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  day_number integer not null,
  title text,
  created_at timestamptz default now() not null
);

-- ============================================
-- 5. ITINERARY ACTIVITIES
-- ============================================
create table public.itinerary_activities (
  id uuid default uuid_generate_v4() primary key,
  day_id uuid references public.itinerary_days(id) on delete cascade not null,
  sort_order integer default 0,
  time text,
  title text not null,
  description text,
  cost_estimate integer default 0,
  location text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now() not null
);

-- ============================================
-- 6. GROUPS (for group trip planning)
-- ============================================
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_by uuid references public.profiles(id) on delete cascade not null,
  trip_id uuid references public.trips(id) on delete set null,
  created_at timestamptz default now() not null
);

-- ============================================
-- 7. GROUP MEMBERS
-- ============================================
create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now() not null,
  unique (group_id, user_id)
);

-- ============================================
-- 8. VOTES (anonymous destination voting)
-- ============================================
create table public.votes (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  rank integer not null,
  created_at timestamptz default now() not null,
  unique (group_id, user_id, destination_id)
);

-- ============================================
-- 9. EXPENSES (trip expense tracking)
-- ============================================
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  trip_id uuid references public.trips(id) on delete cascade not null,
  paid_by uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  amount integer not null,
  category text default 'other' check (category in ('food', 'transport', 'stay', 'activity', 'shopping', 'other')),
  split_type text default 'equal' check (split_type in ('equal', 'custom')),
  created_at timestamptz default now() not null
);

-- ============================================
-- 10. EXPENSE SPLITS
-- ============================================
create table public.expense_splits (
  id uuid default uuid_generate_v4() primary key,
  expense_id uuid references public.expenses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  settled boolean default false,
  unique (expense_id, user_id)
);

-- ============================================
-- 11. MESSAGES (group chat)
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles: users can read all, update own
alter table public.profiles enable row level security;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Destinations: everyone can read
alter table public.destinations enable row level security;
create policy "Destinations are viewable by everyone" on public.destinations for select using (true);

-- Trips: owner can CRUD
alter table public.trips enable row level security;
create policy "Users can view own trips" on public.trips for select using (auth.uid() = user_id);
create policy "Users can create trips" on public.trips for insert with check (auth.uid() = user_id);
create policy "Users can update own trips" on public.trips for update using (auth.uid() = user_id);
create policy "Users can delete own trips" on public.trips for delete using (auth.uid() = user_id);

-- Itinerary days: accessible via trip ownership
alter table public.itinerary_days enable row level security;
create policy "Users can view own itinerary days" on public.itinerary_days for select using (
  exists (select 1 from public.trips where trips.id = itinerary_days.trip_id and trips.user_id = auth.uid())
);
create policy "Users can manage own itinerary days" on public.itinerary_days for all using (
  exists (select 1 from public.trips where trips.id = itinerary_days.trip_id and trips.user_id = auth.uid())
);

-- Itinerary activities: accessible via trip ownership
alter table public.itinerary_activities enable row level security;
create policy "Users can view own itinerary activities" on public.itinerary_activities for select using (
  exists (
    select 1 from public.itinerary_days d
    join public.trips t on t.id = d.trip_id
    where d.id = itinerary_activities.day_id and t.user_id = auth.uid()
  )
);
create policy "Users can manage own itinerary activities" on public.itinerary_activities for all using (
  exists (
    select 1 from public.itinerary_days d
    join public.trips t on t.id = d.trip_id
    where d.id = itinerary_activities.day_id and t.user_id = auth.uid()
  )
);

-- Groups: members can view
alter table public.groups enable row level security;
create policy "Group members can view groups" on public.groups for select using (
  exists (select 1 from public.group_members where group_members.group_id = groups.id and group_members.user_id = auth.uid())
  or created_by = auth.uid()
);
create policy "Authenticated users can create groups" on public.groups for insert with check (auth.uid() = created_by);
create policy "Group admin can update" on public.groups for update using (auth.uid() = created_by);

-- Group members: members can view group members
alter table public.group_members enable row level security;
create policy "Group members can view members" on public.group_members for select using (
  exists (select 1 from public.group_members gm where gm.group_id = group_members.group_id and gm.user_id = auth.uid())
);
create policy "Users can join groups" on public.group_members for insert with check (auth.uid() = user_id);

-- Votes: group members can vote
alter table public.votes enable row level security;
create policy "Group members can vote" on public.votes for insert with check (
  exists (select 1 from public.group_members where group_members.group_id = votes.group_id and group_members.user_id = auth.uid())
);
create policy "Group members can view votes" on public.votes for select using (
  exists (select 1 from public.group_members where group_members.group_id = votes.group_id and group_members.user_id = auth.uid())
);

-- Expenses: trip participants can view/create
alter table public.expenses enable row level security;
create policy "Trip owner can manage expenses" on public.expenses for all using (
  exists (select 1 from public.trips where trips.id = expenses.trip_id and trips.user_id = auth.uid())
);

-- Expense splits
alter table public.expense_splits enable row level security;
create policy "Users can view own splits" on public.expense_splits for select using (auth.uid() = user_id);
create policy "Trip owner can manage splits" on public.expense_splits for all using (
  exists (
    select 1 from public.expenses e
    join public.trips t on t.id = e.trip_id
    where e.id = expense_splits.expense_id and t.user_id = auth.uid()
  )
);

-- Messages: group members can read/write
alter table public.messages enable row level security;
create policy "Group members can view messages" on public.messages for select using (
  exists (select 1 from public.group_members where group_members.group_id = messages.group_id and group_members.user_id = auth.uid())
);
create policy "Group members can send messages" on public.messages for insert with check (
  auth.uid() = user_id and
  exists (select 1 from public.group_members where group_members.group_id = messages.group_id and group_members.user_id = auth.uid())
);

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_trips_user_id on public.trips(user_id);
create index idx_trips_destination_id on public.trips(destination_id);
create index idx_destinations_region on public.destinations(region);
create index idx_destinations_budget on public.destinations(budget_min, budget_max);
create index idx_itinerary_days_trip_id on public.itinerary_days(trip_id);
create index idx_itinerary_activities_day_id on public.itinerary_activities(day_id);
create index idx_group_members_group_id on public.group_members(group_id);
create index idx_group_members_user_id on public.group_members(user_id);
create index idx_messages_group_id on public.messages(group_id);
create index idx_expenses_trip_id on public.expenses(trip_id);
