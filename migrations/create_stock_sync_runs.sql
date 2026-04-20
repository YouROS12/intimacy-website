create table if not exists public.stock_sync_runs (
    id bigint generated always as identity primary key,
    trigger_source text not null check (trigger_source in ('cron', 'manual')),
    initiated_by uuid null,
    status text not null check (status in ('running', 'success', 'error')),
    started_at timestamptz not null default now(),
    completed_at timestamptz null,
    stats jsonb null,
    orders_count integer not null default 0,
    rupture_products text[] not null default '{}',
    error_message text null,
    log_lines jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now()
);

create index if not exists stock_sync_runs_started_at_idx on public.stock_sync_runs (started_at desc);
create index if not exists stock_sync_runs_status_idx on public.stock_sync_runs (status);

alter table public.stock_sync_runs enable row level security;