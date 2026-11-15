"use client";

import React, { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types";
import {
  getMediaLibrary,
  uploadMediaItem,
  updateMediaItem,
  deleteMediaItem,
} from "@/lib/media";
import {
  Search,
  UploadCloud,
  Pencil,
  Trash2,
  Copy,
  Check,
  X,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Info,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";

export default function MediaLibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Edit modal state
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Preview modal
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // Copy feedback toast
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const list = await getMediaLibrary();
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadStats(`Convirtiendo a WebP (${i + 1}/${files.length}): ${file.name}...`);
      try {
        await uploadMediaItem(file);
        successCount++;
      } catch (err) {
        console.error("Error subiendo archivo:", err);
      }
    }

    setUploadStats(`¡${successCount} imagen${successCount > 1 ? "es" : ""} subida${successCount > 1 ? "s" : ""} y convertida${successCount > 1 ? "s" : ""} a WebP!`);
    setTimeout(() => setUploadStats(null), 3500);

    setIsUploading(false);
    await loadMedia();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleStartEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditAlt(item.alt || "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSavingEdit(true);

    try {
      await updateMediaItem(editingItem.id, {
        name: editName.trim() || editingItem.name,
        alt: editAlt.trim(),
      });
      await loadMedia();
      setEditingItem(null);
    } catch (err) {
      console.error("Error guardando cambios:", err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    const confirm = window.confirm(
      `¿Estás seguro de eliminar "${item.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirm) return;

    try {
      await deleteMediaItem(item.id, item.url);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Sort
  const filteredItems = items
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.alt.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "size") {
        return (b.sizeBytes || 0) - (a.sizeBytes || 0);
      }
      // recent default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Navigation helpers for preview modal
  const previewIndex = previewItem
    ? filteredItems.findIndex((i) => i.id === previewItem.id)
    : -1;

  const handlePrevPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredItems.length === 0 || previewIndex === -1) return;
    const prevIdx = (previewIndex - 1 + filteredItems.length) % filteredItems.length;
    setPreviewItem(filteredItems[prevIdx]);
  };

  const handleNextPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredItems.length === 0 || previewIndex === -1) return;
    const nextIdx = (previewIndex + 1) % filteredItems.length;
    setPreviewItem(filteredItems[nextIdx]);
  };

  // Keyboard navigation for image preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewItem) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevPreview();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPreview();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setPreviewItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem, previewIndex, filteredItems]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "WebP";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-[97%] mx-auto space-y-7 animate-fadeIn">
      {/* 1. Header & Summary Banner */}
      <div className="bg-white p-7 rounded-3xl border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center shadow-xs">
              <ImageIcon size={24} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-gray-900 uppercase tracking-wider">
                Biblioteca Multimedia
              </h2>
              <p className="text-xs text-gray-500 font-light">
                Gestor central de imágenes con conversión automática al formato moderno <strong>WebP</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Stats badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <span className="text-gray-400 uppercase text-[10px] font-bold block tracking-wider">
              Total Archivos
            </span>
            <span className="text-sm font-bold text-gray-900 font-mono">
              {items.length} imágenes
            </span>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-600 uppercase text-[10px] font-bold block tracking-wider flex items-center space-x-1">
              <Sparkles size={11} />
              <span>Optimización</span>
            </span>
            <span className="text-sm font-bold text-emerald-800 font-mono">
              100% WebP Activo
            </span>
          </div>

          <label className="flex items-center space-x-2 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-5 rounded-2xl cursor-pointer transition-all shadow-md">
            <UploadCloud size={17} />
            <span>Subir Imágenes</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center space-y-3 relative overflow-hidden ${
          isDragOver
            ? "border-[#FC7D00] bg-[#FC7D00]/5 scale-[0.99]"
            : "border-gray-200 bg-white hover:border-gray-300 shadow-xs"
        }`}
      >
        <div className="w-14 h-14 rounded-3xl bg-gray-50 text-[#FC7D00] flex items-center justify-center shadow-inner">
          {isUploading ? (
            <Loader2 className="animate-spin" size={26} />
          ) : (
            <UploadCloud size={26} />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-800">
            {isUploading
              ? (uploadStats || "Convirtiendo y subiendo archivos...")
              : "Arrastrá tus imágenes aquí o hacé clic para explorar"}
          </p>
          <p className="text-xs text-gray-400 font-light max-w-lg">
            Acepta PNG, JPG, JPEG, GIF o WEBP. El motor las optimizará y convertirá automáticamente a <strong>.WEBP</strong> con reducción de peso y máxima fidelidad de color.
          </p>
        </div>

        <label className="inline-block mt-2">
          <span className="text-xs font-bold text-[#FC7D00] hover:underline cursor-pointer">
            Examinar archivos desde tu equipo
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* 3. Toolbar: Search & Sort Filter */}
      <div className="bg-white p-4 px-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de archivo o texto alt..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#FC7D00] outline-none"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider flex items-center space-x-1">
            <ArrowUpDown size={12} />
            <span>Ordenar:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-xs font-medium outline-none focus:border-[#FC7D00]"
          >
            <option value="recent">Más recientes primero</option>
            <option value="name">Nombre (A - Z)</option>
            <option value="size">Más pesadas primero</option>
          </select>
        </div>
      </div>

      {/* 4. Media Grid */}
      {loading ? (
        <div className="py-24 text-center text-gray-400 space-y-3">
          <Loader2 className="animate-spin mx-auto text-[#FC7D00]" size={36} />
          <p className="text-xs font-medium">Cargando biblioteca multimedia...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white py-20 rounded-3xl border border-gray-200/80 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            <ImageIcon size={30} />
          </div>
          <h4 className="font-heading font-bold text-gray-800 text-base uppercase tracking-wider">
            No se encontraron imágenes
          </h4>
          <p className="text-xs text-gray-400 max-w-md mx-auto font-light">
            Intentá con otro término de búsqueda o subí nuevas imágenes arrastrándolas al área superior.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image Preview Area */}
              <div onClick={() => setPreviewItem(item)} className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-2 border-b border-gray-100 cursor-pointer">
                <img
                  src={item.url}
                  alt={item.alt || item.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg";
                  }}
                />

                {/* WEBP Badge */}
                <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  WEBP
                </span>

                {/* Quick Expand Button */}
                <button
                  onClick={() => setPreviewItem(item)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ver en grande"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p
                    className="text-xs font-bold text-gray-900 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </p>

                  <div className="text-[11px] text-gray-500 font-light">
                    <span className="text-gray-400 font-semibold">Alt: </span>
                    <span className="italic truncate inline-block max-w-[170px] align-bottom">
                      {item.alt ? item.alt : "— Sin texto alternativo —"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400 pt-1">
                    <span>{formatFileSize(item.sizeBytes)}</span>
                    {item.width && item.height && (
                      <>
                        <span>·</span>
                        <span>{item.width}×{item.height}px</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    {/* Edit Name & Alt */}
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                      title="Editar nombre y texto Alt"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                      title="Copiar URL"
                    >
                      {copiedId === item.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {/* Open direct URL */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                      title="Abrir imagen original"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar imagen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Edit Modal (Name & Alt) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2.5">
                <Pencil size={18} className="text-[#FC7D00]" />
                <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                  Editar Información de la Imagen
                </h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Preview */}
              <div className="h-44 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden p-3">
                <img
                  src={editingItem.url}
                  alt={editingItem.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Nombre del Archivo *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-mono font-medium outline-none focus:border-[#FC7D00]"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Recomendación: Usar guiones y extensión .webp (ej: sofa-escandinavo-paraíso.webp).
                </p>
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Texto Alternativo (Alt SEO)
                </label>
                <textarea
                  rows={3}
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="Ej: Rack TV nórdico en melamina paraíso con cajones laqueados para living moderno Acasa"
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#FC7D00] leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Crucial para el posicionamiento en Google Imágenes y accesibilidad de clientes con lectores de pantalla.
                </p>
              </div>
            </div>

            <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50/30">
              <button
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="px-6 py-2.5 rounded-xl bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-sm transition-all"
              >
                {isSavingEdit ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Preview Modal (Full image with arrow navigation) */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 animate-fadeIn select-none"
        >
          {/* Main Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[95vh] bg-[#141416] text-white rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-white/10"
          >
            {/* Top Toolbar */}
            <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center space-x-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-gray-200 px-3 py-1 rounded-full">
                  {previewIndex + 1} de {filteredItems.length}
                </span>
                <span className="text-xs font-semibold text-gray-300 truncate max-w-xs sm:max-w-md">
                  {previewItem.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Quick Edit */}
                <button
                  onClick={() => {
                    const itemToEdit = previewItem;
                    setPreviewItem(null);
                    handleStartEdit(itemToEdit);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Editar nombre y Alt"
                >
                  <Pencil size={16} />
                </button>

                {/* Copy URL */}
                <button
                  onClick={() => handleCopyUrl(previewItem)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Copiar enlace"
                >
                  {copiedId === previewItem.id ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>

                {/* Open in new tab */}
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors"
                  title="Ver en pestaña nueva"
                >
                  <ExternalLink size={16} />
                </a>

                {/* Close */}
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors ml-1"
                  title="Cerrar (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Central Image Viewport with Left/Right Arrows */}
            <div className="relative flex-1 min-h-[50vh] max-h-[68vh] flex items-center justify-center p-4 sm:p-6 bg-black/40">
              {/* Prev Arrow */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevPreview}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-xl transition-all hover:scale-110 z-20 cursor-pointer border border-white/15"
                  title="Imagen anterior (Flecha Izquierda ←)"
                >
                  <ChevronLeft size={26} />
                </button>
              )}

              {/* Main Image */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={previewItem.url}
                  alt={previewItem.alt || previewItem.name}
                  className="max-h-[64vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-200"
                />
              </div>

              {/* Next Arrow */}
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextPreview}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/60 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-xl transition-all hover:scale-110 z-20 cursor-pointer border border-white/15"
                  title="Imagen siguiente (Flecha Derecha →)"
                >
                  <ChevronRight size={26} />
                </button>
              )}
            </div>

            {/* Bottom Meta & Thumbnails Bar */}
            <div className="p-4 px-6 border-t border-white/10 bg-black/60 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-white text-sm block">
                    {previewItem.name}
                  </span>
                  <span className="text-gray-400 text-[11px] font-light">
                    {previewItem.alt ? (
                      <>Alt: <span className="text-gray-200 font-medium">"{previewItem.alt}"</span></>
                    ) : (
                      <span className="italic text-gray-500">Sin texto alternativo</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-3 font-mono text-[11px] text-gray-400">
                  <span>{formatFileSize(previewItem.sizeBytes)}</span>
                  {previewItem.width && previewItem.height && (
                    <>
                      <span>·</span>
                      <span>{previewItem.width}×{previewItem.height}px</span>
                    </>
                  )}
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                    WEBP
                  </span>
                </div>
              </div>

              {/* Quick Jump Thumbnail Strip */}
              {filteredItems.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none pt-1 border-t border-white/5">
                  {filteredItems.map((thumbItem, tIdx) => {
                    const isCurrent = thumbItem.id === previewItem.id;
                    return (
                      <button
                        key={thumbItem.id}
                        type="button"
                        onClick={() => setPreviewItem(thumbItem)}
                        className={`w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          isCurrent
                            ? "border-[#FC7D00] scale-105 shadow-md opacity-100"
                            : "border-transparent opacity-40 hover:opacity-90"
                        }`}
                        title={thumbItem.name}
                      >
                        <img
                          src={thumbItem.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
