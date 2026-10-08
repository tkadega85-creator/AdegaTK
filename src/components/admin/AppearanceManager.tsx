import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Palette, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

export const AppearanceManager: React.FC = () => {
  const { store, updateAppearance } = useStore();

  const [theme, setTheme] = useState(store.appearance.theme);
  const [primaryColor, setPrimaryColor] = useState(store.appearance.primaryColor);
  const [logoUrl, setLogoUrl] = useState(store.appearance.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(store.appearance.bannerUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const themePresets = [
    {
      id: 'dark-amber',
      name: 'Modern Amber (Padrão)',
      desc: 'Visual moderno com toques dourados ambarinos, ideal para adegas e baladas',
      color: '#f59e0b',
      banner: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 'luxury-gold',
      name: 'Luxury Gold & Black',
      desc: 'Sofisticação e contraste para adegas de vinhos finos e destilados nobres',
      color: '#eab308',
      banner: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 'neon-night',
      name: 'Night Neon Cyber',
      desc: 'Visual de conveniência noturna 24h e balada com toques elétricos',
      color: '#8b5cf6',
      banner: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1400&auto=format&fit=crop&q=80',
    },
    {
      id: 'emerald-craft',
      name: 'Emerald Cervejaria',
      desc: 'Verde puro malte inspirado em grandes marcas de cerveja como Heineken',
      color: '#10b981',
      banner: 'https://images.unsplash.com/photo-1618886614638-80e3c153d31a?w=1400&auto=format&fit=crop&q=80',
    },
  ];

  const handleApplyPreset = (preset: typeof themePresets[0]) => {
    setTheme(preset.id as any);
    setPrimaryColor(preset.color);
    setBannerUrl(preset.banner);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppearance({
      theme: theme as any,
      primaryColor,
      logoUrl: logoUrl.trim(),
      bannerUrl: bannerUrl.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Personalização Visual & Aparência
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajuste as cores, logotipo, banner promocional e tema estético da sua loja
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-200">
        {/* Presets Grid */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Temas Visuais Pré-Configurados</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themePresets.map((preset) => {
              const isSelected = theme === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-950 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: preset.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-black" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm">{preset.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Assets (Logo & Banner) */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>Imagens Principais (Logotipo e Banner)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                URL do Logotipo da Loja
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
              {logoUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800"
                  />
                  <span className="text-[11px] text-slate-500">Preview do logo</span>
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                URL do Banner Hero Principal
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
              {bannerUrl && (
                <div className="mt-2">
                  <img
                    src={bannerUrl}
                    alt="Banner Preview"
                    className="w-full h-16 rounded-xl object-cover border border-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Aparência Atualizada com Sucesso!' : 'Salvar Aparência'}
          </button>
        </div>
      </form>
    </div>
  );
};
