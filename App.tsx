
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Trophy, 
  QrCode, 
  Menu, 
  X,
  Sparkles,
  Lock
} from 'lucide-react';
import CheckInView from './views/CheckInView';
import AdminView from './views/AdminView';
import LuckyDrawView from './views/LuckyDrawView';
import WinnersView from './views/WinnersView';
import { Guest, Prize, Winner } from './types';

// Fix: Use React.FC to properly handle children and ensure types are recognized in Route element
const ProtectedRoute: React.FC<{ children: React.ReactNode; isAuthenticated: boolean }> = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  // Fix: Explicitly type isAuthenticated as boolean to avoid 'any' inference
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = ['/admin', '/draw', '/winners'].some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const savedGuests = localStorage.getItem('yep_guests');
    const savedPrizes = localStorage.getItem('yep_prizes');
    const savedWinners = localStorage.getItem('yep_winners');
    const authStatus = sessionStorage.getItem('yep_auth');

    if (savedGuests) setGuests(JSON.parse(savedGuests));
    if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
    if (savedWinners) setWinners(JSON.parse(savedWinners));
    if (authStatus === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('yep_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('yep_prizes', JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    localStorage.setItem('yep_winners', JSON.stringify(winners));
  }, [winners]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mật khẩu mặc định cho BTC là 2025
    if (pin === '2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('yep_auth', 'true');
      setLoginError('');
      navigate('/draw');
    } else {
      setLoginError('Mã PIN không chính xác!');
    }
  };

  const addGuest = (guest: Guest) => {
    setGuests(prev => [...prev, guest]);
  };

  const updatePrizes = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
  };

  const addWinner = (winner: Winner) => {
    setWinners(prev => [winner, ...prev]);
    setPrizes(prev => prev.map(p => 
      p.id === winner.prizeId ? { ...p, remaining: p.remaining - 1 } : p
    ));
  };

  const resetData = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu?")) {
      setGuests([]);
      setPrizes([]);
      setWinners([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0f172a]">
      {/* Chỉ hiển thị Navigation nếu là Admin đã login */}
      {isAuthenticated && isAdminPath && (
        <nav className="glass-panel z-50 px-4 py-2 border-b border-white/5 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2 text-amber-500">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">BTC CARGILL 2025</span>
            </div>

            <div className="flex space-x-6">
              <Link to="/draw" className={`flex items-center space-x-1 text-xs ${location.pathname === '/draw' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Vòng Quay</span>
              </Link>
              <Link to="/winners" className={`flex items-center space-x-1 text-xs ${location.pathname === '/winners' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Trúng Thưởng</span>
              </Link>
              <Link to="/admin" className={`flex items-center space-x-1 text-xs ${location.pathname === '/admin' ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Quản Lý</span>
              </Link>
              <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('yep_auth'); navigate('/'); }} className="text-slate-500 hover:text-white text-xs">Thoát</button>
            </div>
          </div>
        </nav>
      )}

      {/* Main content area */}
      <main className="flex-grow relative overflow-hidden md:p-4 p-2 flex flex-col items-center justify-center">
        <div className="max-w-7xl mx-auto h-full w-full">
          <Routes>
            {/* Khách quét QR mặc định vào đây */}
            <Route path="/" element={<CheckInView onCheckIn={addGuest} guests={guests} />} />
            
            {/* Trang đăng nhập cho BTC */}
            <Route path="/login" element={
              <div className="max-w-sm mx-auto glass-panel p-8 rounded-3xl text-center border-t-4 border-amber-500 shadow-2xl">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">BTC Login</h2>
                <p className="text-slate-400 text-sm mb-6">Vui lòng nhập mã PIN để truy cập hệ thống quản trị.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input 
                    autoFocus
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Nhập mã PIN"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-center text-xl tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
                  <button type="submit" className="w-full lucky-gradient text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all">XÁC NHẬN</button>
                  <Link to="/" className="block text-slate-500 text-xs hover:text-white pt-2">Quay lại trang Check-in</Link>
                </form>
              </div>
            } />

            {/* Các trang bảo vệ cho Admin */}
            <Route path="/admin" element={<ProtectedRoute isAuthenticated={isAuthenticated}><AdminView guests={guests} prizes={prizes} onUpdatePrizes={updatePrizes} onReset={resetData} /></ProtectedRoute>} />
            <Route path="/draw" element={<ProtectedRoute isAuthenticated={isAuthenticated}><LuckyDrawView guests={guests} prizes={prizes} winners={winners} onWin={addWinner} /></ProtectedRoute>} />
            <Route path="/winners" element={<ProtectedRoute isAuthenticated={isAuthenticated}><WinnersView winners={winners} /></ProtectedRoute>} />
            
            {/* Redirect fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
