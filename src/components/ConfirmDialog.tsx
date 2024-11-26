import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
        <span className='hidden sm:inline-block sm:h-screen sm:align-middle'>
          &#8203;
        </span>
        <div className='inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle'>
          <div className='sm:flex sm:items-start'>
            <div className='mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                {title}
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>{message}</p>
              </div>
            </div>
          </div>
          <div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
            <Button
              type='button'
              variant='danger'
              className='w-full sm:ml-3 sm:w-auto'
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
            <Button
              type='button'
              variant='secondary'
              className='mt-3 w-full sm:mt-0 sm:w-auto'
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
