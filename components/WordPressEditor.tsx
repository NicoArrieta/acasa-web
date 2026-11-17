"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Unlink,
  RemoveFormatting,
  Undo2,
  Redo2,
  Code,
  Eye,
} from "lucide-react";

interface WordPressEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function WordPressEditor({
  value,
  onChange,
  placeholder = "Escribe la descripción completa aquí...",
  minHeight = "220px",
}: WordPressEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync value from props to editor innerHTML when not focused/modified internally
  useEffect(() => {
    if (editorRef.current && mode === "visual") {
      if (!isInternalChange.current && editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value, mode]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html === "<p><br></p>" || html === "<br>" ? "" : html);
    }
  }, [onChange]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    if (mode !== "visual") return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatBlock = (tag: string) => {
    exec("formatBlock", tag);
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const url = prompt("Introduce la URL del enlace (ej: https://...):", "https://");
    if (url && url.trim() !== "https://" && url.trim() !== "") {
      exec("createLink", url.trim());
    }
  };

  // Switch tabs
  const handleSwitchMode = (newMode: "visual" | "html") => {
    if (newMode === mode) return;
    if (newMode === "html") {
      // Switched from visual to html
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    } else {
      // Switched from html to visual
      // DOM innerHTML will be updated by useEffect on value change
    }
    setMode(newMode);
  };

  // Word count helper
  const textContent = (value || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = textContent ? textContent.split(" ").length : 0;
  const charCount = textContent.length;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm transition-all focus-within:border-black/50 focus-within:ring-2 focus-within:ring-black/5">
      {/* Top Header: WordPress Style Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#f6f7f7] px-3 py-1.5 select-none">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Editor de Contenido
          </span>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-200/60">
            WordPress Style
          </span>
        </div>

        {/* Visual / HTML Switcher */}
        <div className="flex items-center space-x-1 bg-gray-200/70 p-0.5 rounded-lg border border-gray-300/80">
          <button
            type="button"
            onClick={() => handleSwitchMode("visual")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === "visual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-black hover:bg-gray-100/50"
            }`}
          >
            <Eye size={13} />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode("html")}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              mode === "html"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-black hover:bg-gray-100/50"
            }`}
          >
            <Code size={13} />
            <span>HTML / Código</span>
          </button>
        </div>
      </div>

      {/* WordPress-style Toolbar (Active in Visual Mode) */}
      {mode === "visual" && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-[#fafafa] select-none text-gray-700">
          {/* Format selector */}
          <select
            onChange={(e) => handleFormatBlock(e.target.value)}
            defaultValue="<p>"
            className="text-xs bg-white border border-gray-300 rounded-md px-2 py-1 outline-none font-medium hover:border-gray-400 cursor-pointer"
            title="Formato de párrafo"
          >
            <option value="<p>">Párrafo (Normal)</option>
            <option value="<h2>">Encabezado 2 (H2)</option>
            <option value="<h3>">Encabezado 3 (H3)</option>
            <option value="<h4>">Encabezado 4 (H4)</option>
            <option value="<pre>">Preformateado</option>
          </select>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("bold")}
            title="Negrita (Ctrl+B)"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("italic")}
            title="Cursiva (Ctrl+I)"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("underline")}
            title="Subrayado (Ctrl+U)"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Underline size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("strikeThrough")}
            title="Tachado"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Strikethrough size={15} />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertUnorderedList")}
            title="Lista con viñetas"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("insertOrderedList")}
            title="Lista numerada"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <ListOrdered size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("formatBlock", "<blockquote>")}
            title="Cita en bloque"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Quote size={15} />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("justifyLeft")}
            title="Alinear a la izquierda"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <AlignLeft size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("justifyCenter")}
            title="Alinear al centro"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <AlignCenter size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("justifyRight")}
            title="Alinear a la derecha"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <AlignRight size={15} />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Links */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleLink}
            title="Insertar/editar enlace"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Link2 size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("unlink")}
            title="Quitar enlace"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Unlink size={15} />
          </button>

          <span className="w-px h-5 bg-gray-300 mx-1" />

          {/* Formatting Clear */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("removeFormat")}
            title="Eliminar formato"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <RemoveFormatting size={15} />
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("undo")}
            title="Deshacer (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer ml-auto"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec("redo")}
            title="Rehacer (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-gray-200/80 active:bg-gray-300 transition-colors cursor-pointer"
          >
            <Redo2 size={15} />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="relative">
        {mode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-4 outline-none text-xs sm:text-sm text-gray-800 leading-relaxed overflow-y-auto max-h-[450px] empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:text-gray-800 [&_strong]:text-black [&_strong]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-black [&_h2]:my-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-black [&_h3]:my-2 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:text-black [&_h4]:my-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-2 [&_a]:text-blue-600 [&_a]:underline"
          />
        ) : (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ minHeight }}
            placeholder={placeholder}
            className="w-full p-4 outline-none font-mono text-xs text-gray-800 leading-relaxed resize-y border-none bg-gray-50/40 focus:bg-white"
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-[#fcfcfc] px-3 py-1.5 text-[11px] text-gray-500">
        <div className="flex items-center space-x-3">
          <span>
            Palabras: <strong className="text-gray-800">{wordCount}</strong>
          </span>
          <span>
            Caracteres: <strong className="text-gray-800">{charCount}</strong>
          </span>
        </div>
        <div className="text-[10px] text-gray-400">
          Modo actual: <span className="font-semibold text-gray-600">{mode === "visual" ? "Visual (WYSIWYG)" : "HTML / Texto"}</span>
        </div>
      </div>
    </div>
  );
}
