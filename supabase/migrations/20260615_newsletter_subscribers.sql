create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    status text not null default 'subscribed',
    source text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unsubscribed_at timestamptz,
    constraint newsletter_subscribers_status_check
        check (status in ('subscribed', 'unsubscribed', 'pending')),
    constraint newsletter_subscribers_email_not_blank
        check (length(trim(email)) > 3)
);

create unique index if not exists newsletter_subscribers_email_unique
    on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_status_created_at_idx
    on public.newsletter_subscribers (status, created_at desc);

create or replace function public.set_newsletter_subscribers_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists newsletter_subscribers_set_updated_at on public.newsletter_subscribers;

create trigger newsletter_subscribers_set_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_newsletter_subscribers_updated_at();

alter table public.newsletter_subscribers enable row level security;

comment on table public.newsletter_subscribers is
    'Private newsletter subscriber list. Access only through server-side API using the Supabase service role key.';
