import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl } from "@/lib/site";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadSiteImage(file: File, folder: string) {
  if (!ACCEPTED.includes(file.type.toLowerCase())) {
    throw new Error("Only JPG, JPEG, PNG or WebP images are allowed");
  }
  if (file.size > MAX_BYTES) throw new Error("Image must be 5MB or smaller");

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]+/g, "-").replace(/-+$/g, "") || "misc";
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new Error("Image storage is not set up yet. Please run the storage setup once, then try again.");
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
  const { data: publicData } = supabase.storage.from("site-images").getPublicUrl(path);
  const publicUrl = publicData.publicUrl;
  if (!publicUrl) throw new Error("Image uploaded but no public image URL was returned");

  await new Promise<void>((resolve, reject) => {
    const probe = new Image();
    probe.onload = () => resolve();
    probe.onerror = () =>
      reject(new Error("The image uploaded, but the saved image URL could not be loaded. Please try again."));
    probe.src = publicUrl;
  });

  return publicUrl;
}

type Props = {
  /** Current stored value: a storage path or an external URL. */
  value?: string | null;
  /** Called with the new stored value (storage path) or null when removed. */
  onChange: (value: string | null) => void;
  folder: string;
  label?: string;
  className?: string;
};

export function ImageUploader({ value, onChange, folder, label = "Image", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const current = mediaUrl(value);
  const [currentImageError, setCurrentImageError] = useState(false);
  const shown = preview ?? current;

  function pick(file?: File | null) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type.toLowerCase())) {
      toast.error("Only JPG, JPEG, PNG or WebP images are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 5MB or smaller");
      return;
    }
    setCurrentImageError(false);
    setPending(file);
    setPreview(URL.createObjectURL(file));
  }

  function cancel() {
    setPending(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function save() {
    if (!pending) return;
    setBusy(true);
    try {
      const path = await uploadSiteImage(pending, folder);
      onChange(path);
      cancel();
      toast.success("Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted/40">
        {shown && !currentImageError ? (
          <img
            src={shown}
            alt={label}
            className="h-40 w-full object-cover"
            onLoad={() => setCurrentImageError(false)}
            onError={() => {
              if (preview) {
                setCurrentImageError(true);
                return;
              }
              if (value && !/^https?:\/\//i.test(value) && !value.startsWith("data:")) {
                const fallback = `/api/public/media/${value.replace(/^\/+/, "")}`;
                const probe = new Image();
                probe.onload = () => {
                  setCurrentImageError(false);
                };
                probe.onerror = () => setCurrentImageError(true);
                probe.src = fallback;
              } else {
                setCurrentImageError(true);
              }
            }}
          />
        ) : (
          <div className="flex h-40 items-center justify-center px-4 text-center text-xs text-muted-foreground">
            {shown ? "Image could not be loaded. Try uploading it again." : "No image yet"}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImagePlus className="mr-1.5 size-4" />
          {value ? "Replace image" : "Upload image"}
        </Button>
        {pending ? (
          <>
            <Button type="button" size="sm" onClick={save} disabled={busy}>
              {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              Save image
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={cancel} disabled={busy}>
              <X className="mr-1.5 size-4" /> Cancel
            </Button>
          </>
        ) : null}
        {value && !pending ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            <Trash2 className="mr-1.5 size-4 text-destructive" /> Remove
          </Button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">JPG, JPEG, PNG or WebP · up to 5MB.</p>
    </div>
  );
}
