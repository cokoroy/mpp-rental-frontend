import api from './api';

const supportService = {

    // ==================== BUSINESS OWNER ====================

    /**
     * Create a new support ticket
     * @param {Object} payload - { ticketTitle, ticketDescription, ticketCategory, ticketPriority }
     */
    createTicket: async (payload) => {
        try {
            const response = await api.post('/bo/support', payload);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all tickets submitted by the current Business Owner
     */
    getMyTickets: async () => {
        try {
            const response = await api.get('/bo/support');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a single ticket with conversation thread (BO - own ticket only)
     * @param {number} ticketId
     */
    getMyTicketById: async (ticketId) => {
        try {
            const response = await api.get(`/bo/support/${ticketId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Business Owner replies to an existing ticket
     * @param {number} ticketId
     * @param {string} message
     */
    replyToTicket: async (ticketId, message) => {
        try {
            const response = await api.post(`/bo/support/${ticketId}/reply`, { message });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a ticket (only allowed if status is OPEN)
     * @param {number} ticketId
     */
    deleteTicket: async (ticketId) => {
        try {
            const response = await api.delete(`/bo/support/${ticketId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== MPP ====================

    /**
     * Get all tickets with optional filters (MPP)
     * @param {Object} filters - { status, priority, category }
     */
    getAllTickets: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);
            if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            const queryString = params.toString();
            const url = queryString ? `/mpp/support?${queryString}` : '/mpp/support';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get a single ticket with conversation thread (MPP - any ticket)
     * @param {number} ticketId
     */
    getTicketById: async (ticketId) => {
        try {
            const response = await api.get(`/mpp/support/${ticketId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * MPP replies to a ticket (auto-transitions OPEN → IN_PROGRESS)
     * @param {number} ticketId
     * @param {string} message
     */
    mppReplyToTicket: async (ticketId, message) => {
        try {
            const response = await api.post(`/mpp/support/${ticketId}/reply`, { message });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mark a ticket as RESOLVED
     * @param {number} ticketId
     */
    resolveTicket: async (ticketId) => {
        try {
            const response = await api.patch(`/mpp/support/${ticketId}/resolve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Reopen a RESOLVED ticket → back to IN_PROGRESS
     * @param {number} ticketId
     */
    reopenTicket: async (ticketId) => {
        try {
            const response = await api.patch(`/mpp/support/${ticketId}/reopen`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update ticket priority (MPP only)
     * @param {number} ticketId
     * @param {string} ticketPriority - LOW | MEDIUM | HIGH
     */
    updateTicketPriority: async (ticketId, ticketPriority) => {
        try {
            const response = await api.patch(`/mpp/support/${ticketId}/priority`, { ticketPriority });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== HELPERS ====================

    /**
     * Format datetime for display (e.g. "Jan 5, 2025, 2:30 PM")
     */
    formatDateTime: (dateTimeStr) => {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    },

    /**
     * Format relative time (e.g. "2 hours ago")
     */
    formatTimeAgo: (dateTimeStr) => {
        if (!dateTimeStr) return '';
        const now = new Date();
        const date = new Date(dateTimeStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    },

    /**
     * Get status badge style
     */
    getStatusStyle: (status) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'RESOLVED':
                return 'bg-green-100 text-green-700 border border-green-200';
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
    },

    /**
     * Get priority badge style
     */
    getPriorityStyle: (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-700 border border-red-200';
            case 'MEDIUM':
                return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'LOW':
                return 'bg-gray-100 text-gray-600 border border-gray-200';
            default:
                return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
    },

    /**
     * Format status for display (e.g. "IN_PROGRESS" → "In Progress")
     */
    formatStatus: (status) => {
        if (!status) return '';
        return status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
        );
    },

    /**
     * Format category for display (e.g. "PAYMENT" → "Payment")
     */
    formatCategory: (category) => {
        if (!category) return '';
        return category.charAt(0) + category.slice(1).toLowerCase();
    },

    CATEGORIES: ['PAYMENT', 'TECHNICAL', 'APPLICATION', 'GENERAL'],
    PRIORITIES: ['LOW', 'MEDIUM', 'HIGH'],
    STATUSES: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
};

export default supportService;