-- Create a reviews table for the jewelry store
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  customer_id text not null,
  customer_name text not null,
  customer_email text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, customer_id)
);

-- Enable Row Level Security (RLS)
alter table public.reviews enable row level security;

-- Create a policy that allows anyone to read reviews
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'reviews' and policyname = 'Reviews are viewable by everyone'
  ) then
    create policy "Reviews are viewable by everyone" on public.reviews
      for select using (true);
  end if;
end
$$;

-- Create a policy that allows authenticated users to insert reviews
do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'reviews' and policyname = 'Authenticated users can insert reviews'
  ) then
    create policy "Authenticated users can insert reviews" on public.reviews
      for insert with check (auth.role() = 'authenticated');
  end if;
end
$$;
