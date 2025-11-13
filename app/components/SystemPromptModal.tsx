interface SystemPromptModalProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function SystemPromptModal({ value, onChange, onSave, onCancel }: SystemPromptModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-card rounded-xl p-6 max-w-lg w-full shadow-xl border border-border" 
        role="dialog" 
        aria-labelledby="system-dialog-title"
      >
        <h2 id="system-dialog-title" className="text-lg font-semibold mb-2 text-foreground">
          System Prompt
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Set custom instructions for how the AI should behave. This will be sent with every message.
        </p>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="You are a helpful assistant that provides concise, accurate answers..."
          className="w-full h-32 px-4 py-3 border border-border bg-background rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-foreground placeholder-muted-foreground text-sm transition-all duration-200"
        />
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
