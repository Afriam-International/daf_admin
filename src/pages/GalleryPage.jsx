import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import FileUploadModal from "../components/FileUploadModal";
import PageLoader from "../components/PageLoader";
import { galleryService } from "../services/galleryService";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await galleryService.getImages();
      setImages(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const resetUploadState = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      await galleryService.uploadImage(selectedFile, (progressEvent) => {
        const total = progressEvent.total || 1;
        setUploadProgress((progressEvent.loaded / total) * 100);
      });
      setUploadOpen(false);
      resetUploadState();
      await loadImages();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload image");
      setUploading(false);
    }
  };

  const handleDelete = async (publicId) => {
    setBusyId(publicId);
    setError("");

    try {
      await galleryService.deleteImage(publicId);
      await loadImages();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete image");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gallery"
        title="Gallery images"
        description="Manage the images that appear in the DAF app."
        actions={
          <button type="button" onClick={() => setUploadOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white">
            <ImagePlus className="h-4 w-4" />
            Upload image
          </button>
        }
      />

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <PageLoader label="Loading gallery images..." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image) => (
            <article key={image.publicId} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <img src={image.url} alt={image.publicId} className="h-56 w-full object-cover" />
              <div className="space-y-3 p-4">
                <button type="button" onClick={() => handleDelete(image.publicId)} disabled={busyId === image.publicId} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {busyId === image.publicId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <FileUploadModal
        open={uploadOpen}
        title="Upload gallery image"
        description="Select an image to upload to the DAF gallery. Review it first, then upload when you’re ready."
        fileLabel="Choose image file"
        accept="image/*"
        progress={uploadProgress}
        busy={uploading}
        previewUrl={previewUrl}
        selectedFileName={selectedFile?.name || ""}
        onClose={() => {
          if (uploading) return;
          setUploadOpen(false);
          resetUploadState();
        }}
        onFileChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        onClearSelection={() => setSelectedFile(null)}
        onSubmit={handleUpload}
        submitLabel="Upload Image"
        disableSubmit={!selectedFile}
      />
    </div>
  );
}
