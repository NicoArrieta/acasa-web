"use client";

import React, { useState } from "react";
import {
  GlobalAttribute,
  ProductAttributeSelection,
  ProductVariationItem,
} from "@/lib/types";
import MediaPickerModal from "@/components/MediaPickerModal";
import { uploadMediaItem } from "@/lib/media";
import { formatCurrency, saveStoredAttributes, getStoredAttributes } from "@/lib/store";
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Zap,
  Sparkles,
  Check,
  UploadCloud,
  Images,
  DollarSign,
  Package,
  Layers,
  Tag,
  AlertCircle,
  ArrowRight,
  Eye,
  Info,
} from "lucide-react";

interface ProductVariationsManagerProps {
  productType: "simple" | "variable";
  onChangeProductType: (type: "simple" | "variable") => void;
  attributes: ProductAttributeSelection[];
  onChangeAttributes: (attributes: ProductAttributeSelection[]) => void;
  variations: ProductVariationItem[];
  onChangeVariations: (variations: ProductVariationItem[]) => void;
  availableGlobalAttributes: GlobalAttribute[];
  baseProductPrice?: number;
  baseProductSku?: string;
  defaultImages?: string[];
}

export default function ProductVariationsManager({
  productType,
  onChangeProductType,
  attributes,
  onChangeAttributes,
  variations,
  onChangeVariations,
  availableGlobalAttributes,
  baseProductPrice = 0,
  baseProductSku = "",
  defaultImages = [],
}: ProductVariationsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"attributes" | "variations">(
    variations.length > 0 ? "variations" : "attributes"
  );
  const [selectedGlobalAttrId, setSelectedGlobalAttrId] = useState<string>("");
  const [expandedVariationId, setExpandedVariationId] = useState<string | null>(null);

  // Quick inline term adder per attribute
  const [newTermInputs, setNewTermInputs] = useState<Record<string, string>>({});

  // Bulk actions state
  const [bulkPriceInput, setBulkPriceInput] = useState<string>("");
  const [bulkStockInput, setBulkStockInput] = useState<string>("");

  // Media Picker state for variations
  const [mediaPickerVarIndex, setMediaPickerVarIndex] = useState<number | null>(null);
  const [isUploadingVarImage, setIsUploadingVarImage] = useState<number | null>(null);

  // Custom new attribute on the fly
  const [customAttrName, setCustomAttrName] = useState("");

  // --- ATTRIBUTE HANDLERS ---
  const handleAddGlobalAttribute = () => {
    if (!selectedGlobalAttrId) return;
    const globalAttr = availableGlobalAttributes.find((a) => a.id === selectedGlobalAttrId);
    if (!globalAttr) return;

    if (attributes.some((a) => a.name.toLowerCase() === globalAttr.name.toLowerCase())) {
      alert("Este atributo ya fue añadido a este producto.");
      return;
    }

    const newAttr: ProductAttributeSelection = {
      name: globalAttr.name,
      terms: globalAttr.terms.map((t) => t.name),
      usedForVariations: true,
    };

    onChangeAttributes([...attributes, newAttr]);
    setSelectedGlobalAttrId("");
  };

  const handleAddCustomAttribute = () => {
    if (!customAttrName.trim()) return;
    const clean = customAttrName.trim();
    if (attributes.some((a) => a.name.toLowerCase() === clean.toLowerCase())) {
      alert("Ya existe un atributo con ese nombre en este mueble.");
      return;
    }
    const newAttr: ProductAttributeSelection = {
      name: clean,
      terms: [],
      usedForVariations: true,
    };
    onChangeAttributes([...attributes, newAttr]);
    setCustomAttrName("");
  };

  const handleRemoveAttribute = (idx: number) => {
    const updated = attributes.filter((_, i) => i !== idx);
    onChangeAttributes(updated);
  };

  const handleToggleTerm = (attrIdx: number, termName: string) => {
    const attr = attributes[attrIdx];
    const terms = attr.terms.includes(termName)
      ? attr.terms.filter((t) => t !== termName)
      : [...attr.terms, termName];
    const updated = [...attributes];
    updated[attrIdx] = { ...attr, terms };
    onChangeAttributes(updated);
  };

  const handleSelectAllTerms = (attrIdx: number) => {
    const attr = attributes[attrIdx];
    const globalAttr = availableGlobalAttributes.find(
      (g) => g.name.toLowerCase() === attr.name.toLowerCase()
    );
    if (!globalAttr) return;
    const updated = [...attributes];
    updated[attrIdx] = {
      ...attr,
      terms: globalAttr.terms.map((t) => t.name),
    };
    onChangeAttributes(updated);
  };

  const handleDeselectAllTerms = (attrIdx: number) => {
    const updated = [...attributes];
    updated[attrIdx] = {
      ...attributes[attrIdx],
      terms: [],
    };
    onChangeAttributes(updated);
  };

  const handleAddCustomTermToAttribute = (attrIdx: number) => {
    const attr = attributes[attrIdx];
    const inputVal = (newTermInputs[attr.name] || "").trim();
    if (!inputVal) return;

    if (attr.terms.includes(inputVal)) {
      alert("Ese valor ya está seleccionado en este atributo.");
      return;
    }

    const updated = [...attributes];
    updated[attrIdx] = {
      ...attr,
      terms: [...attr.terms, inputVal],
    };
    onChangeAttributes(updated);
    setNewTermInputs({ ...newTermInputs, [attr.name]: "" });

    // Also persist into global attributes if it matches a global attribute
    const globalAttr = availableGlobalAttributes.find(
      (g) => g.name.toLowerCase() === attr.name.toLowerCase()
    );
    if (globalAttr && !globalAttr.terms.some((t) => t.name.toLowerCase() === inputVal.toLowerCase())) {
      const cleanSlug = inputVal
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const updatedGlobal = availableGlobalAttributes.map((g) =>
        g.id === globalAttr.id
          ? {
              ...g,
              terms: [
                ...g.terms,
                { id: `term_${Date.now()}`, name: inputVal, slug: cleanSlug },
              ],
            }
          : g
      );
      saveStoredAttributes(updatedGlobal);
    }
  };

  // --- VARIATION GENERATOR (Cartesian Product) ---
  const handleGenerateAllVariations = () => {
    const usableAttributes = attributes.filter(
      (a) => a.usedForVariations && a.terms.length > 0
    );

    if (usableAttributes.length === 0) {
      alert(
        "Para generar variaciones, primero añadí atributos y seleccioná al menos un valor en cada uno con la casilla 'Usado para variaciones' activada."
      );
      return;
    }

    // Cartesian product algorithm
    const cartesian = (arr: { name: string; terms: string[] }[]): Record<string, string>[] => {
      return arr.reduce<Record<string, string>[]>(
        (acc, curr) => {
          const res: Record<string, string>[] = [];
          acc.forEach((a) => {
            curr.terms.forEach((term) => {
              res.push({ ...a, [curr.name]: term });
            });
          });
          return res;
        },
        [{}]
      );
    };

    const combinations = cartesian(usableAttributes);

    if (combinations.length > 60) {
      const ok = window.confirm(
        `Se van a generar ${combinations.length} combinaciones de variaciones. ¿Deseás continuar?`
      );
      if (!ok) return;
    }

    const newVariations: ProductVariationItem[] = combinations.map((comb, i) => {
      const existing = variations.find((v) =>
        Object.entries(comb).every(([k, val]) => v.attributes[k] === val)
      );

      if (existing) return existing;

      const shortAttrs = Object.values(comb)
        .map((v) => v.substring(0, 3).toUpperCase())
        .join("-");
      const sku = baseProductSku ? `${baseProductSku}-${shortAttrs}` : `VAR-${i + 1}`;

      return {
        id: `var_${Date.now()}_${i}`,
        sku,
        attributes: comb,
        regularPrice: baseProductPrice || 100000,
        salePrice: undefined,
        stock: 5,
        inStock: true,
        enabled: true,
        image: defaultImages[0] || "",
      };
    });

    onChangeVariations(newVariations);
    setActiveSubTab("variations");
  };

  const handleAddSingleVariation = () => {
    const usableAttributes = attributes.filter((a) => a.usedForVariations && a.terms.length > 0);
    if (usableAttributes.length === 0) {
      alert("Primero añadí atributos con valores en la pestaña Atributos.");
      return;
    }
    const defaultComb: Record<string, string> = {};
    usableAttributes.forEach((a) => {
      defaultComb[a.name] = a.terms[0] || "";
    });

    const newVar: ProductVariationItem = {
      id: `var_${Date.now()}`,
      sku: baseProductSku ? `${baseProductSku}-V${variations.length + 1}` : `VAR-${variations.length + 1}`,
      attributes: defaultComb,
      regularPrice: baseProductPrice || 100000,
      stock: 5,
      inStock: true,
      enabled: true,
      image: defaultImages[0] || "",
    };

    onChangeVariations([...variations, newVar]);
    setExpandedVariationId(newVar.id);
    setActiveSubTab("variations");
  };

  // --- BULK ACTIONS ---
  const handleApplyBulkPrice = () => {
    const priceNum = Number(bulkPriceInput);
    if (!priceNum || priceNum <= 0) return;
    const updated = variations.map((v) => ({
      ...v,
      regularPrice: priceNum,
    }));
    onChangeVariations(updated);
    setBulkPriceInput("");
  };

  const handleApplyBulkStock = () => {
    const stockNum = Number(bulkStockInput);
    if (isNaN(stockNum) || stockNum < 0) return;
    const updated = variations.map((v) => ({
      ...v,
      stock: stockNum,
      inStock: stockNum > 0,
    }));
    onChangeVariations(updated);
    setBulkStockInput("");
  };

  const handleToggleAllStockStatus = () => {
    const allInStock = variations.every((v) => v.inStock);
    const updated = variations.map((v) => ({
      ...v,
      inStock: !allInStock,
    }));
    onChangeVariations(updated);
  };

  // --- INDIVIDUAL VARIATION ACTIONS ---
  const handleUpdateVariation = (index: number, partial: Partial<ProductVariationItem>) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], ...partial };
    onChangeVariations(updated);
  };

  const handleRemoveVariation = (index: number) => {
    const updated = variations.filter((_, i) => i !== index);
    onChangeVariations(updated);
  };

  const handleUploadVariationImage = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingVarImage(index);
    try {
      const item = await uploadMediaItem(files[0]);
      handleUpdateVariation(index, { image: item.url });
    } catch (err) {
      console.error("Error subiendo foto de variación:", err);
    } finally {
      setIsUploadingVarImage(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/90 shadow-md overflow-hidden space-y-0">
      {/* 1. Header & WooCommerce Product Type Selector */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-black text-[#FC7D00] flex items-center justify-center font-bold shadow-xs">
            <SlidersHorizontal size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FC7D00]">
                DATOS DEL PRODUCTO
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 text-gray-600 font-bold">
                ESTILO WOOCOMMERCE
              </span>
            </div>
            <h4 className="font-heading text-base font-bold text-gray-900 uppercase tracking-wide">
              Atributos y Variaciones del Mueble
            </h4>
          </div>
        </div>

        {/* Product Type Toggle (Simple vs Variable) */}
        <div className="flex items-center bg-gray-200/80 p-1.5 rounded-2xl text-xs font-bold self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => onChangeProductType("simple")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all cursor-pointer text-center ${
              productType === "simple"
                ? "bg-white text-gray-900 shadow-sm font-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Producto Simple
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeProductType("variable");
              if (activeSubTab === "variations" && variations.length === 0) {
                setActiveSubTab("attributes");
              }
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              productType === "variable"
                ? "bg-[#FC7D00] text-white shadow-sm font-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Sparkles size={13} />
            <span>Producto Variable</span>
          </button>
        </div>
      </div>

      {productType === "simple" ? (
        <div className="p-8 text-center space-y-3 bg-white">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 text-[#FC7D00] flex items-center justify-center">
            <Info size={22} />
          </div>
          <div>
            <h5 className="font-heading text-sm font-bold text-gray-900 uppercase">
              Producto Simple Seleccionado
            </h5>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
              Un producto simple tiene un único precio regular y un stock general definidos en el panel lateral. Si este mueble viene en distintas <strong>maderas</strong>, <strong>medidas</strong> o <strong>tapizados</strong> con sus propios precios y fotos, activá <strong>Producto Variable</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeProductType("variable")}
            className="px-5 py-2.5 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Cambiar a Producto Variable con combinaciones →
          </button>
        </div>
      ) : (
        <div>
          {/* 2. WooCommerce Navigation Tabs: [ Atributos ] | [ Variaciones ] */}
          <div className="flex border-b border-gray-100 bg-white px-8 pt-4 gap-8">
            <button
              type="button"
              onClick={() => setActiveSubTab("attributes")}
              className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === "attributes"
                  ? "border-[#FC7D00] text-[#FC7D00]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Tag size={16} />
              <span>1. Atributos ({attributes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab("variations")}
              className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                activeSubTab === "variations"
                  ? "border-[#FC7D00] text-[#FC7D00]"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              <Layers size={16} />
              <span>2. Variaciones ({variations.length})</span>
            </button>
          </div>

          {/* TAB 1: ATRIBUTOS (COMO EN WOOCOMMERCE) */}
          {activeSubTab === "attributes" && (
            <div className="p-8 space-y-6">
              {/* Add Attribute Toolbar */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex-1 flex gap-2">
                  <select
                    value={selectedGlobalAttrId}
                    onChange={(e) => setSelectedGlobalAttrId(e.target.value)}
                    className="flex-1 p-3 rounded-xl border border-gray-200 text-xs bg-white font-medium outline-none focus:border-[#FC7D00]"
                  >
                    <option value="">-- Añadir Atributo Global (Madera, Medida, etc.) --</option>
                    {availableGlobalAttributes.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.terms.length} valores configurados)
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddGlobalAttribute}
                    disabled={!selectedGlobalAttrId}
                    className="px-5 py-3 bg-[#FC7D00] hover:bg-[#e66c00] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={15} />
                    <span>Añadir</span>
                  </button>
                </div>

                <div className="hidden sm:block text-gray-300">|</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAttrName}
                    onChange={(e) => setCustomAttrName(e.target.value)}
                    placeholder="O crear atributo personalizado..."
                    className="p-3 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-[#FC7D00]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAttribute}
                    disabled={!customAttrName.trim()}
                    className="px-4 py-3 bg-black hover:bg-gray-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    + Personalizado
                  </button>
                </div>
              </div>

              {/* Attributes Cards List */}
              {attributes.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-3 bg-gray-50/40">
                  <Tag className="w-10 h-10 mx-auto text-[#FC7D00] opacity-40" />
                  <div>
                    <h5 className="font-heading text-sm font-bold text-gray-800 uppercase">
                      No hay atributos añadidos a este producto
                    </h5>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      Seleccioná un atributo arriba (como <strong>Madera</strong>, <strong>Medida</strong> o <strong>Tapizado</strong>) y hacé clic en "Añadir".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {attributes.map((attr, attrIdx) => {
                    const globalAttr = availableGlobalAttributes.find(
                      (g) => g.name.toLowerCase() === attr.name.toLowerCase()
                    );
                    const allAvailableTerms = globalAttr
                      ? Array.from(new Set([...globalAttr.terms.map((t) => t.name), ...attr.terms]))
                      : attr.terms;

                    return (
                      <div
                        key={attr.name}
                        className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4"
                      >
                        {/* Attribute Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <span className="font-heading text-sm font-black text-gray-900 uppercase tracking-wide">
                              {attr.name}
                            </span>
                            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-100/70 text-[#c25e1a]">
                              {attr.terms.length} seleccionados
                            </span>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Checkbox: Usado para variaciones (WooCommerce essential) */}
                            <label className="flex items-center space-x-2 text-xs font-bold text-gray-800 cursor-pointer select-none bg-orange-50/70 border border-[#FC7D00]/20 px-3 py-1.5 rounded-xl hover:bg-orange-100/70 transition-colors">
                              <input
                                type="checkbox"
                                checked={attr.usedForVariations}
                                onChange={(e) => {
                                  const updated = [...attributes];
                                  updated[attrIdx] = {
                                    ...attr,
                                    usedForVariations: e.target.checked,
                                  };
                                  onChangeAttributes(updated);
                                }}
                                className="w-4 h-4 text-[#FC7D00] rounded focus:ring-0 cursor-pointer"
                              />
                              <span className="text-[#FC7D00] font-black">✓ Usado para variaciones</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveAttribute(attrIdx)}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Quitar atributo"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Terms Quick Selection Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Valores aplicables a este mueble:
                          </span>
                          <div className="flex items-center space-x-3 text-xs">
                            <button
                              type="button"
                              onClick={() => handleSelectAllTerms(attrIdx)}
                              className="font-bold text-[#FC7D00] hover:underline cursor-pointer"
                            >
                              Seleccionar todos
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllTerms(attrIdx)}
                              className="font-semibold text-gray-500 hover:text-black underline cursor-pointer"
                            >
                              Desmarcar todos
                            </button>
                          </div>
                        </div>

                        {/* Interactive Chips of Terms */}
                        <div className="flex flex-wrap gap-2">
                          {allAvailableTerms.map((termName) => {
                            const isSelected = attr.terms.includes(termName);
                            return (
                              <button
                                key={termName}
                                type="button"
                                onClick={() => handleToggleTerm(attrIdx, termName)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                                  isSelected
                                    ? "bg-black text-white border-black font-bold shadow-xs scale-102"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-white"
                                }`}
                              >
                                {isSelected && <Check size={13} className="text-[#FC7D00]" />}
                                <span>{termName}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Add Custom Term Inline Field */}
                        <div className="pt-2 flex items-center gap-2">
                          <input
                            type="text"
                            value={newTermInputs[attr.name] || ""}
                            onChange={(e) =>
                              setNewTermInputs({
                                ...newTermInputs,
                                [attr.name]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomTermToAttribute(attrIdx);
                              }
                            }}
                            placeholder={`+ Añadir nuevo valor a ${attr.name} (ej. Cedro, 1.50 x 0.80 m)...`}
                            className="flex-1 p-2.5 rounded-xl border border-gray-200 text-xs bg-gray-50/50 outline-none focus:bg-white focus:border-[#FC7D00]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCustomTermToAttribute(attrIdx)}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            + Añadir valor
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step Navigation Button */}
              {attributes.length > 0 && (
                <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    Paso 1 completado. Ahora pasá a la pestaña Variaciones para generar o configurar las combinaciones.
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateAllVariations}
                    className="px-6 py-3.5 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center space-x-2 cursor-pointer hover:scale-102"
                  >
                    <Zap size={15} />
                    <span>Generar Variaciones para estos atributos →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VARIACIONES (COMO EN WOOCOMMERCE) */}
          {activeSubTab === "variations" && (
            <div className="p-8 space-y-6">
              {/* Variations Generator & Bulk Actions Toolbar */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/90 space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleGenerateAllVariations}
                      className="px-5 py-3 bg-[#FC7D00] hover:bg-[#e66c00] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer hover:scale-102"
                    >
                      <Zap size={15} />
                      <span>⚡ Generar variaciones automáticas</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddSingleVariation}
                      className="px-4 py-3 bg-black hover:bg-gray-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus size={14} />
                      <span>+ Añadir individual</span>
                    </button>

                    <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-white border text-gray-800 shadow-2xs">
                      {variations.length} variaciones
                    </span>
                  </div>

                  {/* Mass Bulk Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Mass Price */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden px-2 shadow-2xs">
                      <span className="text-xs text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        value={bulkPriceInput}
                        onChange={(e) => setBulkPriceInput(e.target.value)}
                        placeholder="Precio a todas..."
                        className="w-28 p-2 text-xs outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkPrice}
                        disabled={!bulkPriceInput}
                        className="text-[10px] uppercase font-bold text-[#FC7D00] hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        Fijar
                      </button>
                    </div>

                    {/* Mass Stock */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden px-2 shadow-2xs">
                      <Package size={13} className="text-gray-400 mr-1" />
                      <input
                        type="number"
                        value={bulkStockInput}
                        onChange={(e) => setBulkStockInput(e.target.value)}
                        placeholder="Stock..."
                        className="w-18 p-2 text-xs outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkStock}
                        disabled={!bulkStockInput}
                        className="text-[10px] uppercase font-bold text-[#FC7D00] hover:underline disabled:opacity-40 cursor-pointer"
                      >
                        Fijar
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleAllStockStatus}
                      className="p-2 px-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
                      title="Alternar estado de stock para todas las variaciones"
                    >
                      Alternar En Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Variations Accordion List */}
              {variations.length === 0 ? (
                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-3 bg-gray-50/40">
                  <Layers className="w-10 h-10 mx-auto text-[#FC7D00] opacity-40" />
                  <div>
                    <h5 className="font-heading text-sm font-bold text-gray-800 uppercase">
                      No hay variaciones creadas aún
                    </h5>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                      Hacé clic en <strong>"⚡ Generar variaciones automáticas"</strong> para combinar todos los atributos configurados o en <strong>"+ Añadir individual"</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {variations.map((v, vIdx) => {
                    const isExpanded = expandedVariationId === v.id;
                    const attrSummary = Object.entries(v.attributes)
                      .map(([k, val]) => `${k}: ${val}`)
                      .join(" | ");

                    return (
                      <div
                        key={v.id}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isExpanded
                            ? "bg-white border-[#FC7D00]/50 shadow-md ring-2 ring-[#FC7D00]/10"
                            : "bg-white border-gray-200/90 hover:border-gray-300 shadow-2xs"
                        }`}
                      >
                        {/* Accordion Row Header (WooCommerce style) */}
                        <div
                          onClick={() =>
                            setExpandedVariationId(isExpanded ? null : v.id)
                          }
                          className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none bg-gray-50/40 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3.5 min-w-0">
                            {/* Thumbnail photo */}
                            <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-2xs">
                              {v.image ? (
                                <img
                                  src={v.image}
                                  alt={v.sku || "Variación"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon size={18} className="text-gray-300" />
                              )}
                            </div>

                            {/* Attribute selectors or badges */}
                            <div className="min-w-0">
                              <span className="font-heading text-xs font-bold text-gray-900 block truncate">
                                #{vIdx + 1}: {attrSummary || "Variación sin atributos"}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono block">
                                SKU: {v.sku || "Sin SKU"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3.5 flex-shrink-0">
                            {/* Price display */}
                            <div className="text-right">
                              <span className="text-xs font-extrabold font-mono text-gray-900 block">
                                {formatCurrency(v.salePrice ?? v.regularPrice)}
                              </span>
                              {v.salePrice && (
                                <span className="text-[10px] text-gray-400 line-through font-mono block">
                                  {formatCurrency(v.regularPrice)}
                                </span>
                              )}
                            </div>

                            {/* Stock Badge */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                v.inStock && (v.stock ?? 0) > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {v.inStock && (v.stock ?? 0) > 0
                                ? `Stock: ${v.stock}`
                                : "Agotado"}
                            </span>

                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center space-x-1"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveVariation(vIdx)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Eliminar variación"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <div className="text-gray-400">
                              {isExpanded ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Accordion Expanded Body */}
                        {isExpanded && (
                          <div className="p-6 border-t border-gray-100 bg-white space-y-6 animate-fadeIn">
                            {/* Attribute dropdowns inside variation (WooCommerce faithful) */}
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                                Combinación de Atributos de esta Variación:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Object.keys(v.attributes).map((attrName) => {
                                  const attrObj = attributes.find((a) => a.name === attrName);
                                  const termsList = attrObj ? attrObj.terms : [v.attributes[attrName]];

                                  return (
                                    <div key={attrName}>
                                      <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">
                                        {attrName}
                                      </label>
                                      <select
                                        value={v.attributes[attrName]}
                                        onChange={(e) => {
                                          const nextAttrs = {
                                            ...v.attributes,
                                            [attrName]: e.target.value,
                                          };
                                          handleUpdateVariation(vIdx, { attributes: nextAttrs });
                                        }}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-white font-medium outline-none focus:border-[#FC7D00]"
                                      >
                                        {termsList.map((t) => (
                                          <option key={t} value={t}>
                                            {t}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                              {/* Left: Image Box */}
                              <div className="md:col-span-3 space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600">
                                  Foto de la variación
                                </label>
                                <div className="aspect-square rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden relative flex items-center justify-center p-1 group">
                                  {v.image ? (
                                    <img
                                      src={v.image}
                                      alt={v.sku || "Variación"}
                                      className="w-full h-full object-contain rounded-xl"
                                    />
                                  ) : (
                                    <div className="text-center p-3 text-gray-400">
                                      <ImageIcon className="w-8 h-8 mx-auto opacity-40 text-[#FC7D00]" />
                                      <span className="text-[10px] block mt-1">Sin foto</span>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setMediaPickerVarIndex(vIdx)}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                                    title="Elegir de la biblioteca"
                                  >
                                    <Images size={12} className="text-[#FC7D00]" />
                                    <span>Biblioteca</span>
                                  </button>

                                  <label className="p-2 bg-black hover:bg-gray-800 text-white text-[10px] font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer">
                                    <UploadCloud size={12} />
                                    <span>{isUploadingVarImage === vIdx ? "..." : "Subir"}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleUploadVariationImage(vIdx, e)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* Right: Inputs (SKU, Prices, Stock) */}
                              <div className="md:col-span-9 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {/* SKU */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      SKU Específico
                                    </label>
                                    <input
                                      type="text"
                                      value={v.sku || ""}
                                      onChange={(e) =>
                                        handleUpdateVariation(vIdx, { sku: e.target.value })
                                      }
                                      placeholder="ej: DUNA-PAR-180"
                                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-[#FC7D00]"
                                    />
                                  </div>

                                  {/* Regular Price */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      Precio Normal ($) *
                                    </label>
                                    <input
                                      type="number"
                                      value={v.regularPrice || ""}
                                      onChange={(e) =>
                                        handleUpdateVariation(vIdx, {
                                          regularPrice: Number(e.target.value),
                                        })
                                      }
                                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold outline-none focus:border-[#FC7D00]"
                                    />
                                  </div>

                                  {/* Sale Price */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      Precio Rebajado ($)
                                    </label>
                                    <input
                                      type="number"
                                      value={v.salePrice || ""}
                                      onChange={(e) =>
                                        handleUpdateVariation(vIdx, {
                                          salePrice: e.target.value
                                            ? Number(e.target.value)
                                            : undefined,
                                        })
                                      }
                                      placeholder="Opcional"
                                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-[#FC7D00]"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                                  {/* Stock Quantity */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      Cantidad de Stock
                                    </label>
                                    <input
                                      type="number"
                                      value={v.stock ?? 5}
                                      onChange={(e) =>
                                        handleUpdateVariation(vIdx, {
                                          stock: Number(e.target.value),
                                          inStock: Number(e.target.value) > 0,
                                        })
                                      }
                                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-[#FC7D00]"
                                    />
                                  </div>

                                  {/* In Stock toggle */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      Estado de Existencias
                                    </label>
                                    <select
                                      value={v.inStock ? "in_stock" : "out_of_stock"}
                                      onChange={(e) =>
                                        handleUpdateVariation(vIdx, {
                                          inStock: e.target.value === "in_stock",
                                        })
                                      }
                                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#FC7D00] bg-white font-semibold"
                                    >
                                      <option value="in_stock">✓ Hay existencias (En stock)</option>
                                      <option value="out_of_stock">✗ Agotado (Sin stock)</option>
                                    </select>
                                  </div>

                                  {/* Enabled toggle */}
                                  <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">
                                      Visibilidad
                                    </label>
                                    <label className="flex items-center space-x-2 p-2 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={v.enabled}
                                        onChange={(e) =>
                                          handleUpdateVariation(vIdx, {
                                            enabled: e.target.checked,
                                          })
                                        }
                                        className="w-4 h-4 text-[#FC7D00] rounded focus:ring-0 cursor-pointer"
                                      />
                                      <span className="text-xs font-bold text-gray-700">
                                        Variación Habilitada
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Media Picker Modal for Variations */}
      <MediaPickerModal
        isOpen={mediaPickerVarIndex !== null}
        onClose={() => setMediaPickerVarIndex(null)}
        multiple={false}
        onSelectImages={(urls) => {
          if (urls.length > 0 && mediaPickerVarIndex !== null) {
            handleUpdateVariation(mediaPickerVarIndex, { image: urls[0] });
          }
          setMediaPickerVarIndex(null);
        }}
      />
    </div>
  );
}
