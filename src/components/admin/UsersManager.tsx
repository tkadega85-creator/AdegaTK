import React, { useState } from 'react';
import { useStore } from '../../services/storeContext';
import { AdminUser, Role, UserPermissions } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  KeyRound,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Lock
} from 'lucide-react';

function generateSecureRandomPassword(length = 24): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join('');
}

export const UsersManager: React.FC = () => {
  const { adminUsers, addUser, updateUser, deleteUser, currentUser, changePassword } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('gerente');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Custom permissions
  const [canManageCatalog, setCanManageCatalog] = useState(true);
  const [canManageOrders, setCanManageOrders] = useState(true);
  const [canManageFinances, setCanManageFinances] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canManageSettings, setCanManageSettings] = useState(false);

  // Password generator feedback
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // Self password change state
  const [myNewPassword, setMyNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('gerente');
    const securePass = generateSecureRandomPassword(22);
    setPassword(securePass);
    setIsActive(true);
    setCanManageCatalog(true);
    setCanManageOrders(true);
    setCanManageFinances(false);
    setCanManageUsers(false);
    setCanManageSettings(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPassword('');
    setIsActive(user.isActive);
    const perms = user.permissions || {
      canManageCatalog: user.role === 'admin' || user.role === 'gerente',
      canManageOrders: true,
      canManageFinances: user.role === 'admin',
      canManageUsers: user.role === 'admin',
      canManageSettings: user.role === 'admin',
    };
    setCanManageCatalog(perms.canManageCatalog);
    setCanManageOrders(perms.canManageOrders);
    setCanManageFinances(perms.canManageFinances);
    setCanManageUsers(perms.canManageUsers);
    setCanManageSettings(perms.canManageSettings);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleGenerateNewPassword = () => {
    const generated = generateSecureRandomPassword(24);
    setPassword(generated);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || !email.trim()) {
      setFormError('Nome e e-mail são obrigatórios.');
      return;
    }

    if (!editingUser && (!password || password.length < 8)) {
      setFormError('A senha inicial deve ter no mínimo 8 caracteres.');
      return;
    }

    const permissions: UserPermissions = {
      canManageCatalog,
      canManageOrders,
      canManageFinances,
      canManageUsers,
      canManageSettings,
    };

    const payload: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      isActive,
      permissions,
    };

    if (password.trim()) {
      payload.password = password.trim();
    }

    if (editingUser) {
      updateUser(editingUser.id, payload);
    } else {
      addUser(payload);
    }

    setIsModalOpen(false);
  };

  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myNewPassword || myNewPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'A senha deve ter no mínimo 8 caracteres para segurança.' });
      return;
    }
    const res = await changePassword(myNewPassword);
    if (res.success) {
      setPasswordFeedback({ type: 'success', message: 'Sua senha foi alterada com sucesso no sistema!' });
      setMyNewPassword('');
      setTimeout(() => setPasswordFeedback(null), 3500);
    } else {
      setPasswordFeedback({ type: 'error', message: res.error || 'Erro ao alterar senha.' });
    }
  };

  const roleLabels: Record<Role, { label: string; badge: string; desc: string }> = {
    admin: {
      label: 'Administrador Geral / Dono',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      desc: 'Acesso irrestrito a configurações, DRE financeiro, catálogo e operadores',
    },
    gerente: {
      label: 'Gerente Operacional',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      desc: 'Gestão completa do catálogo de bebidas, estoque e acompanhamento de pedidos',
    },
    atendente: {
      label: 'Atendente de Balcão / Caixa',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      desc: 'Operação de atendimento, status de pedidos e envio de mensagens WhatsApp',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Controle de Acesso RBAC & Segurança</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Contas Administrativas & Operadores
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de contas independentes com controle de privilégios e senhas criptografadas
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Administrador</span>
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Nome do Operador</th>
                <th className="p-3.5">E-mail de Login</th>
                <th className="p-3.5">Nível / Perfil</th>
                <th className="p-3.5">Permissões Específicas</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {adminUsers.map((user) => {
                const isOwner = user.email.toLowerCase() === 'tkadega85@gmail.com';
                const r = roleLabels[user.role] || roleLabels.atendente;
                const perms = user.permissions;

                return (
                  <tr key={user.id} className="hover:bg-slate-850/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-750 flex items-center justify-center text-amber-400 font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isOwner && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-slate-950">
                              Proprietário
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">ID: {user.id}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{user.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${r.badge}`}>
                        {r.label}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400">
                      {isOwner ? (
                        <span className="text-emerald-400 font-bold">Acesso Total Irrestrito</span>
                      ) : perms ? (
                        <div className="flex flex-wrap gap-1">
                          {perms.canManageCatalog && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">Catálogo</span>}
                          {perms.canManageOrders && <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px]">Pedidos</span>}
                          {perms.canManageFinances && <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-[9px]">Financeiro</span>}
                          {perms.canManageUsers && <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 text-[9px]">Usuários</span>}
                        </div>
                      ) : (
                        <span>Padrão do cargo</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        disabled={isOwner}
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          user.isActive
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-slate-800 text-slate-500'
                        } ${isOwner ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        {user.isActive ? 'Ativo' : 'Bloqueado'}
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
                        {!isOwner && (
                          <button
                            onClick={() => {
                              if (confirm(`Remover acesso de "${user.name}" (${user.email})?`)) {
                                deleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Conta"
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

      {/* Alterar Minha Senha */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="font-extrabold text-base text-white">Alterar Minha Senha de Acesso</h2>
            <p className="text-xs text-slate-400">Atualize sua senha de administrador para maior segurança</p>
          </div>
        </div>

        {passwordFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              passwordFeedback.type === 'success'
                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/50 text-rose-300 border border-rose-800/60'
            }`}
          >
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleChangeMyPassword} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="password"
            required
            placeholder="Digite a nova senha (mínimo 8 caracteres)..."
            value={myNewPassword}
            onChange={(e) => setMyNewPassword(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer shrink-0"
          >
            Atualizar Senha
          </button>
        </form>
      </div>

      {/* Modal Add / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-extrabold text-base text-white">
                {editingUser ? 'Editar Administrador / Operador' : 'Cadastrar Novo Administrador'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-950/50 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs text-slate-200">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo (Gerente)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  disabled={editingUser?.email === 'tkadega85@gmail.com'}
                  placeholder="operador@adegatk.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              {/* Password Generator for 20+ chars secure passwords */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 block">
                    {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso Segura *'}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewPassword}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Senha Forte (24 caracteres)</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required={!editingUser}
                    placeholder={editingUser ? 'Manter senha atual' : 'Senha segura'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-750 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none"
                  />
                  {password && (
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      title="Copiar senha gerada"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPassword ? 'Copiada!' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-500">
                  Gere senhas de 20+ caracteres com números e símbolos para garantir a segurança da adega.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  disabled={editingUser?.email === 'tkadega85@gmail.com'}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-slate-100 focus:outline-none disabled:opacity-60"
                >
                  <option value="admin">Administrador Geral (Acesso Completo)</option>
                  <option value="gerente">Gerente Operacional (Catálogo & Pedidos)</option>
                  <option value="atendente">Atendente de Balcão (Apenas Pedidos)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">{roleLabels[role]?.desc}</p>
              </div>

              {/* Granular Permissions */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">Permissões do Operador:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={canManageCatalog}
                      onChange={(e) => setCanManageCatalog(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Gerenciar Produtos & Catálogo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={canManageOrders}
                      onChange={(e) => setCanManageOrders(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Gerenciar Pedidos do Balcão</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={canManageFinances}
                      onChange={(e) => setCanManageFinances(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Acesso ao Painel Financeiro & DRE</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={canManageUsers}
                      onChange={(e) => setCanManageUsers(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Gerenciar Outros Usuários</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                  <input
                    type="checkbox"
                    checked={isActive}
                    disabled={editingUser?.email === 'tkadega85@gmail.com'}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Conta Ativa (permite login no painel)</span>
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
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
