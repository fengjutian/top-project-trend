import {Toaster as SonnerToaster} from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group toast bg-background text-foreground border border-border shadow-md font-sans',
          description: 'text-muted-foreground',
          actionButton: 'btn-primary',
          cancelButton: 'btn-outline',
        },
      }}
    />
  );
}
