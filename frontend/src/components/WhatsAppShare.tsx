// ============================================================
// WhatsAppShare.tsx
// HOW TO USE:
//   1. Copy into src/components/
//   2. Import in your DiagnosisResult screen:
//        import WhatsAppShare from './components/WhatsAppShare';
//   3. Pass the diagnosis object (from Gemini response):
//        <WhatsAppShare diagnosis={diagnosisResult} lang="kn" />
//
// The button opens WhatsApp with a pre-filled message containing
// crop name, disease, confidence, severity, and recommended treatment.
// Works on mobile (opens WA app) and desktop (opens web.whatsapp.com).
// ============================================================
import React from 'react';

type DiagnosisResult = {
  crop?: string;
  disease?: string;
  confidence?: number;
  severity?: string;
  symptoms?: string[];
  treatments?: {
    organic?: { name: string; dosage?: string }[];
    chemical?: { name: string; dosage?: string }[];
  };
};

export default function WhatsAppShare({ diagnosis, lang = "en" }: { diagnosis: DiagnosisResult | null | undefined, lang?: string }) {
  if (!diagnosis) return null;

  function buildMessage() {
    const {
      crop = "Unknown crop",
      disease = "Unknown disease",
      confidence,
      severity,
      symptoms = [],
      treatments,
    } = diagnosis;

    const confText = confidence != null ? `${Math.round(confidence * 100)}%` : "N/A";
    const sevText = severity || "N/A";

    // Pick first recommended treatment (organic preferred)
    const rec =
      treatments?.organic?.[0] ||
      treatments?.chemical?.[0] ||
      null;
    const treatLine = rec
      ? `Recommended: ${rec.name}${rec.dosage ? ` (${rec.dosage})` : ""}`
      : "";

    const messages: Record<string, string> = {
      en: `🌾 *AgroCare AI – Crop Diagnosis Report*

*Crop:* ${crop}
*Disease:* ${disease}
*Confidence:* ${confText}
*Severity:* ${sevText}
${symptoms.length ? `*Symptoms:* ${symptoms.slice(0, 3).join(", ")}` : ""}
${treatLine ? `\n*${treatLine}*` : ""}

_Please advise on the best course of action. Diagnosed using AgroCare AI._`,

      hi: `🌾 *AgroCare AI – फसल निदान रिपोर्ट*

*फसल:* ${crop}
*रोग:* ${disease}
*विश्वसनीयता:* ${confText}
*गंभीरता:* ${sevText}
${symptoms.length ? `*लक्षण:* ${symptoms.slice(0, 3).join(", ")}` : ""}
${treatLine ? `\n*${treatLine}*` : ""}

_कृपया सर्वोत्तम उपाय की सलाह दें। AgroCare AI द्वारा निदान।_`,

      kn: `🌾 *AgroCare AI – ಬೆಳೆ ರೋಗನಿರ್ಣಯ ವರದಿ*

*ಬೆಳೆ:* ${crop}
*ರೋಗ:* ${disease}
*ವಿಶ್ವಾಸ:* ${confText}
*ತೀವ್ರತೆ:* ${sevText}
${symptoms.length ? `*ಲಕ್ಷಣಗಳು:* ${symptoms.slice(0, 3).join(", ")}` : ""}
${treatLine ? `\n*${treatLine}*` : ""}

_ದಯವಿಟ್ಟು ಉತ್ತಮ ಕ್ರಮದ ಬಗ್ಗೆ ಸಲಹೆ ನೀಡಿ। AgroCare AI ಮೂಲಕ ರೋಗನಿರ್ಣಯ।_`,
    };

    return (messages[lang] || messages.en).trim();
  }

  function handleShare() {
    const message = buildMessage();
    const encoded = encodeURIComponent(message);
    // On mobile → opens WA app; on desktop → opens web.whatsapp.com
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Also expose a "Share to KVK officer" variant with a pre-filled number
  function handleShareKVK() {
    // Replace with your district KVK WhatsApp number (with country code, no +/spaces)
    const KVK_NUMBER = "919448228991"; // Example: KVK Bangalore Rural
    const message = buildMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${KVK_NUMBER}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const btnLabels: Record<string, { share: string, kvk: string }> = {
    en: { share: "Share Diagnosis", kvk: "Send to KVK Officer" },
    hi: { share: "निदान साझा करें", kvk: "KVK अधिकारी को भेजें" },
    kn: { share: "ರೋಗನಿರ್ಣಯ ಹಂಚಿಕೊಳ್ಳಿ", kvk: "KVK ಅಧಿಕಾರಿಗೆ ಕಳುಹಿಸಿ" },
  };
  const bl = btnLabels[lang] || btnLabels.en;

  return (
    <div className="flex flex-col gap-2 mt-4">
      {/* General share */}
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1ebe5d] active:scale-95 text-white font-semibold text-sm py-3 rounded-2xl transition-all shadow-sm"
      >
        {/* WhatsApp icon */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.136 1.535 5.875L.057 23.273a.75.75 0 00.92.92l5.398-1.478A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 01-4.952-1.348l-.355-.211-3.685 1.007 1.007-3.685-.211-.355A9.73 9.73 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        {bl.share}
      </button>

      {/* KVK Officer shortcut */}
      <button
        onClick={handleShareKVK}
        className="flex items-center justify-center gap-2 w-full bg-white border border-[#25D366] hover:bg-green-50 active:scale-95 text-green-700 font-semibold text-sm py-3 rounded-2xl transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] flex-shrink-0">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.135.561 4.136 1.535 5.875L.057 23.273a.75.75 0 00.92.92l5.398-1.478A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 01-4.952-1.348l-.355-.211-3.685 1.007 1.007-3.685-.211-.355A9.73 9.73 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
        </svg>
        {bl.kvk}
      </button>
    </div>
  );
}
