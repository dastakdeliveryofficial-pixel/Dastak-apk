import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Smartphone, Check, X, ShieldCheck, 
  ExternalLink, Copy, CheckCircle2,
  Zap, ArrowDownToLine, Package, FileCode,
  Info, Sparkles
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

  // Use the public shared URL which is accessible by external bots like PWABuilder
  const publicAppUrl = 'https://ais-pre-afcgfr3ntyfizrivxvygom-258996629880.asia-southeast1.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(publicAppUrl)}`;
  const webToAppUrl = `https://www.webtoapp.design/free-app-creator?url=${encodeURIComponent(publicAppUrl)}`;
  const appsGeyserUrl = `https://appsgeyser.com/create-url-app/`;

  const manifestJsonString = JSON.stringify({
    "id": "/?source=pwa",
    "name": "Dastak Delivery Matli | دستک ڈیلیوری",
    "short_name": "Dastak",
    "description": "Fast Food, Biryani, Karahi & Grocery Delivery in Matli, Sindh. Order now from top restaurants with fast doorstep delivery.",
    "start_url": "/",
    "scope": "/",
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
      triggerToast('Android Installation', 'Tap the 3 dots in Chrome and select "Install app" or "Add to Home screen"', 'info');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopiedLink(true);
    triggerToast('Link Copied', 'App public URL copied! You can paste in PWABuilder or WebToApp.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJsonString);
    setCopiedManifest(true);
    triggerToast('Manifest Copied', 'Web Manifest JSON copied to clipboard!', 'success');
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([manifestJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Manifest Downloaded', 'manifest.json saved to your device', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-pink-200 shadow-2xl space-y-4 my-6 text-gray-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E11D74] to-[#C2185B] text-white flex items-center justify-center shadow-md shadow-pink-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E11D74] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                  Android APK Generator
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 100% PWA Ready
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight mt-0.5">
                Download Dastak Delivery Android .APK
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
            📦 Direct .APK Tools
          </button>
          <button
            onClick={() => setActiveTab('web_install')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'web_install'
                ? 'bg-[#E11D74] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚡ Fast Chrome Install
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

        {/* TAB 1: Real .APK Generation */}
        {activeTab === 'real_apk' && (
          <div className="space-y-3.5 text-xs">
            {/* Explanatory Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[12px] text-amber-950">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>PWABuilder کا مسئلہ کیسے حل کریں؟</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                پہلے PWABuilder پرائیویٹ ڈویلپمنٹ لنک کی وجہ سے مینی فیسٹ نہیں پڑھ پا رہا تھا۔ اب ہم نے <strong>پبلک لنک اور تمام آئیکنز (192px/512px)</strong> سیٹ کر دیے ہیں۔ نیچے دیے گئے بٹن سے پبلک لنک کے ساتھ PWABuilder یا WebToApp سے 1-کلک میں .APK حاصل کریں۔
              </p>
            </div>

            {/* APK Generator Options */}
            <div className="space-y-2">
              <span className="font-bold text-gray-800 block text-[11px] uppercase tracking-wider">
                Select 1-Click APK Generator:
              </span>

              {/* Option 1: WebToApp (Instant direct APK generator) */}
              <a
                href={webToAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold p-3 rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">1. WebToApp (Instant .APK Download)</span>
                    <span className="text-[10px] text-emerald-100 font-normal">بغیر کسی ایرر کے فوری .apk فائل ڈاؤنلوڈ کریں</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Option 2: PWABuilder (Official Microsoft PWA to APK) */}
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-[#E11D74] via-[#D81B60] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-extrabold p-3 rounded-2xl shadow-sm flex items-center justify-between transition-transform active:scale-[0.99] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <ArrowDownToLine className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">2. PWABuilder (Package for Android)</span>
                    <span className="text-[10px] text-pink-100 font-normal">Package for Stores &rarr; Android APK</span>
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
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-sm block">3. AppsGeyser (Free APK Builder)</span>
                    <span className="text-[10px] text-gray-300 font-normal">URL پیسٹ کر کے فوری .apk بنائیں</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
            </div>

            {/* Quick Action Tools */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleCopyLink}
                className="bg-pink-50 hover:bg-pink-100 text-pink-900 border border-pink-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Public App URL'}</span>
              </button>

              <button
                onClick={handleCopyManifest}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedManifest ? <Check className="w-4 h-4 text-emerald-600" /> : <FileCode className="w-4 h-4" />}
                <span>{copiedManifest ? 'JSON Copied!' : 'Copy Manifest JSON'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Fast Web Install */}
        {activeTab === 'web_install' && (
          <div className="space-y-3.5 text-xs">
            <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-200 space-y-2.5">
              <span className="font-extrabold text-gray-900 text-sm block">
                Instant Android Home Screen App
              </span>
              <p className="text-gray-600 leading-relaxed">
                بغیر کسی فائل کو ڈاؤنلوڈ کیے، اپنے فون پر فوری 1-کلک انسٹال کریں۔ یہ فل اسکرین بغیر ایڈریس بار کے ایپ کی طرح کھلتی ہے۔
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
              className="w-full bg-[#E11D74] hover:bg-[#C2185B] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md text-xs flex items-center justify-center gap-2"
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
                PWABuilder کا ایرر کیسے دور ہوا؟
              </h4>

              <div className="space-y-2 text-gray-800 leading-relaxed text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-[#E11D74] block mb-0.5">1. پبلک لنک (Public URL):</span>
                  <span>PWABuilder پرائیویٹ ڈیولپمنٹ لنک کو اسکین نہیں کر پاتا تھا کیونکہ اس پر گوگل لاگ ان کا گارڈ تھا۔ اب ہم نے پبلک لنک کنیکٹ کر دیا ہے جس پر مینی فیسٹ اور آئیکنز مکمل 100% ویلیڈیٹ ہو جائیں گے۔</span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-pink-100">
                  <span className="font-bold text-emerald-700 block mb-0.5">2. WebToApp کا آسان طریقہ:</span>
                  <span>اگر آپ کو فوری .apk چاہیے تو پہلے ٹیب میں موجود <strong>"WebToApp"</strong> بٹن دبائیں، وہ بغیر کسی سیٹنگ کے سیدھی .apk فائل بنا کر ڈاؤنلوڈ کر دیتا ہے۔</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-gray-600 text-[11px] flex items-center justify-between">
              <span>مدد کے لیے واٹس ایپ:</span>
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
