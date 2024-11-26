-- Check current inspection table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'inspections'
ORDER BY 
    ordinal_position;

-- Check current inspection_items table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'inspection_items'
ORDER BY 
    ordinal_position;