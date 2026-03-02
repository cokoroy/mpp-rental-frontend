import { useState, useEffect, useCallback } from 'react';
import {
    Plus, MessageCircle, Clock, Tag, AlertCircle,
    ChevronRight, Trash2, Send, X, ArrowLeft, Filter,
} from 'lucide-react';
import supportService from '../services/supportService';
import { Toast } from './Toast';
import { useAuth } from '../context/AuthContext';

// ============================================================
// CREATE TICKET MODAL
// ============================================================
function CreateTicketModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        ticketTitle: '',
        ticketDescription: '',
        ticketCategory: '',
        ticketPriority: 'LOW',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!form.ticketTitle.trim()) { setError('Title is required'); return; }
        if (!form.ticketDescription.trim()) { setError('Description is required'); return; }
        if (!form.ticketCategory) { setError('Please select a category'); return; }

        setLoading(true);
        setError('');
        try {
            await supportService.createTicket(form);
            onSuccess();
        } catch (err) {
            setError(err || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">New Support Ticket</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Brief summary of your issue"
                            value={form.ticketTitle}
                            onChange={(e) => setForm({ ...form, ticketTitle: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.ticketCategory}
                                onChange={(e) => setForm({ ...form, ticketCategory: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="">Select category</option>
                                {supportService.CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{supportService.formatCategory(cat)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                            <select
                                value={form.ticketPriority}
                                onChange={(e) => setForm({ ...form, ticketPriority: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                {supportService.PRIORITIES.map((p) => (
                                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Describe your issue in detail..."
                            value={form.ticketDescription}
                            onChange={(e) => setForm({ ...form, ticketDescription: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// DELETE CONFIRM MODAL
// ============================================================
function DeleteTicketModal({ ticket, onClose, onConfirm, loading }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Delete Ticket</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-gray-700 mb-6">
                    Are you sure you want to delete <span className="font-medium">"{ticket?.ticketTitle}"</span>?
                </p>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// TICKET DETAIL VIEW
// ============================================================
function TicketDetailView({ ticketId, onBack, onDeleted }) {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

    const showToast = (type, message) => setToast({ isVisible: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, isVisible: false }));

    const fetchTicket = useCallback(async () => {
        try {
            const data = await supportService.getMyTicketById(ticketId);
            setTicket(data);
        } catch {
            showToast('error', 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => { fetchTicket(); }, [fetchTicket]);

    const handleSendReply = async () => {
        if (!replyMessage.trim()) return;
        setSending(true);
        try {
            const updated = await supportService.replyToTicket(ticketId, replyMessage.trim());
            setTicket(updated);
            setReplyMessage('');
            showToast('success', 'Reply sent successfully');
        } catch (err) {
            showToast('error', err || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await supportService.deleteTicket(ticketId);
            onDeleted();
        } catch (err) {
            showToast('error', err || 'Failed to delete ticket');
            setShowDeleteModal(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    const canReply = ticket.ticketStatus !== 'RESOLVED';
    const canDelete = ticket.ticketStatus === 'OPEN';

    return (
        <>
            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />
            {showDeleteModal && (
                <DeleteTicketModal
                    ticket={ticket}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    loading={deleteLoading}
                />
            )}

            <div className="space-y-6">
                {/* Back + Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <button onClick={onBack} className="mt-0.5 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{ticket.ticketTitle}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Submitted {supportService.formatTimeAgo(ticket.createdAt)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${supportService.getStatusStyle(ticket.ticketStatus)}`}>
                            {supportService.formatStatus(ticket.ticketStatus)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${supportService.getPriorityStyle(ticket.ticketPriority)}`}>
                            {ticket.ticketPriority.charAt(0) + ticket.ticketPriority.slice(1).toLowerCase()} Priority
                        </span>
                    </div>
                </div>

                {/* Ticket Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Tag className="w-4 h-4" />
                        <span>{supportService.formatCategory(ticket.ticketCategory)}</span>
                        <span className="text-gray-300">·</span>
                        <Clock className="w-4 h-4" />
                        <span>{supportService.formatDateTime(ticket.createdAt)}</span>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{ticket.ticketDescription}</p>
                    </div>
                    {canDelete && (
                        <div className="pt-2 border-t border-gray-100">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Ticket
                            </button>
                        </div>
                    )}
                </div>

                {/* Conversation Thread */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Responses ({ticket.responses?.length || 0})
                        </h3>
                    </div>

                    <div className="p-6 space-y-4">
                        {(!ticket.responses || ticket.responses.length === 0) ? (
                            <div className="text-center py-8">
                                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No responses yet. MPP will get back to you soon.</p>
                            </div>
                        ) : (
                            ticket.responses.map((resp) => {
                                const isMe = resp.senderId === user?.userId;
                                const isMPP = resp.senderCategory === 'MPP';
                                return (
                                    <div key={resp.responseId} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                                            isMPP ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {resp.senderName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {isMe ? 'You' : resp.senderName}
                                                </span>
                                                {isMPP && (
                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">MPP</span>
                                                )}
                                                <span className="text-xs text-gray-400">{supportService.formatTimeAgo(resp.createdAt)}</span>
                                            </div>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                isMe
                                                    ? 'bg-purple-600 text-white rounded-tr-sm'
                                                    : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                            }`}>
                                                {resp.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {canReply ? (
                        <div className="px-6 pb-6">
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                                <textarea
                                    rows={3}
                                    placeholder="Type your reply..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none"
                                />
                                <div className="flex justify-end px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyMessage.trim() || sending}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                        {sending ? 'Sending...' : 'Send Reply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 pb-6">
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-700">This ticket has been resolved. No further replies are needed.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ============================================================
// TICKET CARD (List Item)
// ============================================================
function TicketCard({ ticket, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${supportService.getStatusStyle(ticket.ticketStatus)}`}>
                            {supportService.formatStatus(ticket.ticketStatus)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${supportService.getPriorityStyle(ticket.ticketPriority)}`}>
                            {ticket.ticketPriority.charAt(0) + ticket.ticketPriority.slice(1).toLowerCase()} Priority
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {supportService.formatCategory(ticket.ticketCategory)}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{ticket.ticketTitle}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{ticket.ticketDescription}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{supportService.formatTimeAgo(ticket.createdAt)}</span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-1" />
            </div>
        </button>
    );
}

// ============================================================
// MAIN BOSUPPORT COMPONENT
// ============================================================
export function BOSupport() {
    const [allTickets, setAllTickets] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all' });
    const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

    const showToast = (type, message) => setToast({ isVisible: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, isVisible: false }));

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supportService.getMyTickets();
            const list = Array.isArray(data) ? data : [];
            setAllTickets(list);
            setTickets(list);
        } catch (err) {
            console.error('Failed to load tickets:', err);
            setAllTickets([]);
            setTickets([]);
            showToast('error', 'Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // Apply filters client-side
    useEffect(() => {
        let filtered = [...allTickets];
        if (filters.status !== 'all') filtered = filtered.filter((t) => t.ticketStatus === filters.status);
        if (filters.priority !== 'all') filtered = filtered.filter((t) => t.ticketPriority === filters.priority);
        if (filters.category !== 'all') filtered = filtered.filter((t) => t.ticketCategory === filters.category);
        setTickets(filtered);
    }, [filters, allTickets]);

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        showToast('success', 'Support ticket submitted successfully');
        fetchTickets();
    };

    const handleDeleted = () => {
        setSelectedTicketId(null);
        showToast('success', 'Ticket deleted successfully');
        fetchTickets();
    };

    // ── Ticket Detail View ──
    if (selectedTicketId) {
        return (
            <div>
                <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />
                <TicketDetailView
                    ticketId={selectedTicketId}
                    onBack={() => setSelectedTicketId(null)}
                    onDeleted={handleDeleted}
                />
            </div>
        );
    }

    // ── Ticket List View ──
    return (
        <>
            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />

            {showCreateModal && (
                <CreateTicketModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support</h1>
                    <p className="text-gray-500 text-sm mt-1">Submit and track your support requests</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Question
                </button>
            </div>

            {/* Filter Bar */}
            {allTickets.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500 font-medium">Filter:</span>
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    >
                        <option value="all">All Status</option>
                        {supportService.STATUSES.map((s) => (
                            <option key={s} value={s}>{supportService.formatStatus(s)}</option>
                        ))}
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    >
                        <option value="all">All Priority</option>
                        {supportService.PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
                    >
                        <option value="all">All Category</option>
                        {supportService.CATEGORIES.map((c) => (
                            <option key={c} value={c}>{supportService.formatCategory(c)}</option>
                        ))}
                    </select>
                    {(filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all') && (
                        <button
                            onClick={() => setFilters({ status: 'all', priority: 'all', category: 'all' })}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    )}
                </div>
            )}

            {/* Ticket List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : allTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-purple-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No support tickets yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Have a question or issue? Submit a support ticket and our team will help you.</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Question
                    </button>
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                        <Filter className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No tickets match your filters</h3>
                    <button
                        onClick={() => setFilters({ status: 'all', priority: 'all', category: 'all' })}
                        className="mt-3 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <TicketCard
                            key={ticket.ticketId}
                            ticket={ticket}
                            onClick={() => setSelectedTicketId(ticket.ticketId)}
                        />
                    ))}
                </div>
            )}
        </>
    );
}