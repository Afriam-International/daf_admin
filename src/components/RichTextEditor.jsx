import { useEffect, useRef } from "react";
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react";

const toolbarButtons = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bullet list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
];

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write the description...",
  minHeight = 220,
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const syncValue = () => {
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const runCommand = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    syncValue();
  };

  const addLink = () => {
    const url = window.prompt("Enter link URL (include https://)");
    if (!url?.trim()) return;

    editorRef.current?.focus();
    document.execCommand("createLink", false, url.trim());
    syncValue();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {toolbarButtons.map(({ command, icon: Icon, label }) => (
          <button
            key={command}
            type="button"
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-(--color-accent)"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-white hover:text-(--color-accent)"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        onInput={syncValue}
        onBlur={syncValue}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="rich-text-editor px-4 py-3 text-sm leading-7 text-slate-700 outline-none"
        suppressContentEditableWarning
      />
    </div>
  );
}
