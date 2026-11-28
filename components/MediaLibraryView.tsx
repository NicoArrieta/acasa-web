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
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Save,
  Download,
} from "lucide-react";

export default function MediaLibraryView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "size">("recent");
  const [visibleCount, setVisibleCount] = useState(20);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Unified Ficha de la Imagen (Split Modal)
  const [activeFicha, setActiveFicha] = useState<MediaItem | null>(null);
  const [activeName, setActiveName] = useState("");
  const [activeAlt, setActiveAlt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  // Open Ficha
  const openFicha = (item: MediaItem) => {
    setActiveFicha(item);
    setActiveName(item.name);
    setActiveAlt(item.alt || "");
    setSaveSuccess(false);
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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const visibleItems = filteredItems.slice(0, visibleCount);

  // Navigation helpers for Ficha modal
  const activeIndex = activeFicha
    ? filteredItems.findIndex((i) => i.id === activeFicha.id)
    : -1;

  const handlePrevFicha = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredItems.length === 0 || activeIndex === -1) return;
    const prevIdx = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
    openFicha(filteredItems[prevIdx]);
  };

  const handleNextFicha = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (filteredItems.length === 0 || activeIndex === -1) return;
    const nextIdx = (activeIndex + 1) % filteredItems.length;
    openFicha(filteredItems[nextIdx]);
  };

  // Keyboard navigation for Ficha
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeFicha) return;
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (e.key === "Escape") {
        e.preventDefault();
        setActiveFicha(null);
      } else if (e.key === "ArrowLeft" && !isInput) {
        e.preventDefault();
        handlePrevFicha();
      } else if (e.key === "ArrowRight" && !isInput) {
        e.preventDefault();
        handleNextFicha();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFicha, activeIndex, filteredItems]);

  const handleSaveActiveFicha = async () => {
    if (!activeFicha) return;
    setIsSaving(true);
    try {
      const finalName = activeName.trim() || activeFicha.name;
      const finalAlt = activeAlt.trim();

      await updateMediaItem(activeFicha.id, {
        name: finalName,
        alt: finalAlt,
      });

      const updated = {
        ...activeFicha,
        name: finalName,
        alt: finalAlt,
        updatedAt: new Date().toISOString(),
      };

      setActiveFicha(updated);
      setItems((prev) => prev.map((i) => (i.id === activeFicha.id ? updated : i)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2200);
    } catch (err) {
      console.error("Error guardando ficha:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteActiveFicha = async () => {
    if (!activeFicha) return;
    const confirm = window.confirm(
      `¿Estás seguro de eliminar "${activeFicha.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirm) return;

    try {
      await deleteMediaItem(activeFicha.id, activeFicha.url);
      const remaining = items.filter((i) => i.id !== activeFicha.id);
      setItems(remaining);
      if (remaining.length > 0) {
        const nextIdx = Math.min(activeIndex, remaining.length - 1);
        openFicha(remaining[nextIdx]);
      } else {
        setActiveFicha(null);
      }
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    setIsDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "imagen.webp";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "imagen.webp";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "WebP";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-[96%] sm:w-[97%] mx-auto space-y-5 sm:space-y-7 animate-fadeIn">
      {/* 1. Header & Summary Banner */}
      <div className="bg-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center shadow-xs flex-shrink-0 mt-0.5">
            <ImageIcon size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg sm:text-xl font-black text-gray-900 uppercase tracking-wider leading-tight">
                Biblioteca Multimedia
              </h2>
              <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FC7D00]/10 text-[#FC7D00] border border-[#FC7D00]/20 whitespace-nowrap">
                {items.length} imágenes
              </span>
            </div>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Hacé clic en cualquier imagen para abrir su <strong>Ficha de edición</strong>, previsualizar en grande y navegar con flechas.
            </p>
          </div>
        </div>

        {/* Stats badges & Upload */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <div className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <span className="text-gray-400 uppercase text-[9px] font-bold block tracking-wider">
              Total Archivos
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-900 font-mono">
              {items.length} imágenes
            </span>
          </div>

          <div className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-emerald-600 uppercase text-[9px] font-bold block tracking-wider flex items-center space-x-1">
              <Sparkles size={11} />
              <span>Optimización</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-800 font-mono">
              100% WebP
            </span>
          </div>

          <label className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-xl sm:rounded-2xl cursor-pointer transition-all shadow-md">
            <UploadCloud size={16} />
            <span>Subir Imágenes</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              disabled={isUploading}
              className="hidden"
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
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(20); }}
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
            onChange={(e) => { setSortBy(e.target.value as any); setVisibleCount(20); }}
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
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-medium">
            <span>
              Mostrando {Math.min(visibleCount, filteredItems.length)} de {filteredItems.length} {filteredItems.length !== items.length ? `(filtradas de ${items.length} totales)` : "imágenes"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {visibleItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openFicha(item)}
              className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group cursor-pointer hover:-translate-y-0.5"
            >
              {/* Image Preview Area */}
              <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-2 border-b border-gray-100">
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

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/95 text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5">
                    <Pencil size={12} className="text-[#FC7D00]" />
                    <span>Abrir Ficha de Edición</span>
                  </span>
                </div>
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
                <div
                  className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center space-x-1">
                    {/* Open Ficha directly */}
                    <button
                      onClick={() => openFicha(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                      title="Abrir ficha y editar"
                    >
                      <Pencil size={14} />
                    </button>

                    {/* Copy URL */}
                    <button
                      onClick={() => handleCopyUrl(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                      title="Copiar enlace"
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
                    onClick={() => {
                      openFicha(item);
                      setTimeout(() => handleDeleteActiveFicha(), 100);
                    }}
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

        {/* Load More Button: Cargar 20 más */}
        {visibleCount < filteredItems.length && (
          <div className="pt-4 pb-2 text-center flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 20)}
              className="px-8 py-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#FC7D00] text-gray-800 hover:text-[#FC7D00] text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>Cargar 20 más</span>
              <span className="text-gray-400 group-hover:text-[#FC7D00] text-[11px] font-normal font-mono">
                (Quedan {filteredItems.length - visibleCount})
              </span>
            </button>
            <p className="text-[11px] text-gray-400 font-mono">
              Mostrando {visibleCount} de {filteredItems.length} imágenes (Total: {items.length})
            </p>
          </div>
        )}
      </div>
      )}

      {/* 5. FICHA DE LA IMAGEN: SPLIT MODAL (Izquierda: Foto Grande con Flechas | Derecha: Campos Editables y Guardar) */}
      {activeFicha && (
        <div
          onClick={() => setActiveFicha(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-fadeIn select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col lg:flex-row"
          >
            {/* LADO IZQUIERDO: IMAGEN EN GRANDE CON FLECHAS */}
            <div className="lg:w-7/12 xl:w-2/3 bg-[#111113] relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-800">
              {/* Top bar on image side */}
              <div className="p-4 px-6 flex items-center justify-between text-white/80 z-20 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white px-3 py-1 rounded-full">
                    {activeIndex + 1} de {filteredItems.length}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    WEBP
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                    {activeFicha.width && activeFicha.height ? `${activeFicha.width}×${activeFicha.height}px · ` : ""}
                    {formatFileSize(activeFicha.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownload(activeFicha.url, activeFicha.name)}
                    disabled={isDownloading}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all hover:scale-105"
                    title="Descargar archivo .webp"
                  >
                    <Download size={14} />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>

              {/* Center Viewport: Image + Nav Arrows */}
              <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[300px]">
                {/* Prev Arrow */}
                {filteredItems.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevFicha}
                    className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-20 cursor-pointer border border-white/20"
                    title="Imagen anterior (Flecha Izquierda ←)"
                  >
                    <ChevronLeft size={26} />
                  </button>
                )}

                {/* Main Large Image */}
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={activeFicha.url}
                    alt={activeAlt || activeName}
                    className="max-h-[48vh] lg:max-h-[66vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
                  />
                </div>

                {/* Next Arrow */}
                {filteredItems.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextFicha}
                    className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 hover:bg-white text-white hover:text-black flex items-center justify-center shadow-2xl transition-all hover:scale-110 z-20 cursor-pointer border border-white/20"
                    title="Imagen siguiente (Flecha Derecha →)"
                  >
                    <ChevronRight size={26} />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {filteredItems.length > 1 && (
                <div className="p-3 px-6 bg-black/70 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
                  {filteredItems.map((thumb) => {
                    const isCur = thumb.id === activeFicha.id;
                    return (
                      <button
                        key={thumb.id}
                        type="button"
                        onClick={() => openFicha(thumb)}
                        className={`w-11 h-11 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                          isCur
                            ? "border-[#FC7D00] scale-105 shadow-md opacity-100 ring-2 ring-[#FC7D00]/50"
                            : "border-transparent opacity-40 hover:opacity-90"
                        }`}
                        title={thumb.name}
                      >
                        <img src={thumb.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LADO DERECHO: FICHA TÉCNICA Y CAMPOS DE EDICIÓN */}
            <div className="lg:w-5/12 xl:w-1/3 bg-white flex flex-col justify-between h-full overflow-hidden">
              {/* Header */}
              <div className="p-5 px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center">
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Ficha del Archivo
                    </h3>
                    <p className="text-[10px] text-gray-400 font-light">
                      Editá el nombre y el texto alternativo SEO.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveFicha(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Cerrar (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form & Metadata Body (Scrollable) */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto">
                {/* Campo: Nombre del archivo */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Nombre del Archivo *
                  </label>
                  <input
                    type="text"
                    value={activeName}
                    onChange={(e) => setActiveName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs font-mono font-medium outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="ejemplo-mueble.webp"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Recomendado: Usar guiones y extensión .webp
                  </p>
                </div>

                {/* Campo: Texto Alternativo Alt */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Texto Alternativo (Alt SEO)
                  </label>
                  <textarea
                    rows={3}
                    value={activeAlt}
                    onChange={(e) => setActiveAlt(e.target.value)}
                    placeholder="Describí el mueble con palabras clave: ej. Mesa ratona redonda de petiribí macizo estilo nórdico Acasa"
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs font-medium outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 transition-all leading-relaxed bg-gray-50/50 focus:bg-white"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Esencial para posicionar en Google Imágenes y brindar accesibilidad a lectores de pantalla.
                  </p>
                </div>

                {/* Metadata Box */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block pb-1 border-b border-gray-200/60">
                    Información Técnica
                  </span>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Formato</span>
                      <span className="font-bold text-gray-800 uppercase font-mono">WEBP</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Peso</span>
                      <span className="font-bold text-gray-800 font-mono">
                        {formatFileSize(activeFicha.sizeBytes)}
                      </span>
                    </div>
                    {activeFicha.width && activeFicha.height && (
                      <div>
                        <span className="text-gray-400 block text-[10px]">Dimensiones</span>
                        <span className="font-bold text-gray-800 font-mono">
                          {activeFicha.width} × {activeFicha.height} px
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block text-[10px]">Fecha</span>
                      <span className="font-medium text-gray-800">
                        {new Date(activeFicha.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* URL Copy box */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Enlace Directo (URL)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      readOnly
                      value={activeFicha.url}
                      className="flex-1 p-2.5 rounded-xl border border-gray-200 text-[11px] font-mono bg-gray-50 text-gray-600 outline-none select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(activeFicha)}
                      className="p-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center space-x-1"
                      title="Copiar enlace"
                    >
                      {copiedId === activeFicha.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                    <a
                      href={activeFicha.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      title="Abrir en pestaña nueva"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(activeFicha.url, activeFicha.name)}
                      className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      title="Descargar archivo en tu equipo"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-5 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleDeleteActiveFicha}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                    title="Eliminar imagen permanentemente"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(activeFicha.url, activeFicha.name)}
                    disabled={isDownloading}
                    className="p-2.5 px-3.5 text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-semibold"
                    title="Descargar imagen en tu equipo"
                  >
                    <Download size={15} />
                    <span>Descargar</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveActiveFicha}
                  disabled={isSaving}
                  className="flex-1 max-w-[200px] py-3 px-5 rounded-xl bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : saveSuccess ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{saveSuccess ? "¡Guardado!" : "Guardar Cambios"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
