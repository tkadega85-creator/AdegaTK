import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { Store, Phone, MapPin, Instagram, Globe } from 'lucide-react';

export const StoreInfoManager: React.FC = () => {
  const { store, updateStore } = useStore();

  const [name, setName] = useState(store.name);
  const [slogan, setSlogan] = useState(store.slogan);
  const [description, setDescription] = useState(store.description);
  const [phone, setPhone] = useState(store.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsappNumber);
  const [instagram, setInstagram] = useState(store.instagram);
  const [address, setAddress] = useState(store.address);
  const [neighborhood, setNeighborhood] = useState(store.neighborhood);
  const [city, setCity] = useState(store.city);
  const [state, setState] = useState(store.state);
  const [zipCode, setZipCode] = useState(store.zipCode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore({
      name: name.trim(),
      slogan: slogan.trim(),
      description: description.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim(),
      instagram: instagram.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Dados da Loja & WhatsApp
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Altere informações de contato, endereço físico e o número de WhatsApp que recebe os pedidos dos clientes
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs text-slate-200">
        {/* Identificação Geral */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-amber-500" />
            <span>Identificação do Estabelecimento</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Nome da Loja / Adega *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Slogan Comercial *
              </label>
              <input
                type="text"
                required
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Descrição Institucional
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* WhatsApp & Redes Sociais */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp do Atendimento & Contatos</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-emerald-400 block mb-1">
                WhatsApp com DDI e DDD (Apenas Números) *
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="5511987654321"
                className="w-full bg-slate-950 border border-emerald-800/60 focus:border-emerald-500 rounded-xl px-3 py-2 text-emerald-300 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Ex: 5511999998888 (com 55 do Brasil)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Telefone Fixo / Comercial
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Instagram (@perfil)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Endereço Físico */}
        <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Endereço da Adega</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-300 block mb-1">
                Logradouro (Rua, Av, Número) *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Bairro *
              </label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Cidade</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-300 block mb-1">CEP</label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition-colors cursor-pointer"
          >
            {savedSuccess ? 'Dados Atualizados com Sucesso!' : 'Salvar Dados da Loja'}
          </button>
        </div>
      </form>
    </div>
  );
};
