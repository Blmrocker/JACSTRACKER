import { Plus, Trash2 } from 'lucide-react';
import Button from '../Button';
import type { InspectionItem } from '../../types/inspection';

interface InspectionItemsProps {
  items: InspectionItem[];
  onChange: (items: InspectionItem[]) => void;
}

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

export default function InspectionItems({
  items,
  onChange,
}: InspectionItemsProps) {
  const handleAddItem = () => {
    onChange([
      ...items,
      {
        item_type: 'Fire Extinguisher',
        floor: '',
        room: '',
        equipment_type: '2.5ABC',
        status: 'pass',
        notes: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof InspectionItem,
    value: string
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange(updatedItems);
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-medium text-gray-900'>Inspection Items</h3>
        <Button type='button' onClick={handleAddItem} size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add Item
        </Button>
      </div>

      <div className='space-y-4'>
        {items.map((item, index) => (
          <div key={index} className='flex items-start space-x-4'>
            <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full'>
              <span className='text-sm font-medium text-gray-700'>
                {index + 1}
              </span>
            </div>
            <div className='flex-grow grid grid-cols-6 gap-4 items-start border p-4 rounded-lg'>
              <div>
                <label
                  htmlFor={`item-${index}-floor`}
                  className='block text-sm font-medium text-gray-700'
                >
                  Floor
                </label>
                <input
                  id={`item-${index}-floor`}
                  type='text'
                  value={item.floor || ''}
                  onChange={(e) =>
                    handleItemChange(index, 'floor', e.target.value)
                  }
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
                  type='text'
                  value={item.room || ''}
                  onChange={(e) =>
                    handleItemChange(index, 'room', e.target.value)
                  }
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
                  value={item.equipment_type}
                  onChange={(e) =>
                    handleItemChange(index, 'equipment_type', e.target.value)
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
                  value={item.status}
                  onChange={(e) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    handleItemChange(index, 'status', e.target.value as any)
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
                    type='text'
                    value={item.notes || ''}
                    onChange={(e) =>
                      handleItemChange(index, 'notes', e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm'
                  />
                  <Button
                    type='button'
                    variant='danger'
                    size='sm'
                    className='mt-1'
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
