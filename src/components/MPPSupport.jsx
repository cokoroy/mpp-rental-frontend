import { useState, useEffect, useCallback } from 'react';
import {
    MessageCircle, Clock, Tag, AlertCircle,
    ChevronRight, Send, X, ArrowLeft, CheckCircle,
    RotateCcw, Filter, Users,
} from 'lucide-react';
import supportService from '../services/supportService';
import { Toast } from './Toast';

// ============================================================
// SUMMARY CARDS
// ============================================================
function SummaryCards({ tickets }) {
    const open = tickets.filter((t) => t.ticketStatus === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.ticketStatus === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.ticketStatus === 'RESOLVED').length;

    const cards = [
        { label: 'Total', count: tickets.length, color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-400' },
        { label: 'Open', count: open, color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
        { label: 'In Progress', count: inProgress, color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
        { label: 'Resolved', count: resolved, color: 'bg-green-50 text-green-700', dot: 'bg-green-400' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => (
                <div key={card.label} className={`rounded-2xl p-4 ${card.color} bg-opacity-60`}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${card.dot}`} />
                        <p className="text-xs font-medium opacity-80">{card.label}</p>
                    </div>
                    <p className="text-2xl font-bold">{card.count}</p>
                </div>
            ))}
        </div>
    );
}

// ============================================================
// FILTER BAR
// ============================================================
function FilterBar({ filters, onChange }) {
    return (
        <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">Filter:</span>
            </div>

            {/* Status */}
            <select
                value={filters.status}
                onChange={(e) => onChange({ ...filters, status: e.target.value })}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
            >
                <option value="all">All Status</option>
                {supportService.STATUSES.map((s) => (
                    <option key={s} value={s}>{supportService.formatStatus(s)}</option>
                ))}
            </select>

            {/* Priority */}
            <select
                value={filters.priority}
                onChange={(e) => onChange({ ...filters, priority: e.target.value })}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
            >
                <option value="all">All Priority</option>
                {supportService.PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                ))}
            </select>

            {/* Category */}
            <select
                value={filters.category}
                onChange={(e) => onChange({ ...filters, category: e.target.value })}
                className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-700"
            >
                <option value="all">All Category</option>
                {supportService.CATEGORIES.map((c) => (
                    <option key={c} value={c}>{supportService.formatCategory(c)}</option>
                ))}
            </select>

            {/* Reset */}
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all') && (
                <button
                    onClick={() => onChange({ status: 'all', priority: 'all', category: 'all' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Reset
                </button>
            )}
        </div>
    );
}

// ============================================================
// TICKET CARD (MPP List Item)
// ============================================================
function TicketCard({ ticket, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Badges */}
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

                    {/* Title */}
                    <p className="text-sm font-semibold text-gray-900 truncate">{ticket.ticketTitle}</p>

                    {/* Submitted by */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ticket.userName}</span>
                        <span className="text-gray-300">·</span>
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
// TICKET DETAIL VIEW (MPP)
// ============================================================
function TicketDetailView({ ticketId, onBack }) {
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

    const showToast = (type, message) => setToast({ isVisible: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, isVisible: false }));

    const fetchTicket = useCallback(async () => {
        try {
            const data = await supportService.getTicketById(ticketId);
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
            const updated = await supportService.mppReplyToTicket(ticketId, replyMessage.trim());
            setTicket(updated);
            setReplyMessage('');
            showToast('success', 'Reply sent successfully');
        } catch (err) {
            showToast('error', err || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleResolve = async () => {
        setActionLoading(true);
        try {
            const updated = await supportService.resolveTicket(ticketId);
            setTicket(updated);
            showToast('success', 'Ticket marked as resolved');
        } catch (err) {
            showToast('error', err || 'Failed to resolve ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReopen = async () => {
        setActionLoading(true);
        try {
            const updated = await supportService.reopenTicket(ticketId);
            setTicket(updated);
            showToast('success', 'Ticket reopened successfully');
        } catch (err) {
            showToast('error', err || 'Failed to reopen ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            const updated = await supportService.updateTicketPriority(ticketId, newPriority);
            setTicket(updated);
            showToast('success', 'Priority updated');
        } catch (err) {
            showToast('error', err || 'Failed to update priority');
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
    const isResolved = ticket.ticketStatus === 'RESOLVED';

    return (
        <>
            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />

            <div className="space-y-6">
                {/* Back + Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <button onClick={onBack} className="mt-0.5 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{ticket.ticketTitle}</h2>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                <Users className="w-4 h-4" />
                                <span>{ticket.userName}</span>
                                <span className="text-gray-300">·</span>
                                <span>{supportService.formatTimeAgo(ticket.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {!isResolved ? (
                            <button
                                onClick={handleResolve}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark Resolved
                            </button>
                        ) : (
                            <button
                                onClick={handleReopen}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reopen
                            </button>
                        )}
                    </div>
                </div>

                {/* Ticket Info Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Status */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${supportService.getStatusStyle(ticket.ticketStatus)}`}>
                                {supportService.formatStatus(ticket.ticketStatus)}
                            </span>
                        </div>

                        {/* Priority — editable dropdown */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Priority</p>
                            <select
                                value={ticket.ticketPriority}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer ${supportService.getPriorityStyle(ticket.ticketPriority)}`}
                            >
                                {supportService.PRIORITIES.map((p) => (
                                    <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Category</p>
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm text-gray-700">{supportService.formatCategory(ticket.ticketCategory)}</span>
                            </div>
                        </div>

                        {/* Submitted */}
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Submitted</p>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-gray-700">{supportService.formatDateTime(ticket.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{ticket.ticketDescription}</p>
                    </div>
                </div>

                {/* Conversation Thread */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Conversation ({ticket.responses?.length || 0})
                        </h3>
                    </div>

                    <div className="p-6 space-y-4">
                        {(!ticket.responses || ticket.responses.length === 0) ? (
                            <div className="text-center py-8">
                                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No replies yet. Be the first to respond.</p>
                            </div>
                        ) : (
                            ticket.responses.map((resp) => {
                                const isMPP = resp.senderCategory === 'MPP';
                                return (
                                    <div key={resp.responseId} className={`flex gap-3 ${isMPP ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                                            isMPP ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {resp.senderName?.charAt(0).toUpperCase()}
                                        </div>

                                        {/* Bubble */}
                                        <div className={`max-w-[70%] space-y-1 flex flex-col ${isMPP ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2">
                                                {isMPP && (
                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">
                                                        MPP
                                                    </span>
                                                )}
                                                <span className="text-xs font-medium text-gray-600">{resp.senderName}</span>
                                                <span className="text-xs text-gray-400">{supportService.formatTimeAgo(resp.createdAt)}</span>
                                            </div>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                                isMPP
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

                    {/* Reply Input */}
                    {canReply ? (
                        <div className="px-6 pb-6">
                            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
                                <textarea
                                    rows={3}
                                    placeholder="Type your reply to the business owner..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none"
                                />
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">Replying as MPP Administrator</p>
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
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-700">This ticket has been resolved.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

// ============================================================
// MAIN MPPSUPPORT COMPONENT
// ============================================================
export function MPPSupport() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [filters, setFilters] = useState({ status: 'all', priority: 'all', category: 'all' });
    const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

    const showToast = (type, message) => setToast({ isVisible: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, isVisible: false }));

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await supportService.getAllTickets(filters);
            setTickets(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to load tickets:', err);
            setTickets([]);
            showToast('error', 'Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    // ── Ticket Detail View ──
    if (selectedTicketId) {
        return (
            <div>
                <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />
                <TicketDetailView
                    ticketId={selectedTicketId}
                    onBack={() => {
                        setSelectedTicketId(null);
                        fetchTickets();
                    }}
                />
            </div>
        );
    }

    // ── Ticket List View ──
    return (
        <>
            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
                <p className="text-gray-500 text-sm mt-1">Manage and respond to business owner support requests</p>
            </div>

            {/* Summary Cards */}
            <SummaryCards tickets={tickets} />

            {/* Filter Bar */}
            <FilterBar filters={filters} onChange={setFilters} />

            {/* Ticket List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-purple-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">No tickets found</h3>
                    <p className="text-sm text-gray-500">
                        {filters.status !== 'all' || filters.priority !== 'all' || filters.category !== 'all'
                            ? 'Try adjusting your filters'
                            : 'No support tickets have been submitted yet'}
                    </p>
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