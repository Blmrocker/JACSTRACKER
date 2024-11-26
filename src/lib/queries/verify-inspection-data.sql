-- Check if we have any inspections
SELECT COUNT(*) as inspection_count FROM inspections;

-- Check if we have any inspection items
SELECT COUNT(*) as item_count FROM inspection_items;

-- Check the most recent inspections with their items
SELECT 
    i.id,
    i.inspection_date,
    i.location,
    i.inspector,
    i.status,
    i.cover_page,
    i.notes,
    c.name as client_name,
    COUNT(ii.id) as item_count,
    json_agg(json_build_object(
        'type', ii.item_type,
        'equipment_type', ii.equipment_type,
        'status', ii.status
    )) as items
FROM 
    inspections i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN inspection_items ii ON i.id = ii.inspection_id
GROUP BY 
    i.id,
    i.inspection_date,
    i.location,
    i.inspector,
    i.status,
    i.cover_page,
    i.notes,
    c.name
ORDER BY 
    i.inspection_date DESC
LIMIT 5;