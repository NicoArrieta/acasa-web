"use client";

import React, { useState, useRef } from "react";
import { Product } from "@/lib/types";
import {
  exportProductsToCSV,
  exportProductsToJSON,
  parseProductsCSV,
  parseProductsJSON,
  downloadFile,
  generateSampleCSVTemplate,
} from "@/lib/productExportImport";
import { formatCurrency } from "@/lib/store";
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Layers,
} from "lucide-react";

interface ProductImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  filteredProducts?: Product[];
  initialTab?: "export" | "import";
  onImportComplete: (imported: Product[], overwrite: boolean) => Promise<void> | void;
}

export default function ProductImportExportModal({
  isOpen,
  onClose,
  products,
  filteredProducts,
  initialTab = "export",
  onImportComplete,
}: ProductImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<"export" | "import">(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Export State
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportScope, setExportScope] = useState<"all" | "filtered">("all");
  const [isExporting, setIsExporting] = useState(false);

  // Import State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsedProducts, setParsedProducts] = useState<Product[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetExportList =
    exportScope === "filtered" && filteredProducts && filteredProducts.length > 0
      ? filteredProducts
      : products;

  // Handle Export
  const handleExport = () => {
    setIsExporting(true);
    const dateStr = new Date().toISOString().split("T")[0];
    try {
      if (exportFormat === "csv") {
        const csvContent = exportProductsToCSV(targetExportList);
        downloadFile(csvContent, `acasa_catalogo_${dateStr}.csv`, "text/csv;charset=utf-8;");
      } else {
        const jsonContent = exportProductsToJSON(targetExportList);
        downloadFile(jsonContent, `acasa_catalogo_${dateStr}.json`, "application/json");
      }
    } catch (err: any) {
      alert("Error al exportar: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Template Download
  const handleDownloadTemplate = () => {
    const templateCSV = generateSampleCSVTemplate();
    downloadFile(templateCSV, "plantilla_productos_acasa.csv", "text/csv;charset=utf-8;");
  };

  // Process File
  const processUploadedFile = (file: File) => {
    setImportedFile(file);
    setParseErrors([]);
    setParsedProducts([]);
    setImportSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const isJson = file.name.endsWith(".json") || file.type.includes("json");
      if (isJson) {
        const { products: items, errors } = parseProductsJSON(content);
        setParsedProducts(items);
        setParseErrors(errors);
      } else {
        const { products: items, errors } = parseProductsCSV(content);
        setParsedProducts(items);
        setParseErrors(errors);
      }
    };
    reader.readAsText(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Conflict analysis
  const existingMap = new Map<string, Product>();
  products.forEach((p) => {
    if (p.id) existingMap.set(p.id.toLowerCase(), p);
    if (p.sku) existingMap.set(p.sku.toLowerCase(), p);
    if (p.slug) existingMap.set(p.slug.toLowerCase(), p);
  });

  const conflictCount = parsedProducts.filter((p) => {
    return (
      (p.id && existingMap.has(p.id.toLowerCase())) ||
      (p.sku && existingMap.has(p.sku.toLowerCase())) ||
      (p.slug && existingMap.has(p.slug.toLowerCase()))
    );
  }).length;

  const newCount = parsedProducts.length - conflictCount;

  // Confirm Import
  const handleConfirmImport = async () => {
    if (parsedProducts.length === 0) return;
    setIsImporting(true);
    try {
      await onImportComplete(parsedProducts, overwriteExisting);
      setImportSuccessMessage(
        `¡Se importaron con éxito ${parsedProducts.length} productos (${newCount} nuevos, ${conflictCount} actualizados)!`
      );
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      alert("Error al guardar productos: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FC7D00]/10 flex items-center justify-center text-[#FC7D00]">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                Importar / Exportar Catálogo
              </h2>
              <p className="text-xs text-gray-500">
                Administrá tus productos masivamente mediante planillas CSV o JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("export")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === "export"
                ? "border-[#FC7D00] text-[#FC7D00]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Download size={14} />
            <span>Exportar Productos</span>
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === "import"
                ? "border-[#FC7D00] text-[#FC7D00]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Upload size={14} />
            <span>Importar Productos</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "export" ? (
            /* TAB: EXPORT */
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  1. Seleccionar formato de exportación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setExportFormat("csv")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                      exportFormat === "csv"
                        ? "border-[#FC7D00] bg-[#FC7D00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-green-50 text-green-700 mt-0.5">
                      <FileSpreadsheet size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">CSV para Excel</span>
                        {exportFormat === "csv" && (
                          <span className="text-[10px] bg-[#FC7D00] text-white px-2 py-0.5 rounded-full font-bold">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Compatible con Microsoft Excel, Google Sheets y LibreOffice. Incluye codificación UTF-8 con soporte de tildes.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setExportFormat("json")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start space-x-3 ${
                      exportFormat === "json"
                        ? "border-[#FC7D00] bg-[#FC7D00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-700 mt-0.5">
                      <FileJson size={22} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900">JSON Completo</span>
                        {exportFormat === "json" && (
                          <span className="text-[10px] bg-[#FC7D00] text-white px-2 py-0.5 rounded-full font-bold">
                            Seleccionado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Copia de seguridad 100% fiel con toda la estructura de atributos, variaciones, dimensiones e imágenes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {filteredProducts && filteredProducts.length !== products.length && (
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                    2. Alcance de los productos
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 text-xs text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={exportScope === "all"}
                        onChange={() => setExportScope("all")}
                        className="accent-[#FC7D00]"
                      />
                      <span>Todos los productos ({products.length})</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-gray-800 cursor-pointer">
                      <input
                        type="radio"
                        checked={exportScope === "filtered"}
                        onChange={() => setExportScope("filtered")}
                        className="accent-[#FC7D00]"
                      />
                      <span>Solo los filtrados actualmente ({filteredProducts.length})</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start space-x-3">
                <HelpCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Información incluida en la exportación:</p>
                  <p className="text-amber-800 mt-1">
                    Título, SKU, Slug, Precios normal y oferta, Stock, Categorías múltiples, Subcategorías, Imágenes, Dimensiones (alto, ancho, prof., peso), Atributos y Variaciones completas.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExport}
                  disabled={isExporting || targetExportList.length === 0}
                  className="bg-[#FC7D00] hover:bg-[#e66c00] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>
                    {isExporting
                      ? "Generando archivo..."
                      : `Exportar ${targetExportList.length} Productos (${exportFormat.toUpperCase()})`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* TAB: IMPORT */
            <div className="space-y-6">
              {importSuccessMessage ? (
                <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 size={36} className="text-green-600 mx-auto" />
                  <p className="font-bold text-green-900 text-sm">{importSuccessMessage}</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Upload box */}
                  {!importedFile ? (
                    <div className="space-y-4">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-[#FC7D00] bg-[#FC7D00]/5"
                            : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv, .json, text/csv, application/json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) processUploadedFile(file);
                          }}
                        />
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto text-gray-500 mb-3">
                          <Upload size={22} className="text-[#FC7D00]" />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900">
                          Hacé clic para seleccionar o arrastrá tu archivo aquí
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Admite archivos <strong>.CSV</strong> (separados por coma o punto y coma) o <strong>.JSON</strong>
                        </p>
                      </div>

                      {/* Download Template helper */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl">
                        <div className="flex items-center space-x-3">
                          <FileText size={20} className="text-gray-500" />
                          <div>
                            <p className="text-xs font-bold text-gray-800">
                              ¿Necesitás una plantilla de ejemplo?
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Descargá el modelo CSV con columnas de productos simples y con variaciones.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleDownloadTemplate}
                          className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 flex items-center space-x-1.5 transition-colors shadow-sm"
                        >
                          <Download size={13} />
                          <span>Descargar Plantilla CSV</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: File loaded preview & confirm */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-xl bg-white shadow-sm border border-gray-100 text-[#FC7D00]">
                            {importedFile.name.endsWith(".json") ? (
                              <FileJson size={20} />
                            ) : (
                              <FileSpreadsheet size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{importedFile.name}</p>
                            <p className="text-[11px] text-gray-500">
                              {(importedFile.size / 1024).toFixed(1)} KB — {parsedProducts.length} productos detectados
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setImportedFile(null);
                            setParsedProducts([]);
                            setParseErrors([]);
                          }}
                          className="text-xs text-gray-500 hover:text-red-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
                        >
                          Cambiar archivo
                        </button>
                      </div>

                      {/* Errors if any */}
                      {parseErrors.length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                          <div className="flex items-center space-x-1.5 font-bold text-red-900 mb-1">
                            <AlertCircle size={15} />
                            <span>Advertencias durante el análisis ({parseErrors.length}):</span>
                          </div>
                          {parseErrors.slice(0, 4).map((err, idx) => (
                            <p key={idx} className="text-[11px]">
                              • {err}
                            </p>
                          ))}
                          {parseErrors.length > 4 && (
                            <p className="text-[10px] text-red-600 italic">
                              ... y {parseErrors.length - 4} advertencias más.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Summary Badges */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                          <span className="block text-xl font-bold text-gray-900">{parsedProducts.length}</span>
                          <span className="text-[11px] text-gray-500 font-medium">Total a Procesar</span>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center">
                          <span className="block text-xl font-bold text-green-700">{newCount}</span>
                          <span className="text-[11px] text-green-700 font-medium">Nuevos Productos</span>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                          <span className="block text-xl font-bold text-amber-700">{conflictCount}</span>
                          <span className="text-[11px] text-amber-700 font-medium">Existentes (Coinciden)</span>
                        </div>
                      </div>

                      {/* Overwrite option */}
                      <div className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center space-x-3">
                        <input
                          id="overwriteCheck"
                          type="checkbox"
                          checked={overwriteExisting}
                          onChange={(e) => setOverwriteExisting(e.target.checked)}
                          className="w-4 h-4 text-[#FC7D00] accent-[#FC7D00] rounded cursor-pointer"
                        />
                        <label htmlFor="overwriteCheck" className="text-xs text-gray-800 cursor-pointer">
                          <strong>Actualizar productos existentes</strong> si coinciden por ID, SKU o Slug.
                          <span className="block text-[11px] text-gray-500">
                            Si está desmarcado, los productos existentes se omitirán y solo se agregarán los nuevos.
                          </span>
                        </label>
                      </div>

                      {/* Table Preview (first 5 items) */}
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          Vista previa de productos detectados (primeros {Math.min(parsedProducts.length, 5)}):
                        </p>
                        <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-semibold sticky top-0">
                              <tr>
                                <th className="p-2.5">Producto</th>
                                <th className="p-2.5">SKU</th>
                                <th className="p-2.5">Tipo</th>
                                <th className="p-2.5">Precio</th>
                                <th className="p-2.5">Categoría</th>
                                <th className="p-2.5">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {parsedProducts.slice(0, 5).map((p, idx) => {
                                const isExisting =
                                  (p.id && existingMap.has(p.id.toLowerCase())) ||
                                  (p.sku && existingMap.has(p.sku.toLowerCase())) ||
                                  (p.slug && existingMap.has(p.slug.toLowerCase()));
                                return (
                                  <tr key={idx} className="hover:bg-gray-50/50">
                                    <td className="p-2.5 flex items-center space-x-2">
                                      <img
                                        src={
                                          p.images?.[0] ||
                                          "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp"
                                        }
                                        alt={p.title}
                                        className="w-8 h-8 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                                      />
                                      <span className="font-semibold text-gray-900 truncate max-w-[180px]">
                                        {p.title}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-gray-500 font-mono text-[11px]">
                                      {p.sku || "—"}
                                    </td>
                                    <td className="p-2.5">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          p.productType === "variable"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-blue-100 text-blue-800"
                                        }`}
                                      >
                                        {p.productType === "variable" ? "Variable" : "Simple"}
                                      </span>
                                    </td>
                                    <td className="p-2.5 font-bold text-gray-900">
                                      {formatCurrency(p.regularPrice)}
                                    </td>
                                    <td className="p-2.5 text-gray-600 truncate max-w-[120px]">
                                      {p.category}
                                    </td>
                                    <td className="p-2.5">
                                      {isExisting ? (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            overwriteExisting
                                              ? "bg-amber-100 text-amber-800"
                                              : "bg-gray-100 text-gray-600"
                                          }`}
                                        >
                                          {overwriteExisting ? "Actualizar" : "Omitir"}
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                                          Nuevo
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 flex items-center justify-between border-t border-gray-100">
                        <button
                          onClick={() => {
                            setImportedFile(null);
                            setParsedProducts([]);
                          }}
                          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmImport}
                          disabled={isImporting || parsedProducts.length === 0}
                          className="bg-[#FC7D00] hover:bg-[#e66c00] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                        >
                          {isImporting ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Importando productos...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              <span>Confirmar e Importar {parsedProducts.length} Productos</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
