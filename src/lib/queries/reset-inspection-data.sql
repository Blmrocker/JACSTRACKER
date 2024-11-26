-- First, clear existing inspection data
DELETE FROM inspection_items;
DELETE FROM inspections;

-- Insert sample inspections
INSERT INTO inspections (
    client_id,
    inspection_date,
    location,
    inspector,
    status,
    notes,
    cover_page
)
SELECT 
    id as client_id,
    current_date as inspection_date,
    'Main Building' as location,
    'John Smith' as inspector,
    'completed' as status,
    'Initial inspection' as notes,
    true as cover_page
FROM 
    clients
LIMIT 5;

-- Insert sample inspection items
INSERT INTO inspection_items (
    inspection_id,
    item_type,
    floor,
    room,
    equipment_type,
    status,
    notes
)
SELECT 
    i.id as inspection_id,
    'Fire Extinguisher' as item_type,
    'Floor ' || floor(random() * 3 + 1)::text as floor,
    'Room ' || floor(random() * 100 + 1)::text as room,
    CASE floor(random() * 3)
        WHEN 0 THEN '2.5ABC'
        WHEN 1 THEN '5ABC'
        ELSE '10ABC'
    END as equipment_type,
    'pass' as status,
    'Regular maintenance' as notes
FROM 
    inspections i
CROSS JOIN 
    generate_series(1, 5);