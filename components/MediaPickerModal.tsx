"use client";

import React, { useState, useEffect } from "react";
import { MediaItem } from "@/lib/types";
import { getMediaLibrary, uploadMediaItem } from "@/lib/media";
import {
  X,
  Search,
  UploadCloud,
  Check,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImages: (urls: string[]) => void;
  selectedUrls?: string[];
  multiple?: boolean;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelectImages,
  selectedUrls = [],
  multiple = true,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelected([]);
      loadMedia();
    }
  }, [isOpen]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const addedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Convirtiendo a WebP (${i + 1}/${files.length}): ${file.name}...`);
      try {
        const item = await uploadMediaItem(file);
        addedUrls.push(item.url);
      } catch (err) {
        console.error("Error subiendo:", err);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    await loadMedia();

    if (multiple) {
      setSelected((prev) => [...prev, ...addedUrls]);
    } else if (addedUrls.length > 0) {
      onSelectImages([addedUrls[0]]);
      onClose();
    }
  };

  const toggleSelect = (url: string) => {
    if (!multiple) {
      setSelected([url]);
      return;
    }
    if (selected.includes(url)) {
      setSelected(selected.filter((u) => u !== url));
    } else {
      setSelected([...selected, url]);
    }
  };

  const handleConfirm = () => {
    onSelectImages(selected);
    onClose();
  };

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.alt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center">
              <ImageIcon size={22} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-900 uppercase tracking-wide">
                Biblioteca Multimedia
              </h3>
              <p className="text-xs text-gray-500 font-light">
                Seleccioná imágenes para el carrusel del producto o subí nuevas con auto-conversión a WebP.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: Search & Quick Upload */}
        <div className="p-4 px-6 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o texto alt..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#FC7D00] outline-none"
            />
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-all shadow-sm">
              <UploadCloud size={16} />
              <span>Subir Foto (Auto WebP)</span>
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Upload status banner if active */}
        {isUploading && (
          <div className="bg-[#FC7D00]/10 border-b border-[#FC7D00]/20 px-6 py-2.5 flex items-center space-x-3 text-xs text-[#FC7D00] font-bold animate-pulse">
            <Loader2 className="animate-spin" size={16} />
            <span>{uploadProgress || "Procesando imágenes a WebP..."}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <Loader2 className="animate-spin text-[#FC7D00]" size={32} />
              <p className="text-xs font-medium">Cargando biblioteca...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gray-100 text-gray-400 flex items-center justify-center">
                <ImageIcon size={30} />
              </div>
              <h4 className="font-heading font-bold text-gray-800 text-sm uppercase tracking-wider">
                No hay imágenes encontradas
              </h4>
              <p className="text-xs text-gray-500 max-w-sm font-light">
                No se encontraron imágenes que coincidan con la búsqueda. Podés subir una imagen nueva desde el botón superior.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selected.includes(item.url);
                const isAlreadyInProduct = selectedUrls.includes(item.url);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.url)}
                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group bg-white shadow-xs ${
                      isSelected
                        ? "border-[#FC7D00] ring-4 ring-[#FC7D00]/20 scale-[0.98]"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt || item.name}
                      className="w-full h-full object-cover"
                    />

                    {/* WebP badge */}
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-[9px] font-bold uppercase text-white px-1.5 py-0.5 rounded-md">
                      WEBP
                    </span>

                    {/* Selection Checkmark */}
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#FC7D00] text-white shadow-md scale-110"
                          : "bg-white/80 text-transparent group-hover:text-gray-400"
                      }`}
                    >
                      <Check size={14} className={isSelected ? "text-white stroke-[3]" : ""} />
                    </div>

                    {/* Already in product pill */}
                    {isAlreadyInProduct && !isSelected && (
                      <span className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold text-center py-0.5 rounded-md">
                        Ya en carrusel
                      </span>
                    )}

                    {/* Hover Title */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[10px] font-semibold truncate">{item.name}</p>
                      {item.alt && <p className="text-[9px] text-gray-300 truncate font-light">Alt: {item.alt}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Selection info and Actions */}
        <div className="p-5 px-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <div className="text-xs text-gray-600">
            {selected.length > 0 ? (
              <span className="font-bold text-gray-900">
                {selected.length} imagen{selected.length > 1 ? "es" : ""} seleccionada{selected.length > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="text-gray-400">Hacé clic en una o más imágenes para seleccionarlas</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm ${
                selected.length > 0
                  ? "bg-[#FC7D00] hover:bg-[#e57000] text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check size={16} />
              <span>Insertar en el Carrusel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
