-- Verify inspections data
SELECT 
    i.id,
    i.inspection_date,
    i.location,
    i.inspector,
    i.status,
    i.notes,
    c.name as client_name,
    COUNT(ii.id) as item_count
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
    i.notes,
    c.name
ORDER BY 
    i.inspection_date DESC
LIMIT 5;