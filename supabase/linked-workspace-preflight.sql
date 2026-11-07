-- TAPPED IN linked-workspace uniqueness preflight.
-- READ ONLY: run against the target database before applying setup.sql.
-- Every row returned here must be reviewed and resolved before enabling the unique index.
SELECT data::jsonb ->> 'linked' AS source_id,
       COUNT(*) AS linked_projects,
       array_agg(id ORDER BY id) AS project_ids
FROM entities
WHERE kind = 'project'
  AND COALESCE(data::jsonb ->> 'linked', '') <> ''
GROUP BY data::jsonb ->> 'linked'
HAVING COUNT(*) > 1
ORDER BY linked_projects DESC, source_id;

-- Inspect projects whose linked source no longer exists.
SELECT p.id AS project_id, p.data::jsonb ->> 'linked' AS missing_source_id
FROM entities p
LEFT JOIN entities src ON src.id = p.data::jsonb ->> 'linked'
WHERE p.kind = 'project'
  AND COALESCE(p.data::jsonb ->> 'linked', '') <> ''
  AND src.id IS NULL
ORDER BY p.id;
