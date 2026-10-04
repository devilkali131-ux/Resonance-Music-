import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Users,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Search,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  User,
  LogIn,
  LogOut,
} from 'lucide-react';
import { historyStorage, UserProfile } from '../services/historyStorage';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  recoveryPasscode: string;
  role: 'Owner' | 'Admin' | 'Listener';
  lastLogin: string;
  device: string;
  status: 'Active' | 'Verified';
  offlineDownloadsAllowed: boolean;
}

interface OwnerAccessPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

// Initial registered accounts for recovery & owner dashboard
const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'USR-8921-RS',
    name: 'Rishi Shrivastav',
    email: 'rishi.music@example.com',
    password: 'Rishi@Audio#2026',
    recoveryPasscode: 'REC-RS8921-KEY',
    role: 'Owner',
    lastLogin: 'Just now',
    device: 'Mobile Web App (Android/Chrome)',
    status: 'Verified',
    offlineDownloadsAllowed: true,
  },
  {
    id: 'USR-3419-JS',
    name: 'Jagriti Shrivastav',
    email: 'jagriti.s@example.com',
    password: 'Jagriti*Music99',
    recoveryPasscode: 'REC-JS3419-KEY',
    role: 'Listener',
    lastLogin: '2 hours ago',
    device: 'PWA Standalone (iOS/Safari)',
    status: 'Verified',
    offlineDownloadsAllowed: true,
  },
  {
    id: 'USR-5102-AL',
    name: 'Aaditya Sharma',
    email: 'aaditya.audio@example.com',
    password: 'Aaditya_Stream!42',
    recoveryPasscode: 'REC-AL5102-KEY',
    role: 'Admin',
    lastLogin: 'Yesterday',
    device: 'Desktop Browser (Chrome/Linux)',
    status: 'Verified',
    offlineDownloadsAllowed: true,
  },
];

export const OwnerAccessPortalModal: React.FC<OwnerAccessPortalModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'portal' | 'signin'>('portal');
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    try {
      const stored = localStorage.getItem('veltra_registered_users');
      return stored ? JSON.parse(stored) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Sign in / Switch user form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Security Gate for Owner Verification
  const currentProfile = historyStorage.getUserProfile();
  const isDefaultOwner =
    currentProfile.email === 'devilkali131@gmail.com' ||
    currentProfile.role === 'owner' ||
    currentProfile.role === 'Admin' ||
    (typeof window !== 'undefined' &&
      sessionStorage.getItem('veltra_owner_unlocked') === 'true');

  const [isUnlocked, setIsUnlocked] = useState(isDefaultOwner);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  useEffect(() => {
    if (isDefaultOwner) {
      setIsUnlocked(true);
    }
  }, [isDefaultOwner, isOpen]);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcode.trim().toLowerCase() === 'resonance2026' ||
      passcode.trim() === 'veltra2026' ||
      passcode.trim() === 'admin888' ||
      passcode.trim().toLowerCase() === 'owner'
    ) {
      setIsUnlocked(true);
      sessionStorage.setItem('veltra_owner_unlocked', 'true');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleGenerateRecoveryToken = (user: RegisteredUser) => {
    const recoveryCode = `REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setRecoveryMessage(
      `Full ID & Password Recovery generated for ${user.name} (${user.id}) | Email: ${user.email} | Saved Password: ${user.password || 'Temporary: ' + recoveryCode} | Recovery Token: ${recoveryCode}`
    );
    setCopiedToken(`ID: ${user.id} | Email: ${user.email} | Pass: ${user.password || recoveryCode}`);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  // Instant switch to any user
  const handleSwitchToUser = (user: RegisteredUser) => {
    const initials = user.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    const newProfile: UserProfile = {
      name: user.name,
      email: user.email,
      initials,
      isLoggedIn: true,
      importedPlaylistsCount: 3,
    };

    historyStorage.setUserProfile(newProfile);
    onLoginSuccess(newProfile);
    onClose();
  };

  const handleSignOutToGuest = () => {
    const guest = historyStorage.signOut();
    onLoginSuccess(guest);
    onClose();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;

    setIsLoggingIn(true);
    setTimeout(() => {
      const initials = (loginName.trim() || loginEmail.split('@')[0])
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'US';

      const newProfile: UserProfile = {
        name: loginName.trim() || loginEmail.split('@')[0],
        email: loginEmail.trim(),
        initials,
        isLoggedIn: true,
        importedPlaylistsCount: 2,
      };

      historyStorage.setUserProfile(newProfile);

      // Register or update in user database
      const existing = users.find((u) => u.email === newProfile.email);
      let updatedUsers = [...users];
      if (!existing) {
        const newUser: RegisteredUser = {
          id: `USR-${Math.floor(1000 + Math.random() * 9000)}-${initials}`,
          name: newProfile.name,
          email: newProfile.email,
          password: loginPassword || 'User@Pass2026',
          recoveryPasscode: `REC-${initials}-${Date.now().toString(36).toUpperCase()}`,
          role: 'Listener',
          lastLogin: 'Just now',
          device: 'Current Device',
          status: 'Verified',
          offlineDownloadsAllowed: true,
        };
        updatedUsers = [newUser, ...updatedUsers];
        setUsers(updatedUsers);
        localStorage.setItem('veltra_registered_users', JSON.stringify(updatedUsers));
      }

      onLoginSuccess(newProfile);
      setIsLoggingIn(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      {/* Dark Blur Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity cursor-pointer"
      />

      <div className="relative z-10 w-full max-w-4xl bg-[#090b16] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/95 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Glowing backdrop */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Owner Access & Account Portal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ID & Password Recovery
                </span>
              </div>
              <p className="text-xs text-slate-300">
                View registered users, recover lost IDs/passwords, and switch accounts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/20 hover:border-rose-400/40 shadow-lg transition-all active:scale-90 flex items-center justify-center cursor-pointer group"
            title="Close Portal (Esc)"
          >
            <X className="w-5 h-5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* If locked, prompt for Master Passcode to protect credentials */}
        {!isUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 space-y-5 text-center relative z-10 animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xl shadow-amber-500/20">
              <Shield className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-xl font-extrabold text-white tracking-tight">
                Owner Security Passcode
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                This portal provides full access to view user logins, IDs, and recovery passwords. Enter your Owner Master Passcode to unlock.
              </p>
            </div>

            <form onSubmit={handleVerifyPasscode} className="w-full max-w-sm space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-mono uppercase text-slate-400">
                  Master Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setPasscodeError(false);
                  }}
                  autoFocus
                  placeholder="Enter passcode (e.g. resonance2026)"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-amber-400 text-white text-sm focus:outline-none transition-all placeholder:text-slate-600"
                />
                {passcodeError && (
                  <p className="text-xs text-rose-400 font-semibold">
                    Incorrect master passcode. Try "resonance2026" or "admin888".
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                >
                  Unlock Portal →
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Tab Switcher: Owner User Table vs Direct Switch Account */}
            <div className="flex items-center gap-2 pt-3 pb-2 relative z-10 flex-shrink-0 border-b border-white/[0.06]">
              <button
                onClick={() => setActiveTab('portal')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'portal'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Accounts & Passwords ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('signin')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Switch / Sign In Account</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 relative z-10 scrollbar-none">
          {activeTab === 'portal' ? (
            <>
              {/* Search Bar & Quick Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by ID, name, or email..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Offline Downloads: Only Logged-In Users
                  </span>
                  {currentProfile.isLoggedIn && (
                    <button
                      onClick={handleSignOutToGuest}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sign Out to Guest</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recovery Notification Box */}
              {recoveryMessage && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-start gap-3 text-xs text-cyan-200 animate-fadeIn">
                  <KeyRound className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">ID & Password Recovery Details</p>
                    <p className="text-[11px] text-slate-200 mt-0.5 break-all font-mono">{recoveryMessage}</p>
                  </div>
                  {copiedToken && (
                    <button
                      onClick={() => handleCopy(copiedToken)}
                      className="px-2.5 py-1 rounded bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
              )}

              {/* Registered Users Table with IDs & Passwords */}
              <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-white/[0.02]">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-white/[0.04] text-[11px] font-mono uppercase tracking-wider text-slate-300 border-b border-white/[0.06]">
                  <span className="col-span-3 sm:col-span-3">User & ID</span>
                  <span className="col-span-3 sm:col-span-3">Email Address</span>
                  <span className="col-span-3 sm:col-span-3">Password / Passcode</span>
                  <span className="col-span-3 sm:col-span-3 text-right">Actions</span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {filteredUsers.map((user) => {
                    const isShown = !!showPasswords[user.id];
                    const isCurrent = currentProfile.email === user.email;

                    return (
                      <div
                        key={user.id}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-white/[0.03] transition-colors text-xs ${
                          isCurrent ? 'bg-cyan-500/10' : ''
                        }`}
                      >
                        {/* Name & ID */}
                        <div className="col-span-3 sm:col-span-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 flex-shrink-0">
                              <div className="w-full h-full rounded-full bg-[#0a0c16] flex items-center justify-center font-bold text-[10px] text-cyan-300">
                                {user.name.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate flex items-center gap-1.5">
                                {user.name}
                                {isCurrent && (
                                  <span className="text-[9px] font-mono px-1 rounded bg-cyan-400/20 text-cyan-300">
                                    Active
                                  </span>
                                )}
                              </p>
                              <p className="font-mono text-[10px] text-cyan-400">{user.id}</p>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-span-3 sm:col-span-3 text-slate-300 truncate">
                          <span className="truncate">{user.email}</span>
                          <span className="block text-[10px] text-slate-500 sm:hidden">
                            {user.role}
                          </span>
                        </div>

                        {/* Password / Recovery Passcode */}
                        <div className="col-span-3 sm:col-span-3 font-mono text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate">
                              {isShown ? user.password || user.recoveryPasscode : '••••••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(user.id)}
                              className="p-1 text-slate-400 hover:text-white cursor-pointer"
                              title={isShown ? 'Hide password' : 'Show password'}
                            >
                              {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopy(user.password || user.recoveryPasscode)}
                              className="p-1 text-slate-400 hover:text-cyan-300 cursor-pointer"
                              title="Copy password"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Actions: 1-Click Switch Account + Recover Details */}
                        <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSwitchToUser(user)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold transition-all cursor-pointer"
                            title={`Switch account to ${user.name}`}
                          >
                            Switch
                          </button>
                          <button
                            onClick={() => handleGenerateRecoveryToken(user)}
                            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 text-[11px] transition-all cursor-pointer"
                            title="Generate full recovery key"
                          >
                            Recover
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Switch User / Sign In Form */
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <span className="text-xs font-bold text-white block">
                  Quick 1-Click Switch to Any Registered Account
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {users.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSwitchToUser(acc)}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-cyan-500/20 border border-white/[0.06] hover:border-cyan-400/40 text-left transition-all cursor-pointer group"
                    >
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                        {acc.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</p>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3.5">
                <span className="text-xs font-bold text-white block">
                  Or Log In with Custom Account
                </span>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Rishi Shrivastav"
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. rishi@example.com"
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  {isLoggingIn ? 'Switching Account...' : 'Confirm Switch & Sign In'}
                </button>
              </form>
            </div>
          )}
        </div>
        </>
      )}
      </div>
    </div>
  );
};
