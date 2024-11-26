-- Verify the schema change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
  AND column_name IN ('inspection_types', 'inspection_type');

-- Verify the data migration
SELECT 
  name,
  inspection_types,
  created_at
FROM clients
WHERE array_length(inspection_types, 1) > 0
LIMIT 5;

-- Verify the index
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'clients'
  AND indexname = 'idx_clients_inspection_types';