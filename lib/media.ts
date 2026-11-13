import { MediaItem } from "./types";
import { supabase } from "./supabase";
import { getStoredMedia, saveStoredMedia } from "./store";

/**
 * Converte una imagen a formato .webp utilizando el canvas del navegador.
 * Optimiza las dimensiones y comprime con calidad seleccionada.
 */
export async function convertImageToWebP(
  file: File,
  quality = 0.85,
  maxDimension = 2000
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number; fileName: string; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el motor de renderizado 2D"));
          return;
        }

        // Render clean image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Fallo la conversión de la imagen a WebP"));
              return;
            }
            const cleanBase = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "-")
              .replace(/-+/g, "-");
            const newFileName = `${cleanBase}.webp`;
            const dataUrl = canvas.toDataURL("image/webp", quality);

            resolve({
              blob,
              dataUrl,
              width,
              height,
              fileName: newFileName,
              sizeBytes: blob.size,
            });
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para procesar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Error leyendo el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una imagen convertida a WebP a Supabase Storage y registra su metadata.
 * Si Supabase no responde o falla, realiza fallback a DataURL local de manera transparente.
 */
export async function uploadMediaItem(
  file: File,
  options?: { customName?: string; alt?: string; quality?: number }
): Promise<MediaItem> {
  const { blob, dataUrl, width, height, fileName, sizeBytes } = await convertImageToWebP(
    file,
    options?.quality || 0.85
  );

  const finalName = options?.customName ? (options.customName.endsWith(".webp") ? options.customName : `${options.customName}.webp`) : fileName;
  const initialAlt = options?.alt || finalName.replace(/\.webp$/i, "").replace(/[-_]/g, " ");

  const id = `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let finalUrl = dataUrl;

  try {
    const storagePath = `uploads/${Date.now()}_${finalName}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from("media")
      .upload(storagePath, blob, {
        contentType: "image/webp",
        upsert: true,
      });

    if (!uploadErr && uploadData) {
      const { data: pubData } = supabase.storage.from("media").getPublicUrl(storagePath);
      if (pubData?.publicUrl) {
        finalUrl = pubData.publicUrl;
      }
    }
  } catch (err) {
    console.warn("Storage upload fallback to dataURL:", err);
  }

  const newItem: MediaItem = {
    id,
    name: finalName,
    alt: initialAlt,
    url: finalUrl,
    sizeBytes,
    width,
    height,
    mimeType: "image/webp",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Sync to Supabase database table
  try {
    await supabase.from("media_library").insert({
      id: undefined, // let postgres assign uuid or use text if allowed
      name: newItem.name,
      alt: newItem.alt,
      url: newItem.url,
      size_bytes: newItem.sizeBytes,
      width: newItem.width,
      height: newItem.height,
      mime_type: "image/webp",
    });
  } catch (dbErr) {
    console.warn("Supabase DB sync error:", dbErr);
  }

  // Save to local store
  const stored = getStoredMedia();
  const updatedList = [newItem, ...stored.filter((m) => m.id !== newItem.id)];
  saveStoredMedia(updatedList);

  return newItem;
}

/**
 * Obtiene todas las imágenes de la biblioteca (combinando Supabase y LocalStorage).
 */
export async function getMediaLibrary(): Promise<MediaItem[]> {
  const localList = getStoredMedia();

  try {
    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const remoteItems: MediaItem[] = data.map((d: any) => ({
        id: String(d.id),
        name: d.name || "imagen.webp",
        alt: d.alt || "",
        url: d.url,
        sizeBytes: Number(d.size_bytes) || 0,
        width: Number(d.width) || undefined,
        height: Number(d.height) || undefined,
        mimeType: d.mime_type || "image/webp",
        createdAt: d.created_at || new Date().toISOString(),
        updatedAt: d.updated_at || new Date().toISOString(),
      }));

      // Merge remote with local items
      const remoteUrls = new Set(remoteItems.map((r) => r.url));
      const localOnly = localList.filter((l) => !remoteUrls.has(l.url));
      const merged = [...remoteItems, ...localOnly];
      saveStoredMedia(merged);
      return merged;
    }
  } catch (err) {
    console.warn("Error fetching remote media library:", err);
  }

  return localList;
}

/**
 * Actualiza nombre o texto alt de un item de la biblioteca
 */
export async function updateMediaItem(
  id: string,
  updates: { name?: string; alt?: string }
): Promise<void> {
  const localList = getStoredMedia();
  const updated = localList.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        name: updates.name !== undefined ? updates.name : item.name,
        alt: updates.alt !== undefined ? updates.alt : item.alt,
        updatedAt: new Date().toISOString(),
      };
    }
    return item;
  });
  saveStoredMedia(updated);

  // Sync to Supabase
  try {
    await supabase
      .from("media_library")
      .update({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.alt !== undefined ? { alt: updates.alt } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (err) {
    console.warn("Supabase update error:", err);
  }
}

/**
 * Elimina una imagen de la biblioteca y de Supabase
 */
export async function deleteMediaItem(id: string, url: string): Promise<void> {
  const localList = getStoredMedia();
  const filtered = localList.filter((item) => item.id !== id);
  saveStoredMedia(filtered);

  try {
    await supabase.from("media_library").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase delete table error:", err);
  }
}
