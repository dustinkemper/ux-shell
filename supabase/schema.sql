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
  quality integer,
  modified_at timestamptz default now(),
  location text,
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
  ('ws_growth', 'Growth Workspace', 'Jordan Lee', 'GTM'),
  ('ws_platform', 'Data Platform', 'Priya Patel', 'Core Systems')
on conflict (id) do nothing;

insert into folders (id, name, workspace_id, parent_folder_id) values
  ('fd_finance', 'Finance', 'ws_analytics', null),
  ('fd_marketing', 'Marketing', 'ws_growth', null),
  ('fd_ops', 'Operations', 'ws_platform', null),
  ('fd_revops', 'Revenue Ops', 'ws_growth', 'fd_marketing')
on conflict (id) do nothing;

insert into assets (
  id, name, type, description, parent_id, workspace_id, folder_id, owner, quality, modified_at, location, is_pinned
) values
  ('ws_analytics', 'Analytics Studio', 'workspace', 'Company analytics workspace', null, 'ws_analytics', null, 'Avery Chen', 92, now() - interval '2 days', 'Data Platform', true),
  ('ws_growth', 'Growth Workspace', 'workspace', 'Growth and marketing analytics', null, 'ws_growth', null, 'Jordan Lee', 88, now() - interval '4 days', 'GTM', false),
  ('ws_platform', 'Data Platform', 'workspace', 'Core data platform assets', null, 'ws_platform', null, 'Priya Patel', 95, now() - interval '1 days', 'Core Systems', true),

  ('fd_finance', 'Finance', 'folder', 'Finance reporting assets', 'ws_analytics', 'ws_analytics', 'fd_finance', 'Avery Chen', 86, now() - interval '6 days', 'Data Platform', false),
  ('fd_marketing', 'Marketing', 'folder', 'Marketing analytics assets', 'ws_growth', 'ws_growth', 'fd_marketing', 'Jordan Lee', 84, now() - interval '5 days', 'GTM', false),
  ('fd_ops', 'Operations', 'folder', 'Operations and quality', 'ws_platform', 'ws_platform', 'fd_ops', 'Priya Patel', 90, now() - interval '3 days', 'Core Systems', false),
  ('fd_revops', 'Revenue Ops', 'folder', 'Revenue operations reporting', 'fd_marketing', 'ws_growth', 'fd_revops', 'Jordan Lee', 83, now() - interval '7 days', 'GTM', false),

  ('conn_snowflake', 'Snowflake - Prod', 'connection', 'Primary warehouse connection', 'ws_platform', 'ws_platform', null, 'Priya Patel', 93, now() - interval '1 days', 'Core Systems', true),
  ('conn_postgres', 'Postgres - Billing', 'connection', 'Billing system database', 'fd_finance', 'ws_analytics', 'fd_finance', 'Avery Chen', 89, now() - interval '2 days', 'Data Platform', false),
  ('conn_hubspot', 'HubSpot - Marketing', 'connection', 'Marketing automation data', 'fd_marketing', 'ws_growth', 'fd_marketing', 'Jordan Lee', 85, now() - interval '4 days', 'GTM', false),

  ('pipe_revenue_daily', 'Daily Revenue Pipeline', 'pipeline', 'Transforms order data into revenue facts', 'fd_revops', 'ws_growth', 'fd_revops', 'Jordan Lee', 90, now() - interval '2 days', 'GTM', true),
  ('pipe_finance_close', 'Month-End Close Pipeline', 'pipeline', 'Curates finance close metrics', 'fd_finance', 'ws_analytics', 'fd_finance', 'Avery Chen', 88, now() - interval '3 days', 'Data Platform', false),

  ('app_exec_dashboard', 'Executive Metrics Dashboard', 'analytics-app', 'Executive KPI overview', 'ws_analytics', 'ws_analytics', null, 'Avery Chen', 91, now() - interval '1 days', 'Data Platform', true),
  ('app_growth_funnel', 'Growth Funnel Explorer', 'analytics-app', 'Acquisition and activation tracking', 'fd_marketing', 'ws_growth', 'fd_marketing', 'Jordan Lee', 87, now() - interval '5 days', 'GTM', false),

  ('flow_customer_dim', 'Customer Dimension Flow', 'dataflow', 'Standardizes customer identities', 'ws_platform', 'ws_platform', null, 'Priya Patel', 92, now() - interval '2 days', 'Core Systems', false),
  ('recipe_orders_clean', 'Orders Cleanup Recipe', 'table-recipe', 'Cleanses order line items', 'fd_revops', 'ws_growth', 'fd_revops', 'Jordan Lee', 84, now() - interval '6 days', 'GTM', false),
  ('script_attribution', 'Attribution Modeling Script', 'script', 'Multi-touch attribution logic', 'fd_marketing', 'ws_growth', 'fd_marketing', 'Jordan Lee', 82, now() - interval '8 days', 'GTM', false),

  ('dp_customer_360', 'Customer 360 Data Product', 'data-product', 'Curated customer profile dataset', 'ws_platform', 'ws_platform', null, 'Priya Patel', 94, now() - interval '3 days', 'Core Systems', true),
  ('monitor_quality', 'Pipeline Quality Monitor', 'monitor-view', 'Freshness and quality checks', 'fd_ops', 'ws_platform', 'fd_ops', 'Priya Patel', 93, now() - interval '2 days', 'Core Systems', false),
  ('glossary_kpis', 'KPI Glossary', 'glossary', 'Definitions for core KPIs', 'ws_analytics', 'ws_analytics', null, 'Avery Chen', 89, now() - interval '7 days', 'Data Platform', false),
  ('kb_runbooks', 'Data Operations Runbooks', 'knowledge-base', 'Operational documentation and runbooks', 'fd_ops', 'ws_platform', 'fd_ops', 'Priya Patel', 86, now() - interval '4 days', 'Core Systems', false),
  ('predict_churn', 'Churn Risk Prediction', 'predict', 'Customer churn propensity model', 'ws_platform', 'ws_platform', null, 'Priya Patel', 88, now() - interval '6 days', 'Core Systems', false),
  ('assistant_analyst', 'Analyst Copilot', 'ai-assistant', 'AI assistant for exploratory analysis', 'ws_analytics', 'ws_analytics', null, 'Avery Chen', 85, now() - interval '5 days', 'Data Platform', false)
on conflict (id) do nothing;

insert into connection_metadata (
  asset_id, connection_type, host, port, database, username, schema, account, warehouse, role, api_key, client_id, client_secret, account_id
) values
  ('conn_snowflake', 'data-warehouse', null, null, 'ANALYTICS', 'svc_analytics', 'PUBLIC', 'acme', 'WH_XS', 'ANALYST', null, null, null, null),
  ('conn_postgres', 'database', 'billing-db.internal', 5432, 'billing', 'svc_billing', 'public', null, null, null, null, null, null, null),
  ('conn_hubspot', 'api', null, null, null, null, null, null, null, null, 'hubspot_api_key', 'hubspot_client_id', 'hubspot_client_secret', 'hubspot_account_id')
on conflict (asset_id) do nothing;

insert into tags (id, name) values
  ('tag_finance', 'finance'),
  ('tag_growth', 'growth'),
  ('tag_marketing', 'marketing'),
  ('tag_pii', 'pii'),
  ('tag_gold', 'gold')
on conflict (id) do nothing;

insert into collections (id, name) values
  ('col_exec', 'Executive Metrics'),
  ('col_revops', 'Revenue Ops'),
  ('col_customer', 'Customer 360')
on conflict (id) do nothing;

insert into asset_tags (asset_id, tag_id) values
  ('pipe_revenue_daily', 'tag_growth'),
  ('pipe_revenue_daily', 'tag_gold'),
  ('dp_customer_360', 'tag_pii'),
  ('dp_customer_360', 'tag_gold'),
  ('app_exec_dashboard', 'tag_gold')
on conflict do nothing;

insert into asset_collections (asset_id, collection_id) values
  ('app_exec_dashboard', 'col_exec'),
  ('pipe_revenue_daily', 'col_revops'),
  ('dp_customer_360', 'col_customer')
on conflict do nothing;
