-- Add tax ID tracking to glow_girls (store only last 4 digits for security)
alter table public.glow_girls
  add column if not exists tax_id_last4 text,
  add column if not exists tax_id_submitted_at timestamptz;

-- Withdrawal requests table
create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  glow_girl_id uuid not null references public.glow_girls(id),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'PAID', 'DENIED')),
  admin_notes text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.withdrawal_requests enable row level security;

create policy "Glow girls can view own withdrawal requests"
  on public.withdrawal_requests for select
  using (glow_girl_id in (
    select id from public.glow_girls where user_id = auth.uid()
  ));

create policy "Glow girls can create own withdrawal requests"
  on public.withdrawal_requests for insert
  with check (glow_girl_id in (
    select id from public.glow_girls where user_id = auth.uid()
  ));

create policy "Admins can manage all withdrawal requests"
  on public.withdrawal_requests for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
  );
