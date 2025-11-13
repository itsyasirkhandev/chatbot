interface ClearConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClearConfirmModal({ onConfirm, onCancel }: ClearConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border border-border" 
        role="dialog" 
        aria-labelledby="clear-dialog-title"
      >
        <h2 id="clear-dialog-title" className="text-lg font-semibold mb-2 text-foreground">
          Clear conversation?
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          This will permanently delete all messages. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-all duration-200 shadow-sm"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
