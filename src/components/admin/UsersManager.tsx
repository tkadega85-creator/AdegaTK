import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { AdminUser, Role } from '../../types';
import { Users, Plus, Edit2, Trash2, Shield, UserCheck, KeyRound } from 'lucide-react';

export const UsersManager: React.FC = () => {
  const { adminUsers, addUser, updateUser, deleteUser, currentUser } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('atendente');
  const [isActive, setIsActive] = useState(true);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('atendente');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.isActive);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive,
    };

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser(payload);
    }

    setIsModalOpen(false);
  };

  const roleLabels: Record<Role, { label: string; badge: string; desc: string }> = {
    admin: {
      label: 'Administrador Geral',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Acesso total a todas as configurações, financeiro, taxas e usuários',
    },
    gerente: {
      label: 'Gerente da Loja',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      desc: 'Pode gerenciar produtos, combos, categorias e pedidos',
    },
    atendente: {
      label: 'Atendente / Caixa',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      desc: 'Acesso ao fluxo operacional de pedidos e envio de WhatsApp',
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Usuários e Controle de Acesso
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie os operadores do sistema com diferentes níveis de permissão (Admin, Gerente, Atendente)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Operador</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Nome</th>
                <th className="p-3.5">E-mail de Login</th>
                <th className="p-3.5">Nível / Cargo</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {adminUsers.map((user) => {
                const r = roleLabels[user.role];
                return (
                  <tr key={user.id} className="hover:bg-slate-850/40">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 font-black">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{user.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.badge}`}>
                        {r.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                          user.isActive
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {user.isActive ? 'Ativo' : 'Desativado'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {adminUsers.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(`Remover usuário "${user.name}"?`)) {
                                deleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white">
                {editingUser ? 'Editar Operador' : 'Novo Operador'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-200">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  E-mail de Acesso *
                </label>
                <input
                  type="email"
                  required
                  placeholder="operador@adegatk.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nível de Permissão / Cargo
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                >
                  <option value="admin">Administrador Geral (Acesso Completo)</option>
                  <option value="gerente">Gerente (Produtos, Categorias, Pedidos)</option>
                  <option value="atendente">Atendente (Operacional de Pedidos)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{roleLabels[role].desc}</p>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Usuário ativo (permite login)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Salvar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
