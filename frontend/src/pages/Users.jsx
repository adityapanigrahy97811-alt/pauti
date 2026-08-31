import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  Shield,
  PlusCircle,
  Key,
  UserCheck,
  UserX,
  Edit2,
  X,
  Lock,
  User,
  Mail,
  Phone
} from 'lucide-react';

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add User Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('TREASURER');
  const [addLoading, setAddLoading] = useState(false);

  // Reset Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('वापरकर्ते यादी लोड करता आली नाही.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim() || !formPassword) {
      toast.error('नाव, वापरकर्तानाव आणि पासवर्ड आवश्यक आहेत.');
      return;
    }

    try {
      setAddLoading(true);
      const res = await api.post('/users', {
        name: formName.trim(),
        username: formUsername.trim(),
        email: formEmail.trim() || undefined,
        mobile: formMobile.trim() || undefined,
        password: formPassword,
        role: formRole
      });

      if (res.data.success) {
        toast.success(`वापरकर्ता @${res.data.data.username} तयार केला गेला!`);
        setIsAddOpen(false);
        setFormName('');
        setFormUsername('');
        setFormEmail('');
        setFormMobile('');
        setFormPassword('');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'वापरकर्ता तयार करण्यात त्रुटी आली.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.patch(`/users/${user.id}/status`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`वापरकर्ता @${user.username} स्थिती ${nextStatus} केली.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'स्थिती बदलता आली नाही.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('नवीन पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }

    try {
      setResetLoading(true);
      const res = await api.patch(`/users/${selectedUser.id}/reset-password`, {
        newPassword
      });
      if (res.data.success) {
        toast.success(`@${selectedUser.username} चा पासवर्ड रीसेट झाला!`);
        setIsResetOpen(false);
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'पासवर्ड रीसेट करता आला नाही.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-card-gradient border border-amber-500/30 shadow-xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white font-devanagari">
            वापरकर्ते व भूमिका व्यवस्थापन (User Management)
          </h1>
          <p className="text-xs text-gray-400 font-devanagari mt-0.5">
            Admin, Treasurer आणि Collector खाती व परवानग्या
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
        >
          <PlusCircle className="w-4 h-4" />
          + नवीन वापरकर्ता जोडा
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-card-gradient border border-amber-500/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181824] text-amber-300 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">नाव (Name)</th>
                <th className="px-4 py-3.5">वापरकर्तानाव (Username)</th>
                <th className="px-4 py-3.5">भूमिका (Role)</th>
                <th className="px-4 py-3.5">मोबाईल / ईमेल</th>
                <th className="px-4 py-3.5">स्थिती (Status)</th>
                <th className="px-4 py-3.5">शेवटचे लॉगिन</th>
                <th className="px-4 py-3.5 text-right">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white font-devanagari">
                      {u.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-amber-400 font-semibold">
                      @{u.username}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'ADMIN'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : u.role === 'TREASURER'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 font-mono">
                      {u.mobile || u.email || '-'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-[11px]">
                      {u.lastLogin ? formatDateTime(u.lastLogin) : 'कधीच नाही'}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsResetOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white text-[11px] font-semibold transition-colors"
                        title="पासवर्ड रीसेट करा"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        पासवर्ड
                      </button>

                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'निष्क्रिय' : 'सक्रिय'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#161622] border border-amber-500/30 rounded-3xl shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-devanagari mb-4">
              नवीन वापरकर्ता तयार करा (Add New User)
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">पूर्ण नाव *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="उदा. सचिन जाधव"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">वापरकर्तानाव (Username) *</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="उदा. sachin2026"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">प्रारंभिक पासवर्ड *</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">भूमिका (Role) *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400 font-devanagari"
                >
                  <option value="TREASURER">खजिनदार / ऑपरेटर (TREASURER)</option>
                  <option value="ADMIN">मुख्य प्रशासक (ADMIN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 font-devanagari mb-1">मोबाईल</label>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 font-devanagari mb-1">ईमेल</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@org.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F17] border border-gray-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-saffron-sm hover:from-amber-400 hover:to-orange-500 transition-all font-devanagari"
                >
                  {addLoading ? 'तयार करत आहे...' : 'वापरकर्ता जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#161622] border border-amber-500/30 rounded-3xl shadow-2xl p-6">
            <button
              onClick={() => setIsResetOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-devanagari mb-2">
              पासवर्ड रीसेट करा (Reset Password)
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              वापरकर्ता: <span className="text-amber-400 font-bold">@{selectedUser.username}</span> ({selectedUser.name})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 font-devanagari mb-1">
                  नवीन पासवर्ड (New Password) *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="किमान ६ अक्षरे"
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F17] border border-amber-500/30 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
                >
                  {resetLoading ? 'रीसेट होत आहे...' : 'पासवर्ड बदला'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
