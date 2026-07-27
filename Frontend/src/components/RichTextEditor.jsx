import React, { useRef, useEffect } from "react";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatClear,
  Title
} from "@mui/icons-material";
import "./RichTextEditor.css";

function RichTextEditor({ value, onChange, placeholder = "Start typing..." }) {
  const editorRef = useRef(null);

  // Sync initial and external changes to innerHTML, avoiding cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const executeCommand = (command, argument = null) => {
    document.execCommand(command, false, argument);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("bold")}
          title="Bold"
        >
          <FormatBold fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("italic")}
          title="Italic"
        >
          <FormatItalic fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("underline")}
          title="Underline"
        >
          <FormatUnderlined fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("strikeThrough")}
          title="Strikethrough"
        >
          <FormatStrikethrough fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("formatBlock", "<h1>")}
          title="Heading 1"
        >
          <Title fontSize="small" style={{ transform: "scale(1.2)" }} />
          <span className="btn-subtext">H1</span>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("formatBlock", "<h2>")}
          title="Heading 2"
        >
          <Title fontSize="small" />
          <span className="btn-subtext">H2</span>
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("formatBlock", "<p>")}
          title="Paragraph"
        >
          <span className="btn-text">P</span>
        </button>

        <span className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <FormatListBulleted fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("insertOrderedList")}
          title="Numbered List"
        >
          <FormatListNumbered fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("justifyLeft")}
          title="Align Left"
        >
          <FormatAlignLeft fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("justifyCenter")}
          title="Align Center"
        >
          <FormatAlignCenter fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("justifyRight")}
          title="Align Right"
        >
          <FormatAlignRight fontSize="small" />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => executeCommand("justifyFull")}
          title="Align Justify"
        >
          <FormatAlignJustify fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button
          type="button"
          className="toolbar-btn toolbar-btn-danger"
          onClick={() => executeCommand("removeFormat")}
          title="Clear Formatting"
        >
          <FormatClear fontSize="small" />
        </button>
      </div>

      <div
        ref={editorRef}
        className="editor-content-area"
        contentEditable
        onInput={handleInput}
        placeholder={placeholder}
        style={{ minHeight: "180px" }}
      />
    </div>
  );
}

export default RichTextEditor;
