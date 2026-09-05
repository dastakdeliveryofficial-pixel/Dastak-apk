import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Smartphone, Check, X, ShieldCheck, 
  ExternalLink, Copy, CheckCircle2,
  Zap, ArrowDownToLine, Package, FileCode,
  Info, QrCode, Share2, MessageCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const { triggerToast, platformSettings } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct_apk' | 'qr_code' | 'webapk' | 'guide'>('direct_apk');

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  // The public shared URL accessible by external bots and mobile devices without login gates
  const publicAppUrl = 'https://ais-pre-afcgfr3ntyfizrivxvygom-258996629880.asia-southeast1.run.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicAppUrl)}`;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(publicAppUrl)}`;
  const webToAppUrl = `https://www.webtoapp.design/free-app-creator?url=${encodeURIComponent(publicAppUrl)}`;
  const appsGeyserUrl = `https://appsgeyser.com/create-url-app/`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    'Salam! Install Dastak Delivery Matli Android App: ' + publicAppUrl
  )}`;

  const manifestJsonString = JSON.stringify({
    "id": "pk.dastakdelivery.matli",
    "name": "Dastak Delivery Matli | دستک ڈیلیوری",
    "short_name": "Dastak",
    "description": "Fast Food, Biryani, Karahi & Grocery Delivery in Matli, Sindh.",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#FFF5F8",
    "theme_color": "#E11D74",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  }, null, 2);

  const handleInstallWebApk = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        triggerToast('App Added', 'Dastak Delivery installed on your home screen!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      triggerToast('Android Installation', 'Tap the 3 dots (⋮) in Chrome and select "Install app" or "Add to Home screen"', 'info');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    triggerToast('Link Copied', 'App public URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJsonString);
    setCopiedManifest(true);
    triggerToast('Manifest Copied', 'Web Manifest JSON copied to clipboard!', 'success');
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-pink-200 shadow-2xl space-y-4 my-6 text-gray-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-[#E11D74] to-[#C2185B] text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  Android APK & App Package
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> PWA Ready
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
                Dastak Delivery Android .APK فائل
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-pink-50/60 p-1 rounded-2xl border border-pink-100 text-xs font-bold">
          <button
            onClick={() => setActiveTab('direct_apk')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'direct_apk'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 1-Click APK
          </button>
          <button
            onClick={() => setActiveTab('qr_code')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'qr_code'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📱 QR اسکین
          </button>
          <button
            onClick={() => setActiveTab('webapk')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'webapk'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚡ کروم انسٹال
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'guide'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📖 گائیڈ
          </button>
        </div>

        {/* TAB 1: 1-Click APK Generators */}
        {activeTab === 'direct_apk' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-[12px] text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>تمام مینی فیسٹ اور آئیکنز (512px) لائیو فعال ہیں!</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                نیچے دیے گئے ٹولز سے آپ بغیر کسی پیچیدگی کے اپنے لائیو لنک سے فوری .APK فائل حاصل کر سکتے ہیں:
              </p>
            </div>

            {/* APK Generator Options */}
            <div className="space-y-2.5">
              {/* Option 1: WebToApp (Instant direct APK generator) */}
              <a
                href={webToAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold p-3 rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">1. WebToApp (Direct .APK Download)</span>
                    <span className="text-[10px] text-emerald-100 font-normal">لنک ڈالے بغیر سیدھی .apk فائل بنائیں اور ڈاؤنلوڈ کریں</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Option 2: PWABuilder (Official Microsoft PWA to APK) */}
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-linear-to-r from-[#E11D74] via-[#D81B60] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-extrabold p-3 rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <ArrowDownToLine className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">2. PWABuilder (Microsoft Android Package)</span>
                    <span className="text-[10px] text-pink-100 font-normal">Package for Stores &rarr; Android APK / AAB پیکیج</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Option 3: AppsGeyser */}
              <a
                href={appsGeyserUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gray-900 hover:bg-black text-white font-extrabold p-3 rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">3. AppsGeyser (Free Web-to-APK)</span>
                    <span className="text-[10px] text-gray-300 font-normal">مفت میں چند سیکنڈ میں .apk فائل تیار کریں</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Public App URL'}</span>
              </button>

              <a
                href={whatsappShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Send to WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: QR Code Scan */}
        {activeTab === 'qr_code' && (
          <div className="space-y-3.5 text-xs text-center">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 flex flex-col items-center space-y-3">
              <span className="font-black text-gray-900 text-sm">
                موبائل سے QR کوڈ اسکین کریں
              </span>
              <p className="text-gray-600 text-[11px] max-w-xs">
                اپنے اینڈرائیڈ موبائل کا کیمرہ یا گوگل لینز کھول کر اس QR کوڈ پر رکھیں اور 1-کلک میں انسٹال کریں۔
              </p>

              {/* QR Image */}
              <div className="p-3 bg-white rounded-2xl border-2 border-pink-200 shadow-sm inline-block">
                <img 
                  src={qrCodeUrl} 
                  alt="Dastak Delivery Mobile Install QR Code"
                  className="w-44 h-44 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-2 pt-1 w-full">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اپنے واٹس ایپ پر لنک بھیجیں</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="bg-white hover:bg-pink-50 text-gray-800 border border-pink-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Fast WebAPK Chrome Install */}
        {activeTab === 'webapk' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
              <span className="font-extrabold text-gray-900 text-sm block">
                کروم ویب اے پی کے (WebAPK) کا بہترین طریقہ
              </span>
              <p className="text-gray-700 leading-relaxed text-[11px]">
                اینڈرائیڈ میں گوگل کروم کا بلٹ اِن سسٹم بغیر کسی بیرونی فائل کو ڈاؤنلوڈ کیے، گوگل پلے سروسز کے ذریعے خودکار <strong>WebAPK</strong> بنا دیتا ہے۔
              </p>

              <div className="space-y-2 bg-white p-3 rounded-xl border border-pink-100 text-[11px] text-gray-800">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E11D74] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <span>موبائل کروم میں Dastak کا لنک کھولیں۔</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E11D74] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <span>اوپر دائیں کونے میں موجود <strong>تین نقطوں (⋮)</strong> پر ٹیپ کریں۔</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E11D74] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <span><strong>"Install app"</strong> یا <strong>"Add to Home screen"</strong> منتخب کریں۔</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">✓</span>
                  <span>ایپ بغیر براؤزر بار کے اصلی موبائل ایپ کی طرح انسٹال ہو جائے گی!</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0 MB سائز (فوری تیز)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>ریئل ٹائم اپڈیٹس</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstallWebApk}
              className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              <span>موبائل میں ابھی انسٹال کریں (Install Now)</span>
            </button>
          </div>
        )}

        {/* TAB 4: Guide & Developer project export */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-sm">
                اینڈرائیڈ اسٹوڈیو / کیپیسیٹر (Android Studio Build)
              </h4>

              <div className="space-y-2 text-gray-800 leading-relaxed text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-[#E11D74] block mb-0.5">پروجیکٹ زپ ڈاؤنلوڈ کریں:</span>
                  <span>اوپر دائیں طرف Settings مینو سے <strong>"Export as ZIP"</strong> یا GitHub پر پش کر سکتے ہیں۔ اس کے بعد Capacitor یا Bubblewrap کے ذریعے <code>npx cap build android</code> چلا کر خام .apk بنائی جا سکتی ہے۔</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-emerald-700 block mb-0.5">سب سے آسان طریقہ:</span>
                  <span>ٹیب 1 میں <strong>WebToApp</strong> یا <strong>PWABuilder</strong> کا بٹن دبائیں۔ وہ کلاؤڈ میں خودکار طریقہ سے پوری اینڈرائیڈ فائل پیک کر کے ڈاؤنلوڈ کے لیے فراہم کر دیتا ہے۔</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-[11px] flex items-center justify-between">
              <span>مدد کے لیے واٹس ایپ رابطہ:</span>
              <span className="font-bold text-[#E11D74]">{platformSettings.supportWhatsApp}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Verified Android PWA & APK Compatible</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100"
          >
            بند کریں (Close)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
