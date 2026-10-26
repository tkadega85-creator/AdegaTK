import React, { useState, useEffect } from 'react';
import { useStore } from '../../services/storeContext';
import { MapPin, Phone, Instagram, Clock, Download, ShieldCheck, Heart } from 'lucide-react';

interface StoreFooterProps {
  onOpenAdminLogin: () => void;
}

export const StoreFooter: React.FC<StoreFooterProps> = ({ onOpenAdminLogin }) => {
  const { store } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      const promptEvent = deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const cleanPhone = store.whatsappNumber.replace(/\D/g, '');

  return (
    <footer className="mt-16 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs">
      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-750 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="text-3xl">📱</div>
            <h3 className="text-base font-extrabold text-white">Como instalar no seu celular</h3>
            <div className="text-left text-xs text-slate-300 space-y-2.5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <p>
                <strong className="text-amber-400">Android / Chrome:</strong> Toque no menu (três pontinhos no topo) e escolha <em>"Adicionar à tela inicial"</em> ou <em>"Instalar aplicativo"</em>.
              </p>
              <p>
                <strong className="text-sky-400">iPhone / Safari:</strong> Toque no botão de <em>Compartilhar</em> (ícone com quadrado e seta para cima) e selecione <em>"Adicionar à Tela de Início"</em>.
              </p>
            </div>
            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* PWA Banner if not installed */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border-b border-slate-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <div>
              <p className="font-bold text-slate-200">
                Instale o App da {store.name} no seu celular!
              </p>
              <p className="text-[11px] text-slate-400">
                Acesse o cardápio mais rápido com ícone direto na sua tela inicial.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-transform active:scale-95 shadow-md cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstalled ? 'App Instalado' : 'Instalar Aplicativo'}</span>
          </button>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Store Bio */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-white tracking-tight">
              {store.name || 'Adega'}
            </span>
          </div>
          {store.description && (
            <p className="text-slate-400 text-xs leading-relaxed">
              {store.description}
            </p>
          )}
          <div className="flex items-center gap-3 pt-2">
            {cleanPhone ? (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-colors"
                title="WhatsApp Comercial"
              >
                <Phone className="w-4 h-4" />
              </a>
            ) : null}
            {store.instagram ? (
              <a
                href={`https://instagram.com/${store.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/50 flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors"
                title={`Instagram ${store.instagram}`}
              >
                <Instagram className="w-4 h-4" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Col 2: Endereço & Contato */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">
            Localização & Contato
          </h4>
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              {store.address ? (
                <>
                  {store.address}{store.neighborhood ? `, ${store.neighborhood}` : ''}<br />
                  {store.city ? `${store.city} - ${store.state}` : ''} {store.zipCode ? `• CEP: ${store.zipCode}` : ''}
                </>
              ) : (
                'Endereço a ser configurado no painel'
              )}
            </span>
          </div>
          {store.phone && (
            <p className="flex items-center gap-2 text-slate-300 pt-1">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{store.phone}</span>
            </p>
          )}
          {store.instagram && (
            <p className="flex items-center gap-2 text-slate-300">
              <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
              <span>{store.instagram}</span>
            </p>
          )}
        </div>

        {/* Col 3: Horários */}
        <div className="space-y-2">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Horários de Funcionamento</span>
          </h4>
          <div className="space-y-1 text-slate-400 text-[11px]">
            {store.businessHours.slice(0, 4).map((h) => (
              <div key={h.dayOfWeek} className="flex justify-between">
                <span>{h.dayName}:</span>
                <span className="text-slate-300">{h.isOpen ? `${h.openTime} às ${h.closeTime}` : 'Fechado'}</span>
              </div>
            ))}
            <div className="pt-1 border-t border-slate-800/80">
              {store.businessHours.slice(4).map((h) => (
                <div key={h.dayOfWeek} className="flex justify-between font-semibold text-amber-400">
                  <span>{h.dayName}:</span>
                  <span>{h.isOpen ? `${h.openTime} às ${h.closeTime}` : 'Fechado'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 4: Informações e Acesso Restrito */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Segurança & Pagamentos</span>
          </h4>
          <p className="text-xs text-slate-400">
            Aceitamos PIX, Cartão de Crédito, Débito e Dinheiro. Pagamento seguro no balcão da adega ou chave PIX direta.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-amber-400 font-semibold text-xs transition-colors cursor-pointer"
            >
              <span>⚙️ Acesso Administrativo (Lojista)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-900 py-4 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {store.name} — Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-1">
            <span>Feito com</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>para adegas e distribuidoras de alto desempenho</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
