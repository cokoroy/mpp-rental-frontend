import { useState, useEffect } from 'react';
import {
    FileText, Filter, Download, RotateCcw,
    TrendingUp, Users, CheckCircle, XCircle,
    DollarSign, Search, ChevronDown, BarChart2, AlertCircle,
} from 'lucide-react';
import reportService from '../services/reportService';
import { Toast } from './Toast';

// ─────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────
function SummaryCard({ icon, label, value, sub, gradient }) {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// FILTER SELECT
// ─────────────────────────────────────────────
function FilterSelect({ label, value, onChange, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2.5 pr-9 text-sm text-gray-700 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-300 transition-all"
                >
                    {children}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export function Report() {

    // ── Filter state ──────────────────────────
    const [filters, setFilters] = useState({
        eventId:           '',
        facilityId:        '',
        ownerCategory:     'all',
        applicationStatus: 'all',
        paymentStatus:     'all',
        startDate:         '',
        endDate:           '',
    });

    // ── Data state ────────────────────────────
    const [events,      setEvents]      = useState([]);
    const [facilities,  setFacilities]  = useState([]);
    const [reportRows,  setReportRows]  = useState([]);
    const [summary,     setSummary]     = useState(null);
    const [hasGenerated,setHasGenerated]= useState(false);

    // ── UI state ──────────────────────────────
    const [loading,          setLoading]          = useState(false);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);
    const [tableSearch,      setTableSearch]      = useState('');
    const [toast, setToast] = useState({ isVisible: false, type: 'success', message: '' });

    const showToast = (type, message) => setToast({ isVisible: true, type, message });
    const hideToast = () => setToast((prev) => ({ ...prev, isVisible: false }));

    // ── Load dropdown options on mount ────────
    useEffect(() => {
        const load = async () => {
            try {
                setLoadingDropdowns(true);
                const [eventsData, facilitiesData] = await Promise.all([
                    reportService.getEventsForFilter(),
                    reportService.getFacilitiesForFilter(),
                ]);
                setEvents(eventsData     || []);
                setFacilities(facilitiesData || []);
            } catch {
                showToast('error', 'Failed to load filter options. Please refresh.');
            } finally {
                setLoadingDropdowns(false);
            }
        };
        load();
    }, []);

    const setFilter = (key, val) => setFilters((prev) => ({ ...prev, [key]: val }));

    // ── Generate ──────────────────────────────
    const handleGenerate = async () => {
        const validation = reportService.validateFilters(filters);
        if (!validation.valid) { showToast('error', validation.message); return; }

        try {
            setLoading(true);
            const data = await reportService.generateReport(filters);
            setReportRows(data.rows    || []);
            setSummary(data.summary    || null);
            setHasGenerated(true);
            setTableSearch('');
            if (!(data.rows || []).length) showToast('warning', 'No records found for the selected filters.');
        } catch (err) {
            showToast('error', typeof err === 'string' ? err : 'Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Reset ─────────────────────────────────
    const handleReset = () => {
        setFilters({ eventId: '', facilityId: '', ownerCategory: 'all', applicationStatus: 'all', paymentStatus: 'all', startDate: '', endDate: '' });
        setReportRows([]);
        setSummary(null);
        setHasGenerated(false);
        setTableSearch('');
    };

    // ── Export CSV ────────────────────────────
    const handleExportCSV = () => {
        if (!filteredRows.length) { showToast('warning', 'No data to export.'); return; }
        reportService.exportCSV(filteredRows);
        showToast('success', 'CSV file downloaded successfully.');
    };

    // ── Table-level search filter ─────────────
    const filteredRows = reportRows.filter((row) => {
        if (!tableSearch.trim()) return true;
        const q = tableSearch.toLowerCase();
        return (
            (row.eventName    || '').toLowerCase().includes(q) ||
            (row.businessName || '').toLowerCase().includes(q) ||
            (row.ownerName    || '').toLowerCase().includes(q) ||
            (row.facilityName || '').toLowerCase().includes(q)
        );
    });

    // ── Collection rate ───────────────────────
    const collectionRate = summary && summary.totalApproved > 0
        ? Math.round((summary.totalPaid / summary.totalApproved) * 100)
        : 0;

    // ─────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Toast type={toast.type} message={toast.message} isVisible={toast.isVisible} onClose={hideToast} />

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Generate and export facility rental reports</p>
                </div>
                {hasGenerated && filteredRows.length > 0 && (
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                )}
            </div>

            {/* ── Filter Panel ── */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-5">
                    <Filter className="w-4 h-4 text-purple-500" />
                    <h2 className="text-sm font-semibold text-gray-700">Filter Options</h2>
                    <span className="text-xs text-gray-400">(all filters are optional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Event */}
                    <FilterSelect label="Event" value={filters.eventId} onChange={(v) => setFilter('eventId', v)}>
                        <option value="">All Events</option>
                        {events.map((e) => (
                            <option key={e.eventId} value={e.eventId}>{e.eventName}</option>
                        ))}
                    </FilterSelect>

                    {/* Facility */}
                    <FilterSelect label="Facility" value={filters.facilityId} onChange={(v) => setFilter('facilityId', v)}>
                        <option value="">All Facilities</option>
                        {facilities.map((f) => (
                            <option key={f.facilityId} value={f.facilityId}>{f.facilityName}</option>
                        ))}
                    </FilterSelect>

                    {/* Owner Category */}
                    <FilterSelect label="Owner Category" value={filters.ownerCategory} onChange={(v) => setFilter('ownerCategory', v)}>
                        <option value="all">All Categories</option>
                        <option value="STUDENT">Student</option>
                        <option value="NON_STUDENT">Non-Student</option>
                    </FilterSelect>

                    {/* Application Status */}
                    <FilterSelect label="Application Status" value={filters.applicationStatus} onChange={(v) => setFilter('applicationStatus', v)}>
                        <option value="all">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </FilterSelect>

                    {/* Payment Status */}
                    <FilterSelect label="Payment Status" value={filters.paymentStatus} onChange={(v) => setFilter('paymentStatus', v)}>
                        <option value="all">All Payment Status</option>
                        <option value="PAID">Paid</option>
                        <option value="UNPAID">Unpaid</option>
                        <option value="FAILED">Failed</option>
                    </FilterSelect>

                    {/* Date Range */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilter('startDate', e.target.value)}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-300 transition-all"
                            />
                            <span className="text-xs text-gray-400 flex-shrink-0">to</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilter('endDate', e.target.value)}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-300 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || loadingDropdowns}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <BarChart2 className="w-4 h-4" />
                                Generate Report
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                </div>
            </div>

            {/* ── Results ── */}
            {hasGenerated && summary && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        <SummaryCard
                            icon={<FileText className="w-5 h-5 text-white" />}
                            label="Total Applications"
                            value={summary.totalApplications}
                            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                        />
                        <SummaryCard
                            icon={<CheckCircle className="w-5 h-5 text-white" />}
                            label="Approved"
                            value={summary.totalApproved}
                            gradient="bg-gradient-to-br from-green-500 to-emerald-400"
                        />
                        <SummaryCard
                            icon={<XCircle className="w-5 h-5 text-white" />}
                            label="Rejected"
                            value={summary.totalRejected}
                            gradient="bg-gradient-to-br from-red-400 to-rose-500"
                        />
                        <SummaryCard
                            icon={<Users className="w-5 h-5 text-white" />}
                            label="Businesses"
                            value={summary.totalBusinesses}
                            gradient="bg-gradient-to-br from-blue-500 to-indigo-400"
                        />
                        <SummaryCard
                            icon={<DollarSign className="w-5 h-5 text-white" />}
                            label="Total Revenue"
                            value={`RM ${parseFloat(summary.totalRevenue || 0).toFixed(2)}`}
                            sub="Paid only"
                            gradient="bg-gradient-to-br from-green-500 to-teal-400"
                        />
                        <SummaryCard
                            icon={<TrendingUp className="w-5 h-5 text-white" />}
                            label="Collection Rate"
                            value={`${collectionRate}%`}
                            sub="Paid / Approved"
                            gradient="bg-gradient-to-br from-yellow-400 to-orange-400"
                        />
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        {/* Table toolbar */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-700">Report Data</h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search in results..."
                                    value={tableSearch}
                                    onChange={(e) => setTableSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
                                />
                            </div>
                        </div>

                        {filteredRows.length === 0 ? (
                            <div className="text-center py-16">
                                <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No records match your search</p>
                                <p className="text-xs text-gray-400 mt-1">Try adjusting the search or filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Event</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Facility</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Business</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Owner</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Category</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">App. Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Payment</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Amount (RM)</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                    {filteredRows.map((row, idx) => (
                                        <tr key={row.applicationId || idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5 text-xs text-gray-400">{idx + 1}</td>
                                            <td className="px-5 py-3.5">
                                                <p className="font-medium text-gray-800 whitespace-nowrap">{row.eventName}</p>
                                                {row.eventVenue && (
                                                    <p className="text-xs text-gray-400 mt-0.5">{row.eventVenue}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{row.facilityName}</td>
                                            <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{row.businessName}</td>
                                            <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">{row.ownerName}</td>
                                            <td className="px-5 py-3.5">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        row.ownerCategory === 'STUDENT'
                                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                                                    }`}>
                                                        {row.ownerCategory === 'STUDENT' ? 'Student' : 'Non-Student'}
                                                    </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${reportService.getApplicationStatusStyle(row.applicationStatus)}`}>
                                                        {row.applicationStatus.charAt(0) + row.applicationStatus.slice(1).toLowerCase()}
                                                    </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {row.paymentStatus ? (
                                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${reportService.getPaymentStatusStyle(row.paymentStatus)}`}>
                                                            {row.paymentStatus.charAt(0) + row.paymentStatus.slice(1).toLowerCase()}
                                                        </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-gray-700 whitespace-nowrap">
                                                {row.paymentAmount != null
                                                    ? `RM ${parseFloat(row.paymentAmount).toFixed(2)}`
                                                    : <span className="text-gray-400 font-normal">—</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── Pre-generate empty state ── */}
            {!hasGenerated && !loading && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BarChart2 className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-600">No report generated yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Set your filters above and click{' '}
                        <span className="text-purple-500 font-medium">Generate Report</span> to view results.
                    </p>
                </div>
            )}
        </div>
    );
}