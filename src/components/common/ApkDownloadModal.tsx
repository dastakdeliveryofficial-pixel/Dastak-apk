import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Smartphone, Check, X, ShieldCheck, 
  ExternalLink, Copy, CheckCircle2,
  Zap, ArrowDownToLine, Globe, Package, FileCode,
  Sparkles, HelpCircle
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
  const [activeTab, setActiveTab] = useState<'real_apk' | 'web_install' | 'guide'>('real_apk');

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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://dastakdelivery.pk';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`;

  const handleInstallWebApk = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        triggerToast('App Added', 'Dastak Delivery installed on your home screen!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      triggerToast('Android Installation', 'Tap the 3 dots in Chrome and tap "Install app" or "Add to Home screen"', 'info');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    triggerToast('Link Copied', 'App URL copied! You can paste in Chrome or APK Generator.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleGenerateRealApk = () => {
    window.open(pwaBuilderUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadAppBundle = () => {
    const manifestData = {
      name: "Dastak Delivery Matli",
      short_name: "Dastak",
      description: "Fast Food, Biryani & Grocery Delivery in Matli, Sindh",
      start_url: "/",
      display: "standalone",
      background_color: "#FFF5F8",
      theme_color: "#E11D74",
      version: "2.4.0",
      target_platform: "Android (APK / AAB)",
      package_name: "pk.dastakdelivery.matli"
    };

    const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dastak-delivery-android-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Config Downloaded', 'Android APK configuration package saved', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full p-6 border border-pink-200 shadow-2xl space-y-5 my-8 text-gray-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E11D74] to-[#C2185B] text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  Android APK Package
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Standalone App
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight mt-0.5">
                Download Dastak Delivery APK
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
            onClick={() => setActiveTab('real_apk')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'real_apk'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Direct .APK File
          </button>
          <button
            onClick={() => setActiveTab('web_install')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'web_install'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚡ Fast Web Install
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'guide'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📖 گائیڈ (اردو / سنڌي)
          </button>
        </div>

        {/* TAB 1: Direct .APK Generation & Download */}
        {activeTab === 'real_apk' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-pink-50 via-rose-50/40 to-amber-50/30 p-4 rounded-2xl border border-pink-200/80 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-pink-950 text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#E11D74]" />
                  <span>خالص Android .APK فائل ڈاؤنلوڈ</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                  Ready to Package
                </span>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-xs">
                کروم براؤزر عام طور پر صرف شارٹ کٹ ایڈ کرتا ہے۔ اگر آپ کو اپنے موبائل میں انسٹال کرنے کے لیے <strong>خالص .apk فائل ڈاؤنلوڈ</strong> کرنی ہے، تو آپ نیچے دیے گئے بٹن سے 10 سیکنڈ میں آفیشل سائنڈ اینڈرائیڈ پیکیج ڈاؤنلوڈ کر سکتے ہیں۔
              </p>

              <div className="bg-white/90 p-3 rounded-xl border border-pink-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span className="font-bold">App Name:</span>
                  <span className="text-gray-900 font-bold">Dastak Delivery Matli</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span className="font-bold">Target File:</span>
                  <span className="text-pink-700 font-mono font-bold">dastak-delivery.apk</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-600">
                  <span className="font-bold">Compatibility:</span>
                  <span className="text-emerald-700 font-bold">Android 7.0 to Android 15+</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2.5">
              <button
                onClick={handleGenerateRealApk}
                className="w-full bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <ArrowDownToLine className="w-5 h-5 animate-bounce" />
                <span>Download Real .APK File (PWABuilder)</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy App URL'}</span>
                </button>

                <button
                  onClick={handleDownloadAppBundle}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Download Android Package Config"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Fast Web Install */}
        {activeTab === 'web_install' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5">
              <span className="font-extrabold text-gray-900 text-sm block">
                Instant Android Home Screen App
              </span>
              <p className="text-gray-600 leading-relaxed">
                بغیر کسی فائل کو ڈاؤنلوڈ کیے، اپنے فون پر فوری 1-کلک انسٹال کریں۔ یہ بغیر کسی لیگ کے فل اسکرین کھلتی ہے۔
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-semibold text-gray-700">
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0 MB Storage used</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto Updates</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstallWebApk}
              className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Add to Android Home Screen</span>
            </button>
          </div>
        )}

        {/* TAB 3: Urdu / Sindhi Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-sm">
                .APK فائل بنانے اور ڈاؤنلوڈ کرنے کا طریقہ:
              </h4>

              <div className="space-y-2.5 text-gray-800 leading-relaxed">
                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-[#E11D74] block mb-0.5">طریقہ 1 (خالص .APK فائل):</span>
                  <span className="text-[11px] text-gray-600">
                    پہلے ٹیب میں موجود <strong>"Download Real .APK File"</strong> بٹن پر کلک کریں۔ وہ صفحہ کھلتے ہی <strong>"Package for Android"</strong> پر کلک کریں، آپ کے فون میں خالص .apk فائل ڈاؤنلوڈ ہو جائے گی جسے آپ اوپن کر کے انسٹال کر سکتے ہیں۔
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-emerald-700 block mb-0.5">سنڌي ۾ طريقيڪار:</span>
                  <span className="text-[11px] text-gray-600">
                    پهرين ٽيب تي وڃي <strong>"Download Real .APK File"</strong> تي ڪلڪ ڪريو. اتي <strong>"Package for Android"</strong> بٽڻ دٻايو، توهان جي موبائل ۾ اصل .apk فائيل ڊائونلوڊ ٿي ويندي جنهن کي اوهان فائيل مئنيجر مان انسٽال ڪري سگهو ٿا.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-[11px] flex items-center justify-between">
              <span>مدد کے لیے رابطہ:</span>
              <span className="font-bold text-[#E11D74]">{platformSettings.supportWhatsApp}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-pink-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Safe & Verified for Matli, Sindh</span>
          </div>
          <button
            onClick={onClose}
            className="font-bold text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-xl hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
