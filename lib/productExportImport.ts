import { Product, ProductAttributeSelection, ProductVariationItem } from "./types";

/**
 * Escapes a cell for CSV according to RFC 4180
 */
export function escapeCSVCell(value: any): string {
  if (value === null || value === undefined) return "";
  let str = typeof value === "object" ? JSON.stringify(value) : String(value);
  // If string contains comma, quote, or newline, escape quotes with double quotes and wrap in quotes
  if (str.includes(",") || str.includes("\"") || str.includes("\n") || str.includes("\r") || str.includes(";")) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses RFC 4180 compliant CSV text into a 2D array of strings.
 * Supports quotes, escaped quotes (""), newlines inside cells, and autodetects comma or semicolon delimiter.
 */
export function parseCSV(text: string): string[][] {
  if (!text) return [];
  // Strip UTF-8 BOM if present
  let cleanText = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  // Detect delimiter from first line (comma vs semicolon)
  const firstLine = cleanText.split(/\r\n|\n|\r/)[0] || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

  const rows: string[][] = [];
  let currentRow: string[] = [""];
  let inQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentRow[currentRow.length - 1] += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      currentRow.push("");
      i++;
      continue;
    }

    if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      // Finish row
      rows.push(currentRow);
      currentRow = [""];
      i++;
      continue;
    }

    currentRow[currentRow.length - 1] += char;
    i++;
  }

  if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Generates CSV string with UTF-8 BOM for full product catalog
 */
export function exportProductsToCSV(products: Product[]): string {
  const headers = [
    "ID",
    "Tipo",
    "SKU",
    "Nombre",
    "Slug",
    "Precio normal",
    "Precio oferta",
    "Stock",
    "Línea",
    "Categoría principal",
    "Categorías",
    "Subcategoría principal",
    "Subcategorías",
    "Destacado",
    "Nuevo ingreso",
    "Entrega 48hs",
    "Descripción corta",
    "Descripción completa",
    "Imágenes",
    "Peso (kg)",
    "Ancho (cm)",
    "Alto (cm)",
    "Profundidad (cm)",
    "Atributos (JSON)",
    "Variaciones (JSON)",
    "Fecha creación",
    "Fecha actualización",
  ];

  const rows: string[][] = [headers];

  for (const p of products) {
    const row = [
      p.id || "",
      p.productType || "simple",
      p.sku || "",
      p.title || "",
      p.slug || "",
      p.regularPrice !== undefined ? String(p.regularPrice) : "0",
      p.salePrice !== undefined && p.salePrice !== null ? String(p.salePrice) : "",
      p.stock !== undefined ? String(p.stock) : "0",
      p.linea || "practica",
      p.category || "",
      Array.isArray(p.categories) ? p.categories.join(" | ") : (p.category || ""),
      p.subcategory || "",
      Array.isArray(p.subcategories) ? p.subcategories.join(" | ") : (p.subcategory || ""),
      p.featured ? "1" : "0",
      p.isNewArrival ? "1" : "0",
      p.entrega48hs ? "1" : "0",
      p.shortDescription || "",
      p.description || "",
      Array.isArray(p.images) ? p.images.join(" | ") : "",
      p.dimensions?.weightKg !== undefined ? String(p.dimensions.weightKg) : "",
      p.dimensions?.widthCm !== undefined ? String(p.dimensions.widthCm) : "",
      p.dimensions?.heightCm !== undefined ? String(p.dimensions.heightCm) : "",
      p.dimensions?.depthCm !== undefined ? String(p.dimensions.depthCm) : "",
      p.attributes && p.attributes.length > 0 ? JSON.stringify(p.attributes) : "",
      p.productVariations && p.productVariations.length > 0 ? JSON.stringify(p.productVariations) : "",
      p.createdAt || "",
      p.updatedAt || "",
    ];
    rows.push(row);
  }

  const csvBody = rows.map((r) => r.map(escapeCSVCell).join(",")).join("\r\n");
  // Prepend UTF-8 BOM so Excel opens with proper accents and symbols
  return "\uFEFF" + csvBody;
}

/**
 * Generates formatted JSON string for products
 */
export function exportProductsToJSON(products: Product[]): string {
  return JSON.stringify(products, null, 2);
}

/**
 * Downloads a string as a file in the browser
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Slug generator helper
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Parse uploaded JSON file content into Product array with validation
 */
export function parseProductsJSON(jsonText: string): { products: Product[]; errors: string[] } {
  const errors: string[] = [];
  try {
    const parsed = JSON.parse(jsonText);
    const rawList: any[] = Array.isArray(parsed) ? parsed : [parsed];

    const products: Product[] = [];
    rawList.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        errors.push(`Fila ${index + 1}: El elemento no es un objeto válido.`);
        return;
      }
      if (!item.title && !item.name) {
        errors.push(`Fila ${index + 1}: El producto debe tener un título o nombre.`);
        return;
      }

      const title = String(item.title || item.name || "Producto sin título").trim();
      const slug = item.slug ? String(item.slug).trim() : slugify(title);
      const id = item.id ? String(item.id).trim() : `prod-${Date.now()}-${index}`;

      const product: Product = {
        id,
        slug,
        title,
        sku: item.sku ? String(item.sku).trim() : undefined,
        shortDescription: item.shortDescription || item.short_description || "",
        description: item.description || "",
        regularPrice: Number(item.regularPrice ?? item.regular_price ?? item.price ?? 0),
        salePrice: item.salePrice !== undefined && item.salePrice !== null ? Number(item.salePrice) : undefined,
        stock: Number(item.stock ?? 10),
        linea: item.linea === "premium" ? "premium" : "practica",
        productType: item.productType === "variable" ? "variable" : "simple",
        category: item.category || (Array.isArray(item.categories) && item.categories[0]) || "comedor",
        categories: Array.isArray(item.categories) && item.categories.length > 0 ? item.categories : [item.category || "comedor"],
        subcategory: item.subcategory || (Array.isArray(item.subcategories) && item.subcategories[0]) || undefined,
        subcategories: Array.isArray(item.subcategories) ? item.subcategories : (item.subcategory ? [item.subcategory] : []),
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images : ["https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp"],
        featured: Boolean(item.featured),
        isNewArrival: Boolean(item.isNewArrival ?? item.is_new_arrival),
        dimensions: item.dimensions || {
          weightKg: Number(item.weightKg ?? 5),
          widthCm: Number(item.widthCm ?? 50),
          heightCm: Number(item.heightCm ?? 80),
          depthCm: Number(item.depthCm ?? 50),
        },
        attributes: Array.isArray(item.attributes) ? item.attributes : [],
        productVariations: Array.isArray(item.productVariations) ? item.productVariations : [],
        variations: Array.isArray(item.variations) ? item.variations : [],
        createdAt: item.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      products.push(product);
    });

    return { products, errors };
  } catch (err: any) {
    return { products: [], errors: [`Error de sintaxis JSON: ${err.message}`] };
  }
}

/**
 * Normalizes header keys to standard names
 */
function normalizeHeader(h: string): string {
  const clean = h
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-z0-9]/g, "");

  if (clean === "id" || clean === "codigo") return "id";
  if (clean === "tipo" || clean === "type" || clean === "producttype") return "productType";
  if (clean === "sku") return "sku";
  if (clean === "nombre" || clean === "titulo" || clean === "title" || clean === "name") return "title";
  if (clean === "slug") return "slug";
  if (clean.includes("precionormal") || clean === "precio" || clean === "regularprice" || clean === "price") return "regularPrice";
  if (clean.includes("preciooferta") || clean.includes("precioreserva") || clean.includes("preciorebajado") || clean === "saleprice") return "salePrice";
  if (clean === "stock" || clean === "cantidad") return "stock";
  if (clean === "linea") return "linea";
  if (clean === "categoriaprincipal" || clean === "categoria" || clean === "category") return "category";
  if (clean === "categorias" || clean === "categories") return "categories";
  if (clean === "subcategoriaprincipal" || clean === "subcategoria" || clean === "subcategory") return "subcategory";
  if (clean === "subcategorias" || clean === "subcategories") return "subcategories";
  if (clean === "destacado" || clean === "featured") return "featured";
  if (clean === "nuevoingreso" || clean === "nuevo" || clean === "isnewarrival") return "isNewArrival";
  if (clean.includes("entrega48") || clean.includes("48hs") || clean.includes("48h")) return "entrega48hs";
  if (clean.includes("descripcioncorta") || clean === "shortdescription") return "shortDescription";
  if (clean.includes("descripcion") || clean === "description") return "description";
  if (clean === "imagenes" || clean === "fotos" || clean === "images" || clean === "fotosurls") return "images";
  if (clean.includes("peso") || clean === "weightkg") return "weightKg";
  if (clean.includes("ancho") || clean === "widthcm") return "widthCm";
  if (clean.includes("alto") || clean === "heightcm") return "heightCm";
  if (clean.includes("profundidad") || clean === "depthcm") return "depthCm";
  if (clean.includes("atributo") || clean === "attributes") return "attributes";
  if (clean.includes("variacion") || clean === "productvariations") return "productVariations";
  if (clean.includes("fechacreacion") || clean === "createdat") return "createdAt";
  return clean;
}

/**
 * Parses uploaded CSV text into Product array with validation
 */
export function parseProductsCSV(csvText: string): { products: Product[]; errors: string[] } {
  const errors: string[] = [];
  const matrix = parseCSV(csvText);

  if (matrix.length < 2) {
    return { products: [], errors: ["El archivo CSV no contiene filas de datos o está vacío."] };
  }

  const rawHeaders = matrix[0];
  const headerMap: Record<number, string> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[idx] = normalizeHeader(h);
  });

  const products: Product[] = [];

  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex++) {
    const row = matrix[rowIndex];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) {
      continue; // Skip empty line
    }

    const item: Record<string, string> = {};
    row.forEach((val, colIdx) => {
      const key = headerMap[colIdx];
      if (key) {
        item[key] = val.trim();
      }
    });

    const title = item["title"] || "";
    if (!title) {
      errors.push(`Fila ${rowIndex + 1}: Omitida porque no contiene título.`);
      continue;
    }

    const id = item["id"] || `prod-${Date.now()}-${rowIndex}`;
    const slug = item["slug"] || slugify(title);

    // Categories
    const category = item["category"] || "comedor";
    const categories = item["categories"]
      ? item["categories"].split(/\||,/).map((c) => c.trim()).filter(Boolean)
      : [category];

    // Subcategories
    const subcategory = item["subcategory"] || undefined;
    const subcategories = item["subcategories"]
      ? item["subcategories"].split(/\||,/).map((s) => s.trim()).filter(Boolean)
      : subcategory ? [subcategory] : [];

    // Images
    const images = item["images"]
      ? item["images"].split(/\||,/).map((url) => url.trim()).filter(Boolean)
      : ["https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp"];

    // Attributes JSON
    let attributes: ProductAttributeSelection[] = [];
    if (item["attributes"]) {
      try {
        attributes = JSON.parse(item["attributes"]);
      } catch (_) {
        // Simple fallback if formatted as "Color: Blanco | Negro"
        const parts = item["attributes"].split(";");
        attributes = parts.map((part) => {
          const [name, termsStr] = part.split(":");
          return {
            name: (name || "").trim(),
            terms: termsStr ? termsStr.split("|").map((t) => t.trim()).filter(Boolean) : [],
            usedForVariations: true,
          };
        }).filter((a) => a.name);
      }
    }

    // Variations JSON
    let productVariations: ProductVariationItem[] = [];
    if (item["productVariations"]) {
      try {
        productVariations = JSON.parse(item["productVariations"]);
      } catch (_) {}
    }

    const regPrice = parseFloat(item["regularPrice"] || "0") || 0;
    const saleP = item["salePrice"] ? parseFloat(item["salePrice"]) : undefined;

    const prod: Product = {
      id,
      slug,
      title,
      sku: item["sku"] || undefined,
      shortDescription: item["shortDescription"] || "",
      description: item["description"] || "",
      regularPrice: regPrice,
      salePrice: saleP !== undefined && !isNaN(saleP) ? saleP : undefined,
      stock: parseInt(item["stock"] || "10", 10) || 0,
      linea: item["linea"]?.toLowerCase() === "premium" ? "premium" : "practica",
      productType: item["productType"]?.toLowerCase() === "variable" ? "variable" : "simple",
      category,
      categories,
      subcategory,
      subcategories,
      images: images.length > 0 ? images : ["https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp"],
      featured: item["featured"] === "1" || item["featured"]?.toLowerCase() === "true" || item["featured"]?.toLowerCase() === "si",
      isNewArrival: item["isNewArrival"] === "1" || item["isNewArrival"]?.toLowerCase() === "true" || item["isNewArrival"]?.toLowerCase() === "si",
      entrega48hs: item["entrega48hs"] === "1" || item["entrega48hs"]?.toLowerCase() === "true" || item["entrega48hs"]?.toLowerCase() === "si",
      dimensions: {
        weightKg: parseFloat(item["weightKg"] || "5") || 5,
        widthCm: parseFloat(item["widthCm"] || "50") || 50,
        heightCm: parseFloat(item["heightCm"] || "80") || 80,
        depthCm: parseFloat(item["depthCm"] || "50") || 50,
      },
      attributes,
      productVariations,
      variations: [],
      createdAt: item["createdAt"] || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    products.push(prod);
  }

  return { products, errors };
}

/**
 * Generates sample CSV template ready for download and editing
 */
export function generateSampleCSVTemplate(): string {
  const sampleProducts: Product[] = [
    {
      id: "prod-ejemplo-1",
      slug: "mesa-nordica-comedor",
      title: "Mesa Nórdica Comedor",
      sku: "MES-NOR-001",
      regularPrice: 320000,
      salePrice: 285000,
      stock: 12,
      linea: "practica",
      productType: "simple",
      category: "comedor",
      categories: ["comedor", "living"],
      subcategory: "mesas",
      subcategories: ["mesas"],
      featured: true,
      isNewArrival: false,
      shortDescription: "Mesa de comedor de líneas depuradas en madera maciza.",
      description: "Mesa fabricada en madera paraíso con terminación en laca poliuretánica mate al agua.",
      images: [
        "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp",
        "https://acasatienda.com.ar/wp-content/uploads/2026/10/Banner.webp",
      ],
      dimensions: {
        weightKg: 28,
        widthCm: 160,
        heightCm: 76,
        depthCm: 90,
      },
      attributes: [],
      productVariations: [],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    },
    {
      id: "prod-ejemplo-2",
      slug: "silla-scandi-tapizada",
      title: "Silla Scandi Tapizada",
      sku: "SIL-SCA-002",
      regularPrice: 95000,
      salePrice: 89000,
      stock: 30,
      linea: "premium",
      productType: "variable",
      category: "comedor",
      categories: ["comedor"],
      subcategory: "sillas",
      subcategories: ["sillas"],
      featured: false,
      isNewArrival: true,
      shortDescription: "Silla ergonómica nórdica con opciones de tapizado en pana o lino.",
      description: "Estructura en madera paraíso y tapizado con tratamiento antimanchas.",
      images: [
        "https://acasatienda.com.ar/wp-content/uploads/2026/10/Living.webp",
      ],
      dimensions: {
        weightKg: 6,
        widthCm: 48,
        heightCm: 85,
        depthCm: 52,
      },
      attributes: [
        {
          name: "Tapizado",
          terms: ["Lino Gris", "Pana Beige"],
          usedForVariations: true,
        },
      ],
      productVariations: [
        {
          id: "var-1",
          sku: "SIL-SCA-002-LINO",
          attributes: { Tapizado: "Lino Gris" },
          regularPrice: 95000,
          salePrice: 89000,
          stock: 15,
          inStock: true,
          enabled: true,
        },
        {
          id: "var-2",
          sku: "SIL-SCA-002-PANA",
          attributes: { Tapizado: "Pana Beige" },
          regularPrice: 102000,
          salePrice: 95000,
          stock: 15,
          inStock: true,
          enabled: true,
        },
      ],
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    },
  ];

  return exportProductsToCSV(sampleProducts);
}
