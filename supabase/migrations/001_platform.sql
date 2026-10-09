BEGIN;
CREATE SCHEMA IF NOT EXISTS tapped_internal;
CREATE TABLE "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"recipient" text,
	"kind" text NOT NULL,
	"data" text NOT NULL
);

CREATE INDEX "entities_kind_owner" ON "entities" ("kind","owner");
CREATE INDEX "entities_recipient_kind" ON "entities" ("recipient","kind");
CREATE TABLE "grants" (
	"id" text PRIMARY KEY NOT NULL,
	"owner" text NOT NULL,
	"agent" text NOT NULL,
	"read" integer NOT NULL,
	"edit" integer NOT NULL,
	"book" integer NOT NULL
);

CREATE UNIQUE INDEX "grants_owner_agent" ON "grants" ("owner","agent");
CREATE INDEX "grants_agent" ON "grants" ("agent");
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"thread" text NOT NULL,
	"sender" text NOT NULL,
	"body" text NOT NULL,
	"created" text NOT NULL,
	"read_at" text
);

CREATE INDEX "messages_thread_created" ON "messages" ("thread","created");
CREATE TABLE "private_state" (
	"member" text PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"version" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "profiles" (
	"auth_key" text PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"email" text NOT NULL,
	"data" text NOT NULL,
	"created" text NOT NULL
);

CREATE UNIQUE INDEX "profiles_id" ON "profiles" ("id");
CREATE TABLE "threads" (
	"id" text PRIMARY KEY NOT NULL,
	"first" text NOT NULL,
	"second" text NOT NULL,
	"created" text NOT NULL
);

CREATE UNIQUE INDEX "threads_pair" ON "threads" ("first","second");
CREATE INDEX "threads_second" ON "threads" ("second");
CREATE FUNCTION tapped_internal.json_path(p text) RETURNS text[] LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT string_to_array(regexp_replace(regexp_replace(p,'^\$\.?',''),'\[([0-9]+)\]','.\1','g'),'.') $$;
CREATE FUNCTION tapped_internal.json_extract(doc text,p text) RETURNS text LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT CASE jsonb_typeof(doc::jsonb #> tapped_internal.json_path(p)) WHEN 'boolean' THEN CASE WHEN (doc::jsonb #> tapped_internal.json_path(p))='true'::jsonb THEN '1' ELSE '0' END WHEN 'string' THEN doc::jsonb #>> tapped_internal.json_path(p) ELSE (doc::jsonb #> tapped_internal.json_path(p))::text END $$;
CREATE FUNCTION tapped_internal.json_each(doc text,p text) RETURNS TABLE(value text) LANGUAGE sql IMMUTABLE STRICT AS $$ SELECT CASE jsonb_typeof(v) WHEN 'string' THEN v #>> '{}' ELSE v::text END FROM jsonb_array_elements(COALESCE(doc::jsonb #> tapped_internal.json_path(p),'[]'::jsonb)) v $$;
CREATE FUNCTION tapped_internal.json_set(doc text,VARIADIC args text[]) RETURNS text LANGUAGE plpgsql IMMUTABLE STRICT AS $$ DECLARE result jsonb:=doc::jsonb; i integer; BEGIN IF cardinality(args)%2<>0 THEN RAISE EXCEPTION 'Invalid JSON arguments'; END IF; FOR i IN 1..cardinality(args) BY 2 LOOP result:=jsonb_set(result,tapped_internal.json_path(args[i]),to_jsonb(args[i+1]),true); END LOOP; RETURN result::text; END $$;
CREATE FUNCTION tapped_internal.json_remove(doc text,VARIADIC paths text[]) RETURNS text LANGUAGE plpgsql IMMUTABLE STRICT AS $$ DECLARE result jsonb:=doc::jsonb; p text; BEGIN FOREACH p IN ARRAY paths LOOP result:=result #- tapped_internal.json_path(p); END LOOP; RETURN result::text; END $$;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON profiles,private_state,entities,threads,messages,grants FROM anon,authenticated;
REVOKE ALL ON SCHEMA tapped_internal FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA tapped_internal FROM PUBLIC;
-- The server uses the Postgres connection owner and performs member/agent checks.
-- No application table is directly exposed to browser Supabase clients.
COMMIT;
