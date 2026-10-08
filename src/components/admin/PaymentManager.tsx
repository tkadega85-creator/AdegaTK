import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { CreditCard, QrCode, Banknote, ShieldCheck } from 'lucide-react';

export const PaymentManager: React.FC = () => {
  const { store, updatePayments } = useStore();

  const [pix, setPix] = useState(store.payments.pix);
  const [cash, setCash] = useState(store.payments.cash);
  const [creditCard, setCreditCard] = useState(store.payments.creditCard);
  const [debitCard, setDebitCard] = useState(store.payments.debitCard);
  const [pixKey, setPixKey] = useState(store.payments.pixKey);
  const [pixKeyType, setPixKeyType] = useState(store.payments.pixKeyType);
  const [pixReceiverName, setPixReceiverName] = useState(store.payments.pixReceiverName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayments({
      pix,
      cash,
      creditCard,
      debitCard,
      pixKey: pixKey.trim(),
      pixKeyType,
      pixReceiverName: pixReceiverName.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Formas de Pagamento
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Habilite os métodos de pagamento aceitos no checkout e configure seus dados de recebimento via PIX
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Methods Toggles */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white">
            Métodos Aceitos no Pedido
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PIX */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">PIX Instantâneo</h3>
                  <p className="text-[11px] text-slate-400">Pagamento antecipado com chave copia e cola</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={pix}
                onChange={(e) => setPix(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 cursor-pointer"
              />
            </div>

            {/* Dinheiro */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Dinheiro Físico</h3>
                  <p className="text-[11px] text-slate-400">Permite ao cliente solicitar troco na entrega</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={cash}
                onChange={(e) => setCash(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 cursor-pointer"
              />
            </div>

            {/* Cartão de Crédito */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cartão de Crédito</h3>
                  <p className="text-[11px] text-slate-400">Maquininha levada pelo motoboy</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={creditCard}
                onChange={(e) => setCreditCard(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 cursor-pointer"
              />
            </div>

            {/* Cartão de Débito */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cartão de Débito</h3>
                  <p className="text-[11px] text-slate-400">Maquininha levada pelo motoboy</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={debitCard}
                onChange={(e) => setDebitCard(e.target.checked)}
                className="w-5 h-5 rounded text-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* PIX Key Configuration */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4 text-xs text-slate-200">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Dados da Chave PIX</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Tipo de Chave PIX
              </label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="telefone">Telefone / Celular</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Chave PIX *
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Ex: tkadega85@gmail.com ou 11987654321"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Nome do Titular / Razão Social
              </label>
              <input
                type="text"
                required
                value={pixReceiverName}
                onChange={(e) => setPixReceiverName(e.target.value)}
                placeholder="Ex: AdegaTK Distribuidora LTDA"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Ao selecionar PIX, o cliente verá essa chave com um botão direto para cópia e confirmação no WhatsApp.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Configurações Salvas!' : 'Salvar Formas de Pagamento'}
          </button>
        </div>
      </form>
    </div>
  );
};
