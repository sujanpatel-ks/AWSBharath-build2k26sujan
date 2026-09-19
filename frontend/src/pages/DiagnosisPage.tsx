import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, X, Loader2, Leaf, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { getPresignedUploadUrl, uploadImageToS3, createDiagnosis } from "@/api/client";
import type { DiagnosisFormValues, GrowthStage } from "@/types";

const GROWTH_STAGES: GrowthStage[] = [
  "Seedling", "Vegetative", "Flowering", "Fruiting", "Harvesting", "Post-Harvest",
];

const COMMON_CROPS = [
  "Arecanut", "Rice", "Wheat", "Cotton", "Sugarcane", "Tomato",
  "Groundnut", "Soybean", "Maize", "Onion", "Chilli", "Banana",
];

const MAX_SIZE_MB = 10;

export default function DiagnosisPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<DiagnosisFormValues>({
    crop: "", location: "", growthStage: "Vegetative", symptoms: "", imageFile: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "uploading" | "analyzing">("form");
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) { toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB`); return; }
    setForm((f) => ({ ...f, imageFile: file }));
    setPreview(URL.createObjectURL(file));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.imageFile) { toast.error("Please select a crop image"); return; }
    if (!form.crop.trim()) { toast.error("Please enter the crop name"); return; }
    if (!form.location.trim()) { toast.error("Please enter your location"); return; }

    try {
      // Step 1: Upload image
      setStep("uploading");
      const { uploadUrl, key } = await getPresignedUploadUrl(
        form.imageFile.name, form.imageFile.type
      );
      await uploadImageToS3(uploadUrl, form.imageFile);

      // Step 2: Run full diagnosis pipeline
      setStep("analyzing");
      const result = await createDiagnosis(key, form);

      navigate(`/diagnosis/${result.diagnosis_id}/result`, { state: { result } });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Diagnosis failed. Please try again.");
      setStep("form");
    }
  }

  const isSubmitting = step !== "form";

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="page-header">Crop Diagnosis</h1>
        <p className="page-subheader">Upload a photo and tell us about your crop</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <label className="field-label">Crop Photo <span className="text-red-500">*</span></label>
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={clsx(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors",
                dragOver ? "border-agro-500 bg-agro-50" : "border-gray-300 hover:border-agro-400 hover:bg-gray-50"
              )}
              role="button" aria-label="Upload crop image"
            >
              <div className="w-14 h-14 rounded-full bg-agro-100 flex items-center justify-center">
                <Camera className="w-7 h-7 text-agro-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Tap to upload or drag a photo</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max {MAX_SIZE_MB}MB</p>
              </div>
              <button type="button" className="btn-secondary text-xs px-4 py-2">
                <Upload className="w-3.5 h-3.5" /> Choose File
              </button>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden ring-1 ring-gray-200">
              <img src={preview} alt="Crop preview" className="w-full h-56 object-cover" />
              <button type="button" onClick={() => { setPreview(null); setForm((f) => ({ ...f, imageFile: null })); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                aria-label="Remove image">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Crop name */}
        <div>
          <label className="field-label">Crop Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <input list="crop-list" className="field-input pr-8" placeholder="e.g. Arecanut, Rice, Tomato"
              value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))} required />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <datalist id="crop-list">
            {COMMON_CROPS.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        {/* Location */}
        <div>
          <label className="field-label">Farm Location <span className="text-red-500">*</span></label>
          <input className="field-input" placeholder="e.g. Karnataka, Maharashtra, Punjab"
            value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} required />
        </div>

        {/* Growth stage */}
        <div>
          <label className="field-label">Growth Stage</label>
          <div className="flex flex-wrap gap-2">
            {GROWTH_STAGES.map((stage) => (
              <button key={stage} type="button"
                onClick={() => setForm((f) => ({ ...f, growthStage: stage }))}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                  form.growthStage === stage
                    ? "bg-agro-600 text-white border-agro-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-agro-400"
                )}>
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label className="field-label">Observed Symptoms <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea className="field-input resize-none" rows={3}
            placeholder="Describe what you see: yellowing leaves, wilting, spots, discoloration…"
            value={form.symptoms} onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))} />
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-base">
          {step === "form" && <><Leaf className="w-5 h-5" /> Analyze Crop</>}
          {step === "uploading" && <><Loader2 className="w-5 h-5 animate-spin" /> Uploading image…</>}
          {step === "analyzing" && <><Loader2 className="w-5 h-5 animate-spin" /> Running AI analysis…</>}
        </button>

        {isSubmitting && (
          <div className="card bg-agro-50 border-agro-200 text-sm text-agro-700 text-center">
            {step === "uploading" && "Uploading your crop image securely to AWS S3…"}
            {step === "analyzing" && (
              <div className="space-y-1">
                <p className="font-medium">Amazon Bedrock is analysing your crop</p>
                <p className="text-xs text-agro-600">Claude Haiku → Knowledge Base → Safety Check → Recommendation</p>
                <p className="text-xs text-gray-400 mt-1">This typically takes 15–30 seconds</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
