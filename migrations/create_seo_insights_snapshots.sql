create table if not exists public.seo_insights_snapshots (
    id bigint generated always as identity primary key,
    property text not null,
    country text not null,
    period_start date not null,
    period_end date not null,
    generated_at timestamptz not null,
    payload jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint seo_insights_snapshots_property_country_key unique (property, country)
);

create index if not exists seo_insights_snapshots_generated_at_idx
    on public.seo_insights_snapshots (generated_at desc);

alter table public.seo_insights_snapshots enable row level security;