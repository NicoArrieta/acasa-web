"use client";

import React, { useState, useEffect } from "react";
import { GlobalAttribute, AttributeTerm, Product } from "@/lib/types";
import { getStoredAttributes, saveStoredAttributes, getStoredProducts } from "@/lib/store";
import {
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Tag,
  Search,
  Sparkles,
  Layers,
  Palette,
  Hash,
} from "lucide-react";

export default function AttributesManagerView() {
  const [attributes, setAttributes] = useState<GlobalAttribute[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  // Edit / Create Modal State
  const [editingAttr, setEditingAttr] = useState<Partial<GlobalAttribute> | null>(null);
  const [newTermName, setNewTermName] = useState("");
  const [newTermColor, setNewTermColor] = useState("#FC7D00");

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("attributes_updated", handleUpdate);
    window.addEventListener("products_updated", handleUpdate);
    return () => {
      window.removeEventListener("attributes_updated", handleUpdate);
      window.removeEventListener("products_updated", handleUpdate);
    };
  }, []);

  const loadData = () => {
    setAttributes(getStoredAttributes());
    setProducts(getStoredProducts());
  };

  // Helper: Count products using this attribute
  const getProductCountForAttribute = (attrName: string) => {
    return products.filter((p) =>
      p.attributes?.some((a) => a.name.toLowerCase() === attrName.toLowerCase()) ||
      p.variations?.some((v) => v.name.toLowerCase() === attrName.toLowerCase())
    ).length;
  };

  const handleStartCreate = () => {
    setEditingAttr({
      id: `attr_${Date.now()}`,
      name: "",
      slug: "",
      terms: [],
    });
    setNewTermName("");
    setNewTermColor("#FC7D00");
  };

  const handleStartEdit = (attr: GlobalAttribute) => {
    setEditingAttr({
      ...attr,
      terms: attr.terms ? [...attr.terms] : [],
    });
    setNewTermName("");
    setNewTermColor("#FC7D00");
  };

  const handleAddTerm = () => {
    if (!newTermName.trim() || !editingAttr) return;
    const cleanName = newTermName.trim();
    const cleanSlug = cleanName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const currentTerms = editingAttr.terms || [];
    if (currentTerms.some((t) => t.slug === cleanSlug)) {
      alert("Ya existe un término con este identificador en este atributo.");
      return;
    }

    const newTerm: AttributeTerm = {
      id: `term_${Date.now()}`,
      name: cleanName,
      slug: cleanSlug,
      colorHex: editingAttr.slug?.includes("color") || editingAttr.name?.toLowerCase().includes("color")
        ? newTermColor
        : undefined,
    };

    setEditingAttr({
      ...editingAttr,
      terms: [...currentTerms, newTerm],
    });
    setNewTermName("");
  };

  const handleRemoveTerm = (termSlug: string) => {
    if (!editingAttr || !editingAttr.terms) return;
    setEditingAttr({
      ...editingAttr,
      terms: editingAttr.terms.filter((t) => t.slug !== termSlug),
    });
  };

  const handleSaveAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAttr || !editingAttr.name?.trim()) return;

    const name = editingAttr.name.trim();
    let slug = editingAttr.slug?.trim();
    if (!slug) {
      slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const finalAttr: GlobalAttribute = {
      id: editingAttr.id || `attr_${Date.now()}`,
      name,
      slug,
      terms: editingAttr.terms || [],
    };

    const existsIndex = attributes.findIndex((a) => a.slug === finalAttr.slug || a.id === finalAttr.id);
    let updated: GlobalAttribute[];
    if (existsIndex >= 0) {
      updated = [...attributes];
      updated[existsIndex] = finalAttr;
    } else {
      updated = [...attributes, finalAttr];
    }

    saveStoredAttributes(updated);
    setAttributes(updated);
    setEditingAttr(null);
  };

  const handleDeleteAttribute = (attr: GlobalAttribute) => {
    const count = getProductCountForAttribute(attr.name);
    const confirm = window.confirm(
      `¿Estás seguro de eliminar el atributo "${attr.name}"? ${
        count > 0 ? `Está siendo utilizado en ${count} producto(s).` : ""
      }`
    );
    if (!confirm) return;

    const filtered = attributes.filter((a) => a.slug !== attr.slug && a.id !== attr.id);
    saveStoredAttributes(filtered);
    setAttributes(filtered);
  };

  const filteredAttributes = attributes.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      a.terms?.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  const isColorAttr =
    editingAttr?.name?.toLowerCase().includes("color") ||
    editingAttr?.slug?.toLowerCase().includes("color");

  return (
    <div className="w-[96%] sm:w-[97%] mx-auto space-y-4 animate-fadeIn">
      {/* Modal Dialog: Create / Edit Attribute & Terms */}
      {editingAttr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingAttr(null);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100 animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FC7D00]/10 text-[#FC7D00] flex items-center justify-center font-bold">
                  <SlidersHorizontal size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
                    {editingAttr.id && attributes.some((a) => a.id === editingAttr.id)
                      ? `Configurar Atributo: ${editingAttr.name || ""}`
                      : "Crear Nuevo Atributo Global"}
                  </h3>
                  <p className="text-xs text-gray-400 font-light">
                    Ingresá el nombre del atributo y gestioná todos sus términos o valores disponibles.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingAttr(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveAttribute} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
                {/* Attribute Main Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Nombre del Atributo *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAttr.name || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoSlug = val
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "");
                        setEditingAttr({
                          ...editingAttr,
                          name: val,
                          slug: editingAttr.slug ? editingAttr.slug : autoSlug,
                        });
                      }}
                      placeholder="Ej: Madera, Tapizado, Medida, Color..."
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 bg-gray-50/40 focus:bg-white"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Identificador (Slug) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingAttr.slug || ""}
                      onChange={(e) =>
                        setEditingAttr({
                          ...editingAttr,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "-"),
                        })
                      }
                      placeholder="ej: madera, tapizado"
                      className="w-full p-3.5 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-[#FC7D00] focus:ring-2 focus:ring-[#FC7D00]/10 bg-gray-50/40 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Terms / Values Management */}
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Valores / Términos de este Atributo
                      </h4>
                      <p className="text-[11px] text-gray-500 font-light mt-0.5">
                        Agregá los valores que pueden elegirse en los productos (ej: Paraíso, Petiribí, 1.80m, Lino Gris).
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white border text-gray-700">
                      {editingAttr.terms?.length || 0} valores
                    </span>
                  </div>

                  {/* Add Term input row */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTermName}
                      onChange={(e) => setNewTermName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTerm();
                        }
                      }}
                      placeholder="Escribí un valor: ej. Paraíso Natural, Lino Crudo, 1.80 x 0.90 m..."
                      className="flex-1 p-3 rounded-xl border border-gray-200 text-xs outline-none bg-white focus:border-[#FC7D00]"
                    />

                    {isColorAttr && (
                      <div className="flex items-center space-x-1.5 bg-white border border-gray-200 p-2 rounded-xl">
                        <Palette size={14} className="text-gray-400" />
                        <input
                          type="color"
                          value={newTermColor}
                          onChange={(e) => setNewTermColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          title="Color de muestra"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddTerm}
                      className="px-4 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Agregar</span>
                    </button>
                  </div>

                  {/* List of Terms */}
                  {editingAttr.terms && editingAttr.terms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {editingAttr.terms.map((term) => (
                        <div
                          key={term.slug}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200/80 text-xs shadow-2xs group"
                        >
                          <div className="flex items-center space-x-2.5">
                            {term.colorHex && (
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs flex-shrink-0"
                                style={{ backgroundColor: term.colorHex }}
                              />
                            )}
                            <div>
                              <span className="font-semibold text-gray-800">{term.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                /{term.slug}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTerm(term.slug)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Quitar valor"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic py-3 text-center">
                      No hay valores agregados aún. Escribí uno arriba y hacé clic en "Agregar".
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Sticky Footer */}
              <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50/60">
                <button
                  type="button"
                  onClick={() => setEditingAttr(null)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Guardar Atributo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attributes Grid & Toolbar */}
      <div className="space-y-4">
        {/* Toolbar with New Attribute & Search */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={handleStartCreate}
            className="w-full sm:w-auto justify-center flex items-center space-x-2 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-5 rounded-xl shadow-sm transition-all cursor-pointer flex-shrink-0"
          >
            <Plus size={16} />
            <span>Nuevo Atributo</span>
          </button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar atributo o término..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#FC7D00] outline-none"
            />
          </div>

          <div className="text-xs text-gray-400 font-medium hidden md:block">
            {filteredAttributes.length} atributos
          </div>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAttributes.map((attr) => {
            const productCount = getProductCountForAttribute(attr.name);

            return (
              <div
                key={attr.id || attr.slug}
                className="bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 group-hover:bg-[#FC7D00]/10 group-hover:text-[#FC7D00] group-hover:border-[#FC7D00]/20 transition-colors">
                        <Tag size={18} />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-gray-900 tracking-wide">
                          {attr.name}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono">
                          /{attr.slug}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {productCount} producto{productCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  {/* Terms Chips */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Términos configurados ({attr.terms?.length || 0}):
                    </span>

                    {attr.terms && attr.terms.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {attr.terms.map((term) => (
                          <span
                            key={term.slug}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-700 flex items-center space-x-1.5"
                          >
                            {term.colorHex && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                                style={{ backgroundColor: term.colorHex }}
                              />
                            )}
                            <span>{term.name}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        Sin términos aún. Hacé clic en configurar para añadir.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {attr.id?.substring(0, 10)}...
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(attr)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-gray-300 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Pencil size={13} className="text-[#FC7D00]" />
                      <span>Configurar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAttribute(attr)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Eliminar atributo"
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
    </div>
  );
}
