"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Category, Product } from "@/lib/types";
import { getStoredCategories, saveStoredCategories, getStoredProducts } from "@/lib/store";
import MediaPickerModal from "@/components/MediaPickerModal";
import { uploadMediaItem } from "@/lib/media";
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Layers,
  UploadCloud,
  Images,
  Package,
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function CategoriesManagerView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // Edit / Create Category Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("categories_updated", handleUpdate);
    window.addEventListener("products_updated", handleUpdate);
    return () => {
      window.removeEventListener("categories_updated", handleUpdate);
      window.removeEventListener("products_updated", handleUpdate);
    };
  }, []);

  const loadData = () => {
    setCategories(getStoredCategories());
    setProducts(getStoredProducts());
  };

  // Helper: Count products associated with a category
  const getProductCountForCategory = (catSlug: string) => {
    return products.filter(
      (p) => p.category === catSlug || (p.categories && p.categories.includes(catSlug))
    ).length;
  };

  // Helper: Count products associated with a specific subcategory
  const getProductCountForSubcategory = (subcatSlug: string) => {
    return products.filter(
      (p) =>
        p.subcategory === subcatSlug || (p.subcategories && p.subcategories.includes(subcatSlug))
    ).length;
  };

  const handleStartCreate = () => {
    setEditingCategory({
      id: `cat_${Date.now()}`,
      name: "",
      slug: "",
      image: "",
      subcategories: [],
    });
    setNewSubcategoryName("");
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory({
      ...cat,
      subcategories: cat.subcategories ? [...cat.subcategories] : [],
    });
    setNewSubcategoryName("");
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryName.trim() || !editingCategory) return;
    const cleanName = newSubcategoryName.trim();
    const cleanSlug = cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const currentSubs = editingCategory.subcategories || [];
    if (currentSubs.some((s) => s.slug === cleanSlug)) {
      alert("Ya existe una subcategoría con este identificador.");
      return;
    }

    setEditingCategory({
      ...editingCategory,
      subcategories: [...currentSubs, { name: cleanName, slug: cleanSlug }],
    });
    setNewSubcategoryName("");
  };

  const handleRemoveSubcategory = (subSlug: string) => {
    if (!editingCategory || !editingCategory.subcategories) return;
    setEditingCategory({
      ...editingCategory,
      subcategories: editingCategory.subcategories.filter((s) => s.slug !== subSlug),
    });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingCategory) return;
    setIsUploading(true);
    try {
      const item = await uploadMediaItem(files[0]);
      setEditingCategory({
        ...editingCategory,
        image: item.url,
      });
    } catch (err) {
      console.error("Error subiendo imagen de categoría:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name?.trim()) return;

    const name = editingCategory.name.trim();
    let slug = editingCategory.slug?.trim();
    if (!slug) {
      slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const finalCat: Category = {
      id: editingCategory.id || `cat_${Date.now()}`,
      name: name.toUpperCase(),
      slug,
      image: editingCategory.image || "",
      subcategories: editingCategory.subcategories || [],
    };

    const existsIndex = categories.findIndex((c) => c.slug === finalCat.slug || c.id === finalCat.id);
    let updated: Category[];
    if (existsIndex >= 0) {
      updated = [...categories];
      updated[existsIndex] = finalCat;
    } else {
      updated = [...categories, finalCat];
    }

    saveStoredCategories(updated);
    setCategories(updated);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: Category) => {
    const count = getProductCountForCategory(cat.slug);
    const confirm = window.confirm(
      `¿Estás seguro de eliminar la categoría "${cat.name}"? Contiene ${count} producto(s) asociado(s).`
    );
    if (!confirm) return;

    const filtered = categories.filter((c) => c.slug !== cat.slug && c.id !== cat.id);
    saveStoredCategories(filtered);
    setCategories(filtered);
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      c.subcategories?.some((s) => s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-[96%] sm:w-[97%] mx-auto space-y-5 sm:space-y-7 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center shadow-xs flex-shrink-0">
            <FolderTree size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading text-lg sm:text-xl font-black text-gray-900 uppercase tracking-wider leading-tight">
                Gestión de Categorías
              </h2>
              <span className="text-[11px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FC7D00]/10 text-[#FC7D00] border border-[#FC7D00]/20 whitespace-nowrap">
                {categories.length} categorías
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartCreate}
          className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl shadow-md transition-all cursor-pointer flex-shrink-0"
        >
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* 2. Modal Dialog: Create / Edit Category */}
      {editingCategory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCategory(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center font-bold">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                    {editingCategory.id && categories.some((c) => c.id === editingCategory.id)
                      ? `Editar Categoría: ${editingCategory.name || ""}`
                      : "Crear Nueva Categoría"}
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Configurá el nombre, la imagen destacada y agregá sus subcategorías.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveCategory} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Name, Slug & Subcategories (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Nombre de la Categoría *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCategory.name || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const autoSlug = val
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            setEditingCategory({
                              ...editingCategory,
                              name: val,
                              slug: editingCategory.slug ? editingCategory.slug : autoSlug,
                            });
                          }}
                          placeholder="Ej: DORMITORIO, LIVING, COMEDOR..."
                          className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-semibold uppercase outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 bg-gray-50/40 focus:bg-white"
                        />
                      </div>

                      {/* Category Slug */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Identificador URL (Slug) *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingCategory.slug || ""}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-"),
                            })
                          }
                          placeholder="ej: dormitorio"
                          className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 bg-gray-50/40 focus:bg-white"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">
                          URL: /categoria/{editingCategory.slug || "..."}
                        </p>
                      </div>
                    </div>

                    {/* Subcategories Management */}
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                            Subcategorías de esta Categoría
                          </h4>
                          <p className="text-[11px] text-gray-500 font-light mt-0.5">
                            Agregá todas las subcategorías que correspondan (ej: camas, respaldos, botineros).
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border text-gray-700">
                          {editingCategory.subcategories?.length || 0}
                        </span>
                      </div>

                      {/* Add Subcategory input row */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubcategory();
                            }
                          }}
                          placeholder="Escribí el nombre: ej. Mesas de Luz, Sillones..."
                          className="flex-1 p-3 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-[#FC7D00]"
                        />
                        <button
                          type="button"
                          onClick={handleAddSubcategory}
                          className="px-4 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Agregar</span>
                        </button>
                      </div>

                      {/* List of Subcategories */}
                      {editingCategory.subcategories && editingCategory.subcategories.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          {editingCategory.subcategories.map((sub) => (
                            <div
                              key={sub.slug}
                              className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200/80 text-xs shadow-2xs group"
                            >
                              <div>
                                <span className="font-semibold text-gray-800">{sub.name}</span>
                                <span className="text-[10px] text-gray-400 font-mono block">
                                  /{sub.slug}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubcategory(sub.slug)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Quitar subcategoría"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic py-2 text-center">
                          No hay subcategorías añadidas aún. Podés agregar una arriba.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Featured Image (5 cols) */}
                  <div className="lg:col-span-5 space-y-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Fotografía Destacada de la Categoría
                    </label>

                    {/* Image Preview Box */}
                    <div className="aspect-[4/3] rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative flex items-center justify-center group p-2">
                      {editingCategory.image ? (
                        <img
                          src={editingCategory.image}
                          alt={editingCategory.name || "Categoría"}
                          className="w-full h-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-6 text-gray-400 space-y-2">
                          <ImageIcon className="w-10 h-10 mx-auto opacity-40 text-[#FC7D00]" />
                          <span className="text-xs font-medium block">Sin imagen asignada</span>
                          <span className="text-[10px] text-gray-400">
                            Seleccioná de la biblioteca o subí una foto
                          </span>
                        </div>
                      )}

                      {editingCategory.image && (
                        <span className="absolute top-3 left-3 bg-[#FC7D00] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shadow-xs">
                          Destacada
                        </span>
                      )}
                    </div>

                    {/* Image Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Images size={15} className="text-[#FC7D00]" />
                        <span>Desde Biblioteca</span>
                      </button>

                      <label className="p-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs">
                        <UploadCloud size={15} />
                        <span>{isUploading ? "Subiendo..." : "Subir (Auto WebP)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadImage}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>

                    {/* Direct URL input */}
                    <div>
                      <input
                        type="text"
                        value={editingCategory.image || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, image: e.target.value })}
                        placeholder="O pegar URL directa de imagen..."
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-[11px] font-mono bg-gray-50/50 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Guardar Categoría</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Categories List (Grid View) */}
      <div className="space-y-4">
        {/* Search Toolbar */}
        <div className="bg-white p-4 px-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categoría o subcategoría..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#FC7D00] outline-none"
            />
          </div>

          <div className="text-xs text-gray-400 font-medium">
            Mostrando {filteredCategories.length} categorías registradas
          </div>
        </div>

        {/* Categories Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const productCount = getProductCountForCategory(cat.slug);

            return (
              <div
                key={cat.id || cat.slug}
                className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header with Image & Badges */}
                  <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden flex items-center justify-center p-3 border-b border-gray-100">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center space-y-1">
                        <ImageIcon size={32} />
                        <span className="text-[10px]">Sin foto</span>
                      </div>
                    )}

                    {/* Products Count Badge */}
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center space-x-1.5 font-mono">
                      <Package size={13} className="text-[#FC7D00]" />
                      <span>{productCount} producto{productCount === 1 ? "" : "s"}</span>
                    </div>

                    <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-gray-900 text-[10px] font-mono px-2.5 py-0.5 rounded-md font-semibold">
                      /{cat.slug}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-black text-lg text-gray-900 tracking-wide">
                        {cat.name}
                      </h3>
                      <Link
                        href={`/categoria/${cat.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
                        title="Ver página de la categoría en la web"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>

                    {/* Subcategories Chips */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Subcategorías ({cat.subcategories?.length || 0}):
                      </span>

                      {cat.subcategories && cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subcategories.map((sub) => {
                            const subCount = getProductCountForSubcategory(sub.slug);
                            return (
                              <span
                                key={sub.slug}
                                className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700 flex items-center space-x-1"
                              >
                                <span>{sub.name}</span>
                                {subCount > 0 && (
                                  <span className="text-[9px] font-bold text-gray-400 font-mono bg-white px-1 rounded">
                                    {subCount}
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Sin subcategorías específicas
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {cat.id?.substring(0, 10)}...
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Pencil size={13} className="text-[#FC7D00]" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Picker Modal for Category Image */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        multiple={false}
        onSelectImages={(urls) => {
          if (urls.length > 0 && editingCategory) {
            setEditingCategory({
              ...editingCategory,
              image: urls[0],
            });
          }
        }}
      />
    </div>
  );
}
