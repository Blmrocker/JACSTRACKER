import Button from './Button';
import { Plus, Trash2 } from 'lucide-react';
import type { InspectionItem } from '../types/inspection';

interface InspectionItemsProps {
  items: InspectionItem[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (
    index: number,
    field: keyof InspectionItem,
    value: string
  ) => void;
}

function InspectionItems({
  items,
  onAddItem,
  onRemoveItem,
  onItemChange,
}: InspectionItemsProps) {
  const equipmentTypes = [
    { value: '2.5ABC', label: '2.5 ABC Fire Extinguisher' },
    { value: '5ABC', label: '5 ABC Fire Extinguisher' },
    { value: '10ABC', label: '10 ABC Fire Extinguisher' },
    { value: '20ABC', label: '20 ABC Fire Extinguisher' },
    { value: 'K', label: 'Type K Fire Extinguisher' },
    { value: 'Water', label: 'Water Fire Extinguisher' },
    { value: 'EXIT', label: 'Exit Light' },
    { value: 'COMBO', label: 'Exit/Emergency Combo' },
  ];

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium text-gray-900'>Inspection Items</h3>
        <Button type='button' onClick={onAddItem} size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add Item
        </Button>
      </div>

      <div className='space-y-4'>
        {items.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-6 gap-4 items-start border p-4 rounded-lg'
          >
            <div>
              <label
                htmlFor={`item-${index}-floor`}
                className='block text-sm font-medium text-gray-700'
              >
                Floor
              </label>
              <input
                id={`item-${index}-floor`}
                name={`items.${index}.floor`}
                type='text'
                value={item.floor || ''}
                onChange={(e) => onItemChange(index, 'floor', e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
              />
            </div>

            <div>
              <label
                htmlFor={`item-${index}-room`}
                className='block text-sm font-medium text-gray-700'
              >
                Room
              </label>
              <input
                id={`item-${index}-room`}
                name={`items.${index}.room`}
                type='text'
                value={item.room || ''}
                onChange={(e) => onItemChange(index, 'room', e.target.value)}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
              />
            </div>

            <div>
              <label
                htmlFor={`item-${index}-type`}
                className='block text-sm font-medium text-gray-700'
              >
                Type
              </label>
              <select
                id={`item-${index}-type`}
                name={`items.${index}.equipment_type`}
                value={item.equipment_type}
                onChange={(e) =>
                  onItemChange(index, 'equipment_type', e.target.value)
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
              >
                {equipmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`item-${index}-status`}
                className='block text-sm font-medium text-gray-700'
              >
                Status
              </label>
              <select
                id={`item-${index}-status`}
                name={`items.${index}.status`}
                value={item.status}
                onChange={(e) =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onItemChange(index, 'status', e.target.value as any)
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
              >
                <option value='pass'>Pass</option>
                <option value='fail'>Fail</option>
                <option value='no-access'>No Access</option>
              </select>
            </div>

            <div className='col-span-2'>
              <label
                htmlFor={`item-${index}-notes`}
                className='block text-sm font-medium text-gray-700'
              >
                Notes
              </label>
              <div className='flex space-x-2'>
                <input
                  id={`item-${index}-notes`}
                  name={`items.${index}.notes`}
                  type='text'
                  value={item.notes || ''}
                  onChange={(e) => onItemChange(index, 'notes', e.target.value)}
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
                />
                <Button
                  type='button'
                  variant='danger'
                  size='sm'
                  className='mt-1'
                  onClick={() => onRemoveItem(index)}
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InspectionItems;
