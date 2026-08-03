import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

const BLOCK_TAGS = ["P", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE"];

// Walks up from a node to find the nearest block-level ancestor inside the editor
function getBlockAncestor(node, root) {
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== root && !BLOCK_TAGS.includes(el.tagName)) {
    el = el.parentElement;
  }
  return el === root ? null : el;
}

// Replaces a wrapper element with its own children (used to "un-bold", "un-italic", etc.)
function unwrapElement(el) {
  const parent = el.parentNode;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const { t } = useTranslation();
  const placeholderText = placeholder || t("template.richTextEditor.placeholder");

  // Sync initial and external changes to innerHTML, avoiding cursor jumps
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const focusEditor = () => {
    if (editorRef.current) editorRef.current.focus();
  };

  // Returns the current selection/range only if it's actually inside our editor
  const getRangeWithinEditor = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!editorRef.current || !editorRef.current.contains(range.commonAncestorContainer)) return null;
    return { selection, range };
  };

  // Toggle an inline style tag (bold/italic/underline/strikethrough) around the current selection
  const toggleInline = (tagName) => {
    focusEditor();
    const context = getRangeWithinEditor();
    if (!context) return;
    const { selection, range } = context;
    if (range.collapsed) return;

    const ancestorNode =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
    const existingTag = ancestorNode?.closest?.(tagName.toLowerCase());

    if (existingTag && editorRef.current.contains(existingTag)) {
      unwrapElement(existingTag);
    } else {
      const wrapper = document.createElement(tagName);
      try {
        wrapper.appendChild(range.extractContents());
        range.insertNode(wrapper);
      } catch {
        return;
      }
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapper);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    emitChange();
  };

  // Change the block-level tag of the current line (p, h1, h2)
  const setBlockFormat = (tagName) => {
    focusEditor();
    const context = getRangeWithinEditor();
    if (!context) return;
    const { range } = context;

    const block = getBlockAncestor(range.startContainer, editorRef.current);
    if (block) {
      const newBlock = document.createElement(tagName);
      newBlock.innerHTML = block.innerHTML;
      block.replaceWith(newBlock);
    } else {
      const wrapper = document.createElement(tagName);
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
    }
    emitChange();
  };

  // Wrap the current block in a list (ul/ol); un-wraps it if it's already that list type
  const toggleList = (listTag) => {
    focusEditor();
    const context = getRangeWithinEditor();
    if (!context) return;
    const { range } = context;

    const block = getBlockAncestor(range.startContainer, editorRef.current);
    const existingList = block?.closest?.(listTag.toLowerCase());

    if (existingList && editorRef.current.contains(existingList)) {
      const items = Array.from(existingList.children);
      items.forEach((li) => {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML;
        existingList.parentNode.insertBefore(p, existingList);
      });
      existingList.remove();
    } else {
      const list = document.createElement(listTag);
      const li = document.createElement("li");
      if (block) {
        li.innerHTML = block.innerHTML;
        block.replaceWith(list);
      } else {
        li.appendChild(range.extractContents());
        range.insertNode(list);
      }
      list.appendChild(li);
    }
    emitChange();
  };

  // Apply text alignment to the current block
  const setAlignment = (alignment) => {
    focusEditor();
    const context = getRangeWithinEditor();
    if (!context) return;
    const { range } = context;

    const block = getBlockAncestor(range.startContainer, editorRef.current);
    if (block) {
      block.style.textAlign = alignment;
      emitChange();
    }
  };

  // Strip all inline formatting (bold/italic/underline/strikethrough) from the selection
  const clearFormatting = () => {
    focusEditor();
    const context = getRangeWithinEditor();
    if (!context) return;
    const { selection, range } = context;
    if (range.collapsed) return;

    const plainText = range.toString();
    range.deleteContents();
    const textNode = document.createTextNode(plainText);
    range.insertNode(textNode);

    const newRange = document.createRange();
    newRange.selectNode(textNode);
    selection.removeAllRanges();
    selection.addRange(newRange);
    emitChange();
  };

  const handleInput = () => {
    emitChange();
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleInline("STRONG")} title={t("template.richTextEditor.bold")}>
          <FormatBold fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleInline("EM")} title={t("template.richTextEditor.italic")}>
          <FormatItalic fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleInline("U")} title={t("template.richTextEditor.underline")}>
          <FormatUnderlined fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleInline("S")} title={t("template.richTextEditor.strikethrough")}>
          <FormatStrikethrough fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setBlockFormat("h1")} title={t("template.richTextEditor.heading1")}>
          <Title fontSize="small" style={{ transform: "scale(1.2)" }} />
          <span className="btn-subtext">H1</span>
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setBlockFormat("h2")} title={t("template.richTextEditor.heading2")}>
          <Title fontSize="small" />
          <span className="btn-subtext">H2</span>
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setBlockFormat("p")} title={t("template.richTextEditor.paragraph")}>
          <span className="btn-text">P</span>
        </button>

        <span className="toolbar-separator" />

        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleList("ul")} title={t("template.richTextEditor.bulletList")}>
          <FormatListBulleted fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => toggleList("ol")} title={t("template.richTextEditor.numberedList")}>
          <FormatListNumbered fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlignment("left")} title={t("template.richTextEditor.alignLeft")}>
          <FormatAlignLeft fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlignment("center")} title={t("template.richTextEditor.alignCenter")}>
          <FormatAlignCenter fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlignment("right")} title={t("template.richTextEditor.alignRight")}>
          <FormatAlignRight fontSize="small" />
        </button>
        <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setAlignment("justify")} title={t("template.richTextEditor.alignJustify")}>
          <FormatAlignJustify fontSize="small" />
        </button>

        <span className="toolbar-separator" />

        <button type="button" className="toolbar-btn toolbar-btn-danger" onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting} title={t("template.richTextEditor.clearFormatting")}>
          <FormatClear fontSize="small" />
        </button>
      </div>

      <div
        ref={editorRef}
        className="editor-content-area"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholderText}
        style={{ minHeight: "180px" }}
      />
    </div>
  );
}

export default RichTextEditor;