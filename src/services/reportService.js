import api from './api';

const reportService = {

    // ==================== GENERATE REPORT ====================

    /**
     * Generate facility rental report with optional filters
     * @param {Object} filters - { eventId, facilityId, ownerCategory, applicationStatus, paymentStatus, startDate, endDate }
     */
    generateReport: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.eventId)                                          params.append('eventId', filters.eventId);
            if (filters.facilityId)                                       params.append('facilityId', filters.facilityId);
            if (filters.ownerCategory && filters.ownerCategory !== 'all') params.append('ownerCategory', filters.ownerCategory);
            if (filters.applicationStatus && filters.applicationStatus !== 'all') params.append('applicationStatus', filters.applicationStatus);
            if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);
            if (filters.startDate)                                        params.append('startDate', filters.startDate);
            if (filters.endDate)                                          params.append('endDate', filters.endDate);

            const queryString = params.toString();
            const url = queryString ? `/mpp/reports?${queryString}` : '/mpp/reports';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== DROPDOWN DATA ====================

    /**
     * Get all events for the Event filter dropdown
     */
    getEventsForFilter: async () => {
        try {
            const response = await api.get('/mpp/reports/events');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all facilities for the Facility filter dropdown
     */
    getFacilitiesForFilter: async () => {
        try {
            const response = await api.get('/mpp/reports/facilities');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // ==================== VALIDATION ====================

    /**
     * Validate filter inputs before generating
     * @returns {{ valid: boolean, message: string }}
     */
    validateFilters: (filters) => {
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate);
            const end   = new Date(filters.endDate);
            if (end < start) {
                return { valid: false, message: 'End date must be after start date.' };
            }
        }
        return { valid: true, message: '' };
    },

    // ==================== EXPORT ====================

    exportCSV: (rows) => {
        const headers = [
            'Event Name', 'Facility Name', 'Business Name', 'Owner Name',
            'Owner Category', 'Application Status', 'Payment Status',
            'Payment Amount (RM)', 'Applied At',
        ];
        const csvRows = rows.map((row) => [
            `"${row.eventName   || ''}"`,
            `"${row.facilityName|| ''}"`,
            `"${row.businessName|| ''}"`,
            `"${row.ownerName   || ''}"`,
            `"${row.ownerCategory || ''}"`,
            `"${row.applicationStatus || ''}"`,
            `"${row.paymentStatus || '-'}"`,
            row.paymentAmount != null ? parseFloat(row.paymentAmount).toFixed(2) : '0.00',
            `"${row.applicationCreatedAt ? new Date(row.applicationCreatedAt).toLocaleDateString('en-MY') : ''}"`,
        ]);
        const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = `facility_rental_report_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    },

    // ==================== STYLE HELPERS ====================

    getApplicationStatusStyle: (status) => {
        switch (status) {
            case 'PENDING':   return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'APPROVED':  return 'bg-green-100 text-green-700 border border-green-200';
            case 'REJECTED':  return 'bg-red-100 text-red-700 border border-red-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-600 border border-gray-200';
            default:          return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
    },

    getPaymentStatusStyle: (status) => {
        switch (status) {
            case 'PAID':   return 'bg-green-100 text-green-700 border border-green-200';
            case 'UNPAID': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'FAILED': return 'bg-red-100 text-red-700 border border-red-200';
            default:       return 'bg-gray-100 text-gray-500 border border-gray-200';
        }
    },
};

export default reportService;