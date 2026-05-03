create table if not exists product_reviews (
  id uuid default gen_random_uuid() primary key,
  product_id text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  content text not null,
  reviewer_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- set up row level security
alter table product_reviews enable row level security;

-- allow anyone to read reviews
create policy "Anyone can view product reviews" on product_reviews
  for select using (true);

-- allow anyone to insert a review for now
create policy "Anyone can insert product reviews" on product_reviews
  for insert with check (true);
