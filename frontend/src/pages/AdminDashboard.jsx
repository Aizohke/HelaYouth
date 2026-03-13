import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import {
  getAdminStats, getAdminMembers, updateMemberStatus, updateMemberRole,
  addContribution, getMemberContributions,
  getProjects, createProject, updateProject, deleteProject,
  getEvents, getAllEvents, createEvent, updateEvent, deleteEvent,
  getSiteContent, updateSiteContent,
} from '../services/api';
import { StatCard, LoadingScreen, formatCurrency, formatDate, StatusBadge, Alert, Modal, EmptyState, Spinner } from '../components/shared';
import {
  LayoutDashboard, Users, DollarSign, Briefcase, CalendarDays,
  FileText, Quote, CheckCircle, XCircle, ChevronRight,
  Plus, Trash2, Edit2, Search, AlertCircle, Bell, Receipt
} from 'lucide-react';

// ─── Admin Shell ──────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const tabs = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/members', label: 'Members', icon: Users },
    { to: '/admin/finance', label: 'Finance', icon: DollarSign },
    { to: '/admin/projects', label: 'Projects', icon: Briefcase },
    { to: '/admin/events', label: 'Events', icon: CalendarDays },
    { to: '/admin/content', label: 'Content', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-stone-900">Admin Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Manage members, finances, and content</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>

      <Routes>
        <Route index element={<AdminOverview />} />
        <Route path="members" element={<MembersPanel />} />
        <Route path="finance" element={<FinancePanel />} />
        <Route path="projects" element={<ProjectsPanel />} />
        <Route path="events" element={<EventsPanel />} />
        <Route path="content" element={<ContentPanel />} />
      </Routes>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((r) => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Approved Members" value={stats?.approvedMembers ?? 0} icon={Users} color="brand" />
        <StatCard label="Pending Approvals" value={stats?.pendingApprovals ?? 0} icon={Bell} color="gold"
          subtext={stats?.pendingApprovals > 0 ? 'Needs attention' : 'All clear'} />
        <StatCard label="Total Funds" value={formatCurrency(stats?.totalFunds ?? 0)} icon={DollarSign} color="blue" />
        <StatCard label="This Month" value={formatCurrency(stats?.thisMonthFunds ?? 0)} icon={ChevronRight} color="purple" />
      </div>

      {stats?.pendingApprovals > 0 && (
        <Alert type="warning" title="Pending Approvals">
          {stats.pendingApprovals} member{stats.pendingApprovals !== 1 ? 's' : ''} awaiting approval.{' '}
          <NavLink to="/admin/members" className="underline font-medium">Review now →</NavLink>
        </Alert>
      )}
    </div>
  );
}

// ─── Members Panel ────────────────────────────────────────────────────────────
function MembersPanel() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [contribModal, setContribModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAdminMembers({ search, status: statusFilter });
      setMembers(r.data.members);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await updateMemberStatus(id, status);
      setMsg({ type: 'success', text: `Member ${status} successfully.` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Action failed' });
    } finally { setActionLoading(false); }
  };

  const handleRole = async (id, role) => {
    setActionLoading(true);
    try {
      await updateMemberRole(id, role);
      setMsg({ type: 'success', text: `Role updated to ${role}.` });
      load();
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Action failed' });
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            className="input pl-9"
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="select sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? <LoadingScreen /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Member</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden md:table-cell">Savings</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {members.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-stone-400">No members found</td></tr>
              ) : members.map((m) => (
                <tr key={m._id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-700 text-xs font-bold">{m.firstName?.[0]}{m.lastName?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-800">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-stone-400">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-stone-700 font-mono text-xs">
                    {formatCurrency(m.totalSavings || 0)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-stone-400 text-xs">
                    {formatDate(m.joinedAt, 'short')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {m.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatus(m._id, 'approved')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleStatus(m._id, 'rejected')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {m.status === 'approved' && (
                        <button onClick={() => { setSelected(m); setContribModal(true); }}
                          className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-colors" title="Add Contribution">
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <select
                        value={m.role}
                        onChange={(e) => handleRole(m._id, e.target.value)}
                        className="text-xs border border-stone-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && contribModal && (
        <AddContributionModal
          member={selected}
          onClose={() => { setContribModal(false); setSelected(null); }}
          onSuccess={() => { setMsg({ type: 'success', text: 'Contribution added.' }); setContribModal(false); setSelected(null); }}
        />
      )}
    </div>
  );
}

// ─── Add Contribution Modal ───────────────────────────────────────────────────
function AddContributionModal({ member, onClose, onSuccess }) {
  const [form, setForm] = useState({ amount: '', type: 'monthly', description: '', contributionDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
    setLoading(true);
    try {
      await addContribution({ memberId: member._id, ...form, amount: Number(form.amount) });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add contribution.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open title={`Add Contribution — ${member.firstName} ${member.lastName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Amount (KES)</label>
          <input type="number" min="1" className="input" placeholder="e.g. 1000"
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Type</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="monthly">Monthly</option>
              <option value="special">Special</option>
              <option value="fine">Fine</option>
              <option value="registration">Registration</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Date</label>
            <input type="date" className="input" value={form.contributionDate}
              onChange={(e) => setForm({ ...form, contributionDate: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Description (optional)</label>
          <input type="text" className="input" placeholder="Notes…"
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : 'Add Contribution'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Finance Panel ────────────────────────────────────────────────────────────
function FinancePanel() {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [contribs, setContribs] = useState([]);
  const [loadingContribs, setLoadingContribs] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getAdminMembers({ status: 'approved', limit: 100 })
      .then((r) => setMembers(r.data.members));
  }, []);

  const selectMember = async (m) => {
    setSelected(m);
    setLoadingContribs(true);
    try {
      const r = await getMemberContributions(m._id);
      setContribs(r.data.contributions);
    } finally { setLoadingContribs(false); }
  };

  const typeColors = { monthly: 'brand', special: 'purple', fine: 'red', registration: 'blue' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Member list */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800 text-sm">Select Member</h3>
        </div>
        <div className="divide-y divide-stone-50 max-h-[500px] overflow-y-auto">
          {members.map((m) => (
            <button key={m._id} onClick={() => selectMember(m)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors text-left ${selected?._id === m._id ? 'bg-brand-50' : ''}`}>
              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 text-xs font-bold">{m.firstName?.[0]}{m.lastName?.[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-stone-800">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-stone-400">{formatCurrency(m.totalSavings || 0)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contribution history */}
      <div className="card lg:col-span-2">
        {!selected ? (
          <EmptyState icon={DollarSign} title="Select a member" description="Choose a member to view their contribution history." />
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-stone-100">
              <div>
                <h3 className="font-semibold text-stone-800">{selected.firstName} {selected.lastName}</h3>
                <p className="text-xs text-stone-400">Total: {formatCurrency(contribs.reduce((s, c) => s + c.amount, 0))}</p>
              </div>
              <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-2">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {msg && <div className="px-4 pt-3"><Alert type={msg.type}>{msg.text}</Alert></div>}
            {loadingContribs ? <LoadingScreen /> : (
              <div className="divide-y divide-stone-50 max-h-[400px] overflow-y-auto">
                {contribs.length === 0
                  ? <EmptyState icon={Receipt} title="No contributions" description="No entries recorded yet." />
                  : contribs.map((c) => (
                    <div key={c._id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-stone-800">{formatCurrency(c.amount)}</p>
                        <p className="text-xs text-stone-400">{formatDate(c.contributionDate)} · {c.type} · #{c.receiptNumber}</p>
                      </div>
                      <StatusBadge status={c.type} />
                    </div>
                  ))
                }
              </div>
            )}
          </>
        )}
      </div>

      {selected && showAdd && (
        <AddContributionModal
          member={selected}
          onClose={() => setShowAdd(false)}
          onSuccess={async () => {
            setShowAdd(false);
            setMsg({ type: 'success', text: 'Contribution added.' });
            const r = await getMemberContributions(selected._id);
            setContribs(r.data.contributions);
          }}
        />
      )}
    </div>
  );
}

// ─── Projects Panel ───────────────────────────────────────────────────────────
function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | project_obj
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    getProjects().then((r) => setProjects(r.data.projects)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      setMsg({ type: 'success', text: 'Project deleted.' });
      load();
    } catch { setMsg({ type: 'error', text: 'Failed to delete.' }); }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="flex justify-end">
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>
      {loading ? <LoadingScreen /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <div className="md:col-span-2"><EmptyState icon={Briefcase} title="No projects yet" description="Create your first project." /></div>
          ) : projects.map((p) => (
            <div key={p._id} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-stone-800 text-sm">{p.title}</h4>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(p)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-xs text-stone-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <span>{formatCurrency(p.raisedAmount)} / {formatCurrency(p.targetAmount)}</span>
                <span className="ml-auto font-semibold text-brand-600">{p.progressPercentage}%</span>
              </div>
              <div className="mt-1.5 w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${p.progressPercentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      {modal && (
        <ProjectModal
          project={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); load(); setMsg({ type: 'success', text: 'Project saved.' }); }}
        />
      )}
    </div>
  );
}

function ProjectModal({ project, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    targetAmount: project?.targetAmount || '',
    raisedAmount: project?.raisedAmount || 0,
    status: project?.status || 'planning',
    category: project?.category || 'other',
    isPublic: project?.isPublic !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (project) {
        await updateProject(project._id, form);
      } else {
        await createProject(form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open title={project ? 'Edit Project' : 'New Project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Description</label>
          <textarea className="input h-24 resize-none" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Target (KES)</label>
            <input type="number" min="0" className="input" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Raised (KES)</label>
            <input type="number" min="0" className="input" value={form.raisedAmount} onChange={(e) => setForm({ ...form, raisedAmount: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Status</label>
            <select className="select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="planning">Planning</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Category</label>
            <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['investment', 'welfare', 'education', 'community', 'other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Events Panel ─────────────────────────────────────────────────────────────
function EventsPanel() {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    getAllEvents().then((r) => setEvents(r.data.events || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await deleteEvent(id); setMsg({ type: 'success', text: 'Event deleted.' }); load(); }
    catch { setMsg({ type: 'error', text: 'Failed to delete.' }); }
  };

  return (
    <div className="space-y-4">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}
      <div className="flex justify-end">
        <button onClick={() => setModal('create')} className="btn-primary"><Plus className="w-4 h-4" /> New Event</button>
      </div>
      {loading ? <LoadingScreen /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {events.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-stone-400">No events yet</td></tr>
              ) : events.map((ev) => (
                <tr key={ev._id} className="hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800">{ev.title}</p>
                    <p className="text-xs text-stone-400">{ev.location || 'TBA'}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-stone-600 text-xs">{formatDate(ev.eventDate)}</td>
                  <td className="px-4 py-3 hidden md:table-cell"><StatusBadge status={ev.type} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setModal(ev)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(ev._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && (
        <EventModal
          event={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); load(); setMsg({ type: 'success', text: 'Event saved.' }); }}
        />
      )}
    </div>
  );
}

function EventModal({ event, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    location: event?.location || '',
    type: event?.type || 'meeting',
    isOnline: event?.isOnline || false,
    isPublic: event?.isPublic !== false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (event) { await updateEvent(event._id, form); }
      else { await createEvent(form); }
      onSuccess();
    } catch (err) { setError(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open title={event ? 'Edit Event' : 'New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error">{error}</Alert>}
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Title</label>
          <input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Date</label>
            <input type="date" className="input" required value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Type</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['meeting', 'event', 'workshop', 'social', 'deadline'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Location</label>
          <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Physical location or 'Online'" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Description</label>
          <textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Spinner size="sm" /> : event ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Content Panel ────────────────────────────────────────────────────────────
function ContentPanel() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [hero, setHero] = useState({ title: '', subtitle: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    Promise.all([getSiteContent('quote_of_week'), getSiteContent('hero_content')]).then(([q, h]) => {
      if (q.data.content) setQuote(q.data.content);
      if (h.data.content) setHero(h.data.content);
    }).finally(() => setLoading(false));
  }, []);

  const save = async (key, value) => {
    setSaving(true);
    try {
      await updateSiteContent(key, value);
      setMsg({ type: 'success', text: 'Saved successfully!' });
      setTimeout(() => setMsg(null), 3000);
    } catch { setMsg({ type: 'error', text: 'Save failed.' }); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 max-w-2xl">
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* Hero Content */}
      <div className="card p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" /> Hero Section
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Headline</label>
            <input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} placeholder="Building Wealth, Community & Legacy" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Subtitle</label>
            <textarea className="input h-20 resize-none" value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          </div>
          <button onClick={() => save('hero_content', hero)} disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : 'Save Hero Content'}
          </button>
        </div>
      </div>

      {/* Quote of the Week */}
      <div className="card p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Quote className="w-4 h-4 text-brand-600" /> Quote of the Week
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Quote Text</label>
            <textarea className="input h-24 resize-none" value={quote.text} onChange={(e) => setQuote({ ...quote, text: e.target.value })} placeholder="The secret to getting ahead…" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1.5 uppercase tracking-wide">Author</label>
            <input className="input" value={quote.author} onChange={(e) => setQuote({ ...quote, author: e.target.value })} placeholder="e.g. Warren Buffett" />
          </div>
          <button onClick={() => save('quote_of_week', quote)} disabled={saving} className="btn-primary">
            {saving ? <Spinner size="sm" /> : 'Save Quote'}
          </button>
        </div>
      </div>
    </div>
  );
}


