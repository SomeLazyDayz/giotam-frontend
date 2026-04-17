import { useState, useEffect } from 'react';
import { Users, Hospital, TrendingUp, CheckCircle, Search, Droplet, Phone, MapPin, Send, Printer, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/api';

interface AdminDashboardProps {
  userRole?: string;
}

interface PendingRecord {
  record_id: number;
  user_name: string;
  phone: string;
  blood_type: string;
  donation_date: string;
}

export default function AdminDashboard({ userRole = 'admin' }: AdminDashboardProps) {
  const [stats, setStats] = useState({ users: 0, hospitals: 0, accepted: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const [scheduledRecords, setScheduledRecords] = useState<any[]>([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  
  const [donorsList, setDonorsList] = useState<any[]>([]);
  const [isLoadingDonors, setIsLoadingDonors] = useState(false);
  const [confirmType, setConfirmType] = useState<'emergency'|'scheduled'>('emergency');

  const [amountMl, setAmountMl] = useState('350');
  const [donationType, setDonationType] = useState('Toàn phần');
  const [donationDate, setDonationDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  // Search TNV States
  const [filters, setFilters] = useState({ bloodType: 'O+', radius: '10' });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedDonors, setSelectedDonors] = useState<number[]>([]);
  
  // Pagination State for Donor Table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPendingDonations = async () => {
    setIsLoadingPending(true);
    try {
      const pendingRes = await api.get('/admin/pending_donations');
      setPendingRecords(pendingRes.data.pending_donations || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách pending:', error);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const fetchScheduledRegistrations = async () => {
    setIsLoadingScheduled(true);
    try {
      const scheduledRes = await api.get('/admin/scheduled_registrations');
      setScheduledRecords(scheduledRes.data.scheduled_registrations || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hiến máu thường xuyên:', error);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const fetchDonorsList = async () => {
    setIsLoadingDonors(true);
    try {
      const donorsRes = await api.get('/admin/donors_list');
      setDonorsList(donorsRes.data.donors || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tình nguyện viên:', error);
    } finally {
      setIsLoadingDonors(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await api.get('/users');
        const hospitalRes = await api.get('/hospitals');
        const donorGrowthRes = await api.get('/admin/donor_growth');
        
        const totalUsers = userRes.data.count || 0;
        const totalHospitals = hospitalRes.data.count || 0;
        setStats({ users: totalUsers, hospitals: totalHospitals, accepted: 0 }); // accepted can be dynamic later

        if (donorGrowthRes.data?.chart_data) {
          setChartData(donorGrowthRes.data.chart_data);
        } else {
          setChartData([
            { name: '-', 'Toàn phần': 0, 'Tiểu cầu': 0, 'Huyết tương': 0, 'Khác': 0 },
            { name: '-', 'Toàn phần': 0, 'Tiểu cầu': 0, 'Huyết tương': 0, 'Khác': 0 },
            { name: '-', 'Toàn phần': 0, 'Tiểu cầu': 0, 'Huyết tương': 0, 'Khác': 0 },
            { name: '-', 'Toàn phần': 0, 'Tiểu cầu': 0, 'Huyết tương': 0, 'Khác': 0 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching admin stats', error);
        setStats({ users: 15, hospitals: 3, accepted: 0 });
        setChartData([
          { name: 'T1', 'Toàn phần': 8, 'Tiểu cầu': 5, 'Huyết tương': 2, 'Khác': 0 },
          { name: 'T2', 'Toàn phần': 12, 'Tiểu cầu': 3, 'Huyết tương': 4, 'Khác': 1 },
          { name: 'T3', 'Toàn phần': 10, 'Tiểu cầu': 4, 'Huyết tương': 1, 'Khác': 0 },
          { name: 'T4', 'Toàn phần': 15, 'Tiểu cầu': 6, 'Huyết tương': 3, 'Khác': 2 },
        ]);
      }
    };

    fetchStats();
    fetchPendingDonations();
    fetchScheduledRegistrations();
    fetchDonorsList();
  }, []);

  const handleOpenConfirm = (recordId: number, type: 'emergency'|'scheduled' = 'emergency', defaultAmountMl: string = '350') => {
    setSelectedRecordId(recordId);
    setConfirmType(type);
    setAmountMl(defaultAmountMl);
    setDonationType('Toàn phần');
    setDonationDate(new Date().toISOString().split('T')[0]);
    setShowConfirmModal(true);
  };

  const handleCancelEmergency = async (recordId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi Khẩn Cấp này khỏi danh sách (Do tình nguyện viên không đến)?')) return;
    try {
      await api.delete(`/admin/cancel_emergency_donation/${recordId}`);
      fetchPendingDonations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa bản ghi khẩn cấp');
    }
  };

  const handleCancelScheduled = async (regId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lượt Đăng Ký hẹn trước này khỏi danh sách (Do tình nguyện viên không đến)?')) return;
    try {
      await api.delete(`/admin/cancel_scheduled_registration/${regId}`);
      fetchScheduledRegistrations();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi hủy đăng ký thường xuyên');
    }
  };

  const handleConfirmDonation = async () => {
    if (!selectedRecordId) return;
    try {
      if (confirmType === 'emergency') {
        await api.post(`/admin/confirm_donation/${selectedRecordId}`, {
          amount_ml: parseInt(amountMl, 10),
          donation_type: donationType,
          donation_date: donationDate
        });
        fetchPendingDonations();
      } else {
        await api.post(`/admin/confirm_scheduled_donation/${selectedRecordId}`, {
          amount_ml: parseInt(amountMl, 10),
          donation_type: donationType,
          donation_date: donationDate
        });
        fetchScheduledRegistrations();
      }
      setShowConfirmModal(false);
      setToastMessage('Ghi nhận thành công');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error('Lỗi khi xác nhận hiến máu:', error);
      alert('Có lỗi xảy ra khi xác nhận!');
    }
  };

  // Logic Tìm Kiếm TNV
  const handleSearchDonors = async () => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setSelectedDonors([]);

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const hospitalId = user?.id || 1;

      const searchPayload = {
        hospital_id: hospitalId,
        blood_type: filters.bloodType,
        radius_km: parseInt(filters.radius, 10),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/create_alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Lỗi ${response.status}`);

      setSearchResults(result.top_50_users || []);
      if (!result.top_50_users || result.top_50_users.length === 0) {
        setToastMessage("Không tìm thấy người phù hợp.");
        setTimeout(() => setToastMessage(''), 3000);
      } else {
        setToastMessage(`Tìm thấy ${result.top_50_users.length} TNV.`);
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (error: any) {
      setSearchError(`Lỗi tìm kiếm: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectDonor = (donorId: number) => {
    setSelectedDonors(prev => {
      if (prev.includes(donorId)) return prev.filter(id => id !== donorId);
      return [...prev, donorId];
    });
  };

  const handleSelectAll = () => {
    if (selectedDonors.length === searchResults.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(searchResults.map((result: any) => result.user.id));
    }
  };

  const handleBulkContact = async () => {
    if (selectedDonors.length === 0) {
      setToastMessage("Vui lòng chọn ít nhất một người");
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSearching(true);
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const hospitalName = user?.name || "Bệnh viện";
    const hospitalAddress = user?.address || "địa chỉ hiển thị trên trang chủ";
    const bloodTypeNeeded = filters.bloodType;

    const messageBody = `[GIOT AM] KHẨN CẤP! Bệnh viện ${hospitalName} đang cần gấp nhóm máu ${bloodTypeNeeded}. Xin vui lòng hiến máu tại: ${hospitalAddress}. Trân trọng cảm ơn!`;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notify_donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_ids: selectedDonors,
          message: messageBody
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Lỗi không xác định');

      setToastMessage(result.message || 'Đã gửi yêu cầu.');
      setTimeout(() => setToastMessage(''), 3000);
      setSelectedDonors([]);
    } catch (error: any) {
      setSearchError(`Gửi thông báo thất bại: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 pb-12 relative w-full overflow-hidden">
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="bg-[#930511] px-6 pt-8 pb-6 shadow-md w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bảng Điều Khiển
          </h1>
        </div>
        <p className="text-white/80 mt-2 text-sm md:text-base">
          Quản lý hệ thống Giọt Ấm
        </p>
      </div>

      <div className="px-6 mt-8 space-y-8 max-w-7xl mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-[#930511]" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.users}</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Tình nguyện viên</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Hospital className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.hospitals}</div>
            <div className="text-sm text-gray-500 mt-2 font-medium">Bệnh viện</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{pendingRecords.length}</div>
            <div className="text-sm mt-2 font-bold text-green-600">Ca chờ hiến</div>
          </div>
        </div>

        {/* Donor Tracking Table - CRM/ERP style */}
        {donorsList.length > 0 && (
          <div id="printable-donor-table" className="mt-8 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm print:m-0 print:p-0 print:border-none print:shadow-none print:w-[130%] print:h-screen print:absolute print:top-0 print:-left-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-[#930511]" size={24} />
                Bảng Theo Dõi Thông Tin Tình Nguyện Viên
              </h2>
              <button 
                onClick={() => {
                  const originalTitle = document.title;
                  document.title = 'Bao_Cao_Tinh_Nguyen_Vien';
                  window.print();
                  document.title = originalTitle;
                }}
                className="flex items-center gap-2 bg-[#930511] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#7a0410] transition-colors print:hidden shadow-md shadow-[#930511]/20"
              >
                <Printer size={18} />
                In danh sách
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-600 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-bold text-center w-16">STT</th>
                      <th scope="col" className="px-6 py-4 font-bold text-left min-w-[200px]">Thông tin khách hàng</th>
                      <th scope="col" className="px-6 py-4 font-bold text-center">Nhóm máu</th>
                      <th scope="col" className="px-6 py-4 font-bold text-center">Số lần hiến</th>
                      <th scope="col" className="px-6 py-4 font-bold text-center">Tổng thể tích</th>
                      <th scope="col" className="px-6 py-4 font-bold text-center">Ngày hiến gần nhất</th>
                      <th scope="col" className="px-6 py-4 font-bold text-left">Đánh giá sức khỏe</th>
                      <th scope="col" className="px-6 py-4 font-bold text-center">Ẩn danh FB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((donor, index) => (
                      <tr key={`donor-${donor.id}`} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 text-center font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{donor.name}</div>
                          <div className="text-xs text-gray-500 mt-1 font-medium">{donor.phone}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-[#930511]/10 text-[#930511] text-xs font-black px-3 py-1.5 rounded-full border border-[#930511]/20">
                            {donor.blood_type || '?'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-700">{donor.donations_count} <span className="font-normal text-xs text-gray-500">lần</span></td>
                        <td className="px-6 py-4 text-center font-bold text-red-600 text-base">{donor.total_ml} <span className="font-normal text-xs text-gray-500 text-red-400">ml</span></td>
                        <td className="px-6 py-4 text-center font-mono text-xs">{donor.last_donated || 'Chưa có'}</td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold w-full border
                            ${donor.status.eligible 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {donor.status.eligible ? <CheckCircle size={14} className="min-w-[14px]" /> : <Clock size={14} className="min-w-[14px]" />}
                            <span className="whitespace-nowrap overflow-hidden text-ellipsis">{donor.status.reason}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {donor.donations_count === 0 ? (
                            <span className="text-xs text-gray-400 italic">Chưa hiến</span>
                          ) : donor.is_anonymous ? (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-full">
                              🔒 Ẩn danh
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1.5 rounded-full">
                              ✅ Đăng tên
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {donorsList.length > itemsPerPage && (
                <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50 print:hidden">
                  <div className="text-sm text-gray-500 font-medium">
                    Hiển thị <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, donorsList.length)}</span> trong số <span className="font-bold text-gray-900">{donorsList.length}</span> Tình nguyện viên
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-700"
                    >
                      Trước
                    </button>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(donorsList.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(donorsList.length / itemsPerPage)}
                      className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-700"
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chart Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-6 h-6 text-[#930511]" />
            <h2 className="text-xl font-bold text-gray-900">Tăng trưởng người hiến</h2>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend layout="horizontal" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }} />
                <Bar dataKey="Toàn phần" stackId="a" fill="#930511" barSize={40} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Tiểu cầu" stackId="a" fill="#DC2626" />
                <Bar dataKey="Huyết tương" stackId="a" fill="#F87171" />
                <Bar dataKey="Khác" stackId="a" fill="#FCA5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Bệnh viện Tìm kiếm TNV đã được gỡ bỏ khỏi Web Dashboard theo yêu cầu */}

        {/* Pending Donations Table */}
        <div className="bg-red-50/30 rounded-2xl p-6 shadow-md border border-red-100 overflow-hidden mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-red-900">Người đã xác nhận tham gia hiến máu khẩn cấp</h2>
            <button
              onClick={() => { fetchPendingDonations(); fetchScheduledRegistrations(); }}
              disabled={isLoadingPending || isLoadingScheduled}
              className="text-sm bg-red-100 text-red-700 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 rounded-xl font-bold transition-colors"
            >
              {isLoadingPending || isLoadingScheduled ? 'Đang tải...' : '🔄 Làm mới'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-600 whitespace-nowrap">
              <thead className="text-sm text-red-900 uppercase bg-red-100/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold rounded-tl-xl text-left">Tên</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Nhóm máu</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Số điện thoại</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pendingRecords.length === 0 && scheduledRecords.filter(r => r.urgency === 'Khẩn cấp').length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-red-400 italic">Không có người chờ hiến máu khẩn cấp</td>
                  </tr>
                ) : (
                  <>
                  {pendingRecords.map((record) => (
                    <tr key={record.record_id} className="border-b border-red-50 last:border-0 hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.user_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#930511]/10 text-[#930511] text-xs font-bold px-3 py-1.5 rounded-full">{record.blood_type || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{record.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCancelEmergency(record.record_id)}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(record.record_id)}
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {scheduledRecords.filter(r => r.urgency === 'Khẩn cấp').map((record) => (
                    <tr key={`emg-${record.reg_id}`} className="border-b border-red-50 last:border-0 hover:bg-red-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.user_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#930511]/10 text-[#930511] text-xs font-bold px-3 py-1.5 rounded-full">{record.blood_type || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{record.phone}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCancelScheduled(record.reg_id)}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(record.reg_id, 'scheduled', record.amount_ml ? record.amount_ml.toString() : '350')}
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Scheduled Donations Table */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 overflow-hidden mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Người xác nhận tham gia hiến máu thường xuyên</h2>
            <button
              onClick={fetchScheduledRegistrations}
              disabled={isLoadingScheduled}
              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 rounded-xl font-bold transition-colors"
            >
              {isLoadingScheduled ? 'Đang tải...' : '🔄 Làm mới'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-600 whitespace-nowrap">
              <thead className="text-sm text-gray-900 uppercase bg-gray-50/50">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold rounded-tl-xl text-left">Tên</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Nhóm máu</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Số điện thoại</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Khung giờ</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Ngày dự kiến</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-right rounded-tr-xl">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {scheduledRecords.filter(r => r.urgency !== 'Khẩn cấp').length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 italic">Không có người đăng ký hiến máu thường xuyên</td>
                  </tr>
                ) : (
                  scheduledRecords.filter(r => r.urgency !== 'Khẩn cấp').map((record) => (
                    <tr key={`sched-${record.reg_id}`} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{record.user_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-[#930511]/10 text-[#930511] text-xs font-bold px-3 py-1.5 rounded-full">{record.blood_type || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{record.phone}</td>
                      <td className="px-6 py-4 text-center font-medium text-red-600">{record.time_slot}</td>
                      <td className="px-6 py-4 text-center font-medium">{record.expected_date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleCancelScheduled(record.reg_id)}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xóa
                          </button>
                          <button
                            onClick={() => handleOpenConfirm(record.reg_id, 'scheduled', record.amount_ml ? record.amount_ml.toString() : '350')}
                            className="text-sm bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-bold transition-colors shadow-sm"
                          >
                            Xác nhận hoàn tất
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>



      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Xác nhận hiến máu</h3>
            <p className="text-base text-gray-500 mb-6">Xin vui lòng điền thông tin thực tế</p>

            <div className="mb-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Loại hiến máu</label>
                <select
                  value={donationType}
                  onChange={(e) => setDonationType(e.target.value)}
                  className="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 text-base font-medium focus:outline-none focus:border-[#930511] focus:bg-white transition-all"
                >
                  <option value="Toàn phần">Máu Toàn phần</option>
                  <option value="Tiểu cầu">Tiểu cầu</option>
                  <option value="Huyết tương">Huyết tương</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Ngày hiến máu</label>
                <input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  className="w-full h-12 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 text-base font-medium focus:outline-none focus:border-[#930511] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Chọn mức thể tích</label>
                <div className="flex gap-3">
                  <button onClick={() => setAmountMl('250')} className={`flex-1 py-3 rounded-xl text-base font-bold transition-all border-2 ${amountMl === '250' ? 'border-[#930511] bg-[#930511]/10 text-[#930511]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>250 ml</button>
                  <button onClick={() => setAmountMl('350')} className={`flex-1 py-3 rounded-xl text-base font-bold transition-all border-2 ${amountMl === '350' ? 'border-[#930511] bg-[#930511]/10 text-[#930511]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>350 ml</button>
                  <button onClick={() => setAmountMl('450')} className={`flex-1 py-3 rounded-xl text-base font-bold transition-all border-2 ${amountMl === '450' ? 'border-[#930511] bg-[#930511]/10 text-[#930511]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>450 ml</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Hoặc nhập dung tích khác (ml)</label>
                <input
                  type="number"
                  value={amountMl}
                  onChange={(e) => setAmountMl(e.target.value)}
                  className="w-full h-14 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 text-base font-medium focus:outline-none focus:border-[#930511] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDonation}
                className="flex-1 py-3.5 bg-[#930511] text-white font-bold rounded-xl hover:bg-[#7a0410] transition-colors shadow-lg shadow-[#930511]/30"
              >
                Lưu xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
