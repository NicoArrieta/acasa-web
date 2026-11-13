import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// This endpoint supports direct local upload into /public/uploads
// AND provides FTP connectivity to DonWeb when FTP credentials are provided.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const ftpHost = formData.get("ftpHost") as string | null;
    const ftpUser = formData.get("ftpUser") as string | null;
    const ftpPassword = formData.get("ftpPassword") as string | null;
    const ftpRemoteDir = formData.get("ftpRemoteDir") as string | null;
    const publicUrlPrefix = formData.get("publicUrlPrefix") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const cleanName = `${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-")}`;

    // If FTP credentials are provided, try uploading to DonWeb via basic-ftp
    if (ftpHost && ftpUser && ftpPassword) {
      try {
        const ftp = await import("basic-ftp");
        const client = new ftp.Client();
        client.ftp.verbose = false;

        await client.access({
          host: ftpHost,
          user: ftpUser,
          password: ftpPassword,
          port: 21,
          secure: false,
        });

        const targetDir = ftpRemoteDir || "/public_html/uploads";
        await client.ensureDir(targetDir);

        // Upload buffer
        const stream = require("stream");
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        await client.uploadFrom(bufferStream, `${targetDir}/${cleanName}`);
        client.close();

        const fileUrl = publicUrlPrefix
          ? `${publicUrlPrefix.replace(/\/$/, "")}/${cleanName}`
          : `https://${ftpHost}/uploads/${cleanName}`;

        return NextResponse.json({
          success: true,
          mode: "donweb_ftp",
          url: fileUrl,
          filename: cleanName,
        });
      } catch (ftpError: any) {
        console.warn("FTP upload failed, falling back to local storage:", ftpError.message);
      }
    }

    // Local storage fallback (saves into public/uploads)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, cleanName);
    fs.writeFileSync(filePath, buffer);

    const localUrl = `/uploads/${cleanName}`;

    return NextResponse.json({
      success: true,
      mode: "local",
      url: localUrl,
      filename: cleanName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Error procesando el archivo" }, { status: 500 });
  }
}
