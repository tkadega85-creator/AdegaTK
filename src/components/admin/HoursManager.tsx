import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { BusinessDayHours } from '../../types';
import { Clock, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

export const HoursManager: React.FC = () => {
  const { store, updateBusinessHours, updateStore, isStoreCurrentlyOpen } = useStore();

  const [hours, setHours] = useState<BusinessDayHours[]>(store.businessHours);
  const [override, setOverride] = useState<'auto' | 'open' | 'closed'>(
    store.isOpenOverride === true ? 'open' : store.isOpenOverride === false ? 'closed' : 'auto'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleDay = (dayIndex: number) => {
    setHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, isOpen: !h.isOpen } : h))
    );
  };

  const handleTimeChange = (dayIndex: number, field: 'openTime' | 'closeTime', val: string) => {
    setHours((prev) =>
      prev.map((h, i) => (i === dayIndex ? { ...h, [field]: val } : h))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessHours(hours);
    updateStore({
      isOpenOverride: override === 'open' ? true : override === 'closed' ? false : null,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Horários de Funcionamento
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure a grade semanal e o controle de abertura e fechamento da loja
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Urgent Override Switch */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Status Atual no Site:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isStoreCurrentlyOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {isStoreCurrentlyOpen ? '🟢 ABERTO' : '🔴 FECHADO'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Você pode forçar a loja a ficar aberta ou fechada em caso de feriado ou imprevisto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOverride('auto')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                override === 'auto'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Automático (Segue horários abaixo)
            </button>

            <button
              type="button"
              onClick={() => setOverride('open')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                override === 'open'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🟢 Forçar ABERTO Agora
            </button>

            <button
              type="button"
              onClick={() => setOverride('closed')}
              className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                override === 'closed'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🔴 Forçar FECHADO Agora
            </button>
          </div>
        </div>

        {/* Weekly Schedule Table */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white">
            Grade Semanal de Atendimento
          </h2>

          <div className="space-y-2.5">
            {hours.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                  day.isOpen
                    ? 'bg-slate-950/70 border-slate-800'
                    : 'bg-slate-950/30 border-slate-850 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${day.isOpen ? 'text-white' : 'text-slate-500'}`}>
                    {day.dayName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {day.isOpen ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Abre às:</span>
                        <input
                          type="time"
                          value={day.openTime}
                          onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Fecha às:</span>
                        <input
                          type="time"
                          value={day.closeTime}
                          onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-rose-400 font-semibold">
                      Loja fechada o dia todo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Horários Atualizados!' : 'Salvar Todos os Horários'}
          </button>
        </div>
      </form>
    </div>
  );
};
