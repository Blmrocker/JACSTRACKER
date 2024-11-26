-- Comprehensive inspection data query
SELECT 
    i.id as inspection_id,
    i.inspection_date,
    i.location,
    i.inspector,
    i.status as inspection_status,
    i.notes as inspection_notes,
    i.cover_page,
    c.name as client_name,
    c.point_of_contact,
    c.inspection_type,
    c.frequency,
    COUNT(ii.id) as total_items,
    SUM(CASE WHEN ii.status = 'pass' THEN 1 ELSE 0 END) as passed_items,
    SUM(CASE WHEN ii.status = 'fail' THEN 1 ELSE 0 END) as failed_items,
    SUM(CASE WHEN ii.status = 'no-access' THEN 1 ELSE 0 END) as no_access_items,
    json_agg(json_build_object(
        'id', ii.id,
        'item_type', ii.item_type,
        'floor', ii.floor,
        'room', ii.room,
        'equipment_type', ii.equipment_type,
        'status', ii.status,
        'notes', ii.notes
    )) as inspection_items
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
    i.cover_page,
    c.name,
    c.point_of_contact,
    c.inspection_type,
    c.frequency
ORDER BY 
    i.inspection_date DESC;