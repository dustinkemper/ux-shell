-- Schema for Catalog assets and supporting tables
create table if not exists workspaces (
  id text primary key,
  name text not null,
  owner text,
  location text,
  created_at timestamptz default now()
);

create table if not exists folders (
  id text primary key,
  name text not null,
  workspace_id text references workspaces(id) on delete cascade,
  parent_folder_id text references folders(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists assets (
  id text primary key,
  name text not null,
  type text not null,
  description text,
  parent_id text references assets(id) on delete cascade,
  workspace_id text references workspaces(id) on delete set null,
  folder_id text references folders(id) on delete set null,
  owner text,
  modified_at timestamptz default now(),
  is_pinned boolean default false,
  icon text,
  created_at timestamptz default now()
);

create table if not exists tags (
  id text primary key,
  name text not null unique
);

create table if not exists collections (
  id text primary key,
  name text not null unique
);

create table if not exists asset_tags (
  asset_id text references assets(id) on delete cascade,
  tag_id text references tags(id) on delete cascade,
  primary key (asset_id, tag_id)
);

create table if not exists asset_collections (
  asset_id text references assets(id) on delete cascade,
  collection_id text references collections(id) on delete cascade,
  primary key (asset_id, collection_id)
);

create table if not exists connection_metadata (
  asset_id text primary key references assets(id) on delete cascade,
  connection_type text not null,
  host text,
  port integer,
  database text,
  username text,
  schema text,
  account text,
  warehouse text,
  role text,
  api_key text,
  client_id text,
  client_secret text,
  account_id text
);

-- Seed data
insert into workspaces (id, name, owner, location) values
  ('ws_analytics', 'Analytics Studio', 'Avery Chen', 'Data Platform'),
  ('ws_marketing', 'Marketing', 'Jordan Lee', 'GTM'),
  ('ws_platform', 'Data Platform', 'Priya Patel', 'Core Systems')
on conflict (id) do nothing;

insert into folders (id, name, workspace_id, parent_folder_id) values
  ('fd_exec_reporting', 'Executive Reporting', 'ws_analytics', null),
  ('fd_campaign_perf', 'Campaign Performance', 'ws_marketing', null),
  ('fd_core_data', 'Core Data', 'ws_platform', null)
on conflict (id) do nothing;

insert into assets (
  id, name, type, description, parent_id, workspace_id, folder_id, owner, modified_at, is_pinned
) values
  ('ws_analytics', 'Analytics Studio', 'workspace', 'Primary analytics workspace', null, 'ws_analytics', null, 'Avery Chen', now() - interval '2 days', true),
  ('ws_marketing', 'Marketing', 'workspace', 'Marketing analytics and reporting', null, 'ws_marketing', null, 'Jordan Lee', now() - interval '4 days', false),
  ('ws_platform', 'Data Platform', 'workspace', 'Core data platform assets', null, 'ws_platform', null, 'Priya Patel', now() - interval '1 days', true),

  ('fd_exec_reporting', 'Executive Reporting', 'folder', 'Executive reporting assets', 'ws_analytics', 'ws_analytics', 'fd_exec_reporting', 'Avery Chen', now() - interval '6 days', false),
  ('fd_campaign_perf', 'Campaign Performance', 'folder', 'Campaign performance assets', 'ws_marketing', 'ws_marketing', 'fd_campaign_perf', 'Jordan Lee', now() - interval '5 days', false),
  ('fd_core_data', 'Core Data', 'folder', 'Core platform pipelines', 'ws_platform', 'ws_platform', 'fd_core_data', 'Priya Patel', now() - interval '3 days', false),

  ('conn_snowflake_analytics', 'Snowflake - Analytics', 'connection', 'Analytics warehouse connection', 'ws_analytics', 'ws_analytics', null, 'Avery Chen', now() - interval '1 days', true),
  ('conn_hubspot', 'HubSpot - Marketing', 'connection', 'Marketing automation data', 'ws_marketing', 'ws_marketing', null, 'Jordan Lee', now() - interval '4 days', false),
  ('conn_google_ads', 'Google Ads', 'connection', 'Paid acquisition data', 'ws_marketing', 'ws_marketing', null, 'Jordan Lee', now() - interval '3 days', false),
  ('conn_mysql_billing', 'MySQL - Billing', 'connection', 'Billing system database', 'ws_platform', 'ws_platform', null, 'Priya Patel', now() - interval '2 days', false),
  ('conn_snowflake_prod', 'Snowflake - Prod', 'connection', 'Primary warehouse connection', 'ws_platform', 'ws_platform', null, 'Priya Patel', now() - interval '1 days', true),

  ('pipe_kpi_rollup', 'Daily KPI Rollup', 'pipeline', 'Rolls up KPI metrics for reporting', 'fd_exec_reporting', 'ws_analytics', 'fd_exec_reporting', 'Avery Chen', now() - interval '3 days', false),
  ('pipe_ad_spend', 'Ad Spend Attribution', 'pipeline', 'Attribution for paid spend', 'fd_campaign_perf', 'ws_marketing', 'fd_campaign_perf', 'Jordan Lee', now() - interval '2 days', false),
  ('pipe_customer_360', 'Customer 360 Pipeline', 'pipeline', 'Builds customer 360 dataset', 'fd_core_data', 'ws_platform', 'fd_core_data', 'Priya Patel', now() - interval '2 days', false),
  ('pipe_revenue_facts', 'Revenue Facts Pipeline', 'pipeline', 'Curates revenue facts', 'fd_core_data', 'ws_platform', 'fd_core_data', 'Priya Patel', now() - interval '4 days', false),

  ('app_exec_dashboard', 'Executive Metrics Dashboard', 'analytics-app', 'Executive KPI overview', 'fd_exec_reporting', 'ws_analytics', 'fd_exec_reporting', 'Avery Chen', now() - interval '1 days', true),
  ('app_operations_overview', 'Operations Overview', 'analytics-app', 'Operations performance overview', 'ws_analytics', 'ws_analytics', null, 'Avery Chen', now() - interval '5 days', false),
  ('app_campaign_perf', 'Campaign Performance Dashboard', 'analytics-app', 'Campaign performance overview', 'fd_campaign_perf', 'ws_marketing', 'fd_campaign_perf', 'Jordan Lee', now() - interval '3 days', false)
on conflict (id) do nothing;

insert into connection_metadata (
  asset_id, connection_type, host, port, database, username, schema, account, warehouse, role, api_key, client_id, client_secret, account_id
) values
  ('conn_snowflake_analytics', 'data-warehouse', null, null, 'ANALYTICS', 'svc_analytics', 'PUBLIC', 'acme', 'WH_XS', 'ANALYST', null, null, null, null),
  ('conn_hubspot', 'api', null, null, null, null, null, null, null, null, 'hubspot_api_key', 'hubspot_client_id', 'hubspot_client_secret', 'hubspot_account_id'),
  ('conn_google_ads', 'api', null, null, null, null, null, null, null, null, 'google_ads_key', 'google_ads_client_id', 'google_ads_client_secret', 'google_ads_account_id'),
  ('conn_mysql_billing', 'database', 'billing-db.internal', 3306, 'billing', 'svc_billing', null, null, null, null, null, null, null, null),
  ('conn_snowflake_prod', 'data-warehouse', null, null, 'PROD', 'svc_warehouse', 'PUBLIC', 'acme', 'WH_SM', 'ANALYST', null, null, null, null)
on conflict (asset_id) do nothing;
