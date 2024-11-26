-- Get inspection statistics
WITH inspection_stats AS (
    SELECT 
        date_trunc('month', i.inspection_date) as month,
        COUNT(*) as total_inspections,
        SUM(CASE WHEN i.status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN i.status = 'failed' THEN 1 ELSE 0 END) as failed,
        COUNT(DISTINCT i.client_id) as unique_clients,
        COUNT(DISTINCT i.inspector) as unique_inspectors
    FROM 
        inspections i
    WHERE 
        i.inspection_date >= date_trunc('year', current_date)
    GROUP BY 
        date_trunc('month', i.inspection_date)
),
item_stats AS (
    SELECT 
        date_trunc('month', i.inspection_date) as month,
        COUNT(*) as total_items,
        SUM(CASE WHEN ii.status = 'pass' THEN 1 ELSE 0 END) as passed_items,
        SUM(CASE WHEN ii.status = 'fail' THEN 1 ELSE 0 END) as failed_items,
        SUM(CASE WHEN ii.status = 'no-access' THEN 1 ELSE 0 END) as no_access_items
    FROM 
        inspections i
        JOIN inspection_items ii ON i.id = ii.inspection_id
    WHERE 
        i.inspection_date >= date_trunc('year', current_date)
    GROUP BY 
        date_trunc('month', i.inspection_date)
)
SELECT 
    to_char(s.month, 'Month YYYY') as period,
    s.total_inspections,
    s.completed,
    s.failed,
    s.unique_clients,
    s.unique_inspectors,
    i.total_items,
    i.passed_items,
    i.failed_items,
    i.no_access_items,
    ROUND(i.passed_items::numeric / NULLIF(i.total_items, 0) * 100, 2) as pass_rate
FROM 
    inspection_stats s
    LEFT JOIN item_stats i ON s.month = i.month
ORDER BY 
    s.month DESC;