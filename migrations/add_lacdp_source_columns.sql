alter table if exists public.products
    add column if not exists external_source text,
    add column if not exists external_id text,
    add column if not exists external_image_url text,
    add column if not exists source_payload jsonb;

create unique index if not exists products_external_source_external_id_idx
    on public.products (external_source, external_id)
    where external_source is not null and external_id is not null;