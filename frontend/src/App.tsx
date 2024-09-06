import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Members from './pages/Member/Member';
import Showtime from './pages/Showtime/Showtime';
import Analytics from './pages/Analytics/Analytics';
import Login from './pages/Login/login';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/home';
import MyTicket from './pages/MyTicket/myticket'; // เพิ่มการอิมพอร์ต MyTicket

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();  // ใช้ useLocation เพื่อตรวจสอบเส้นทางปัจจุบัน
    const isLoggedIn = localStorage.getItem('isLogin') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    useEffect(() => {
        if (isLoggedIn) {
            // ถ้าเป็น Admin และไม่อยู่ในเส้นทาง Admin ให้ไปที่ Dashboard
            if (isAdmin && !['/dashboard', '/showtimes', '/members', '/analytics'].includes(location.pathname)) {
                navigate('/dashboard');
            }
            // ถ้าไม่ใช่ Admin และไม่อยู่ในเส้นทาง Home หรือ MyTicket ให้ไปที่ Home
            if (!isAdmin && !['/home', '/myticket'].includes(location.pathname)) {
                navigate('/home');
            }
        } else {
            navigate('/login'); // ถ้าไม่ได้ล็อกอินให้นำทางไปที่หน้า Login
        }
    }, [isLoggedIn, isAdmin, navigate, location.pathname]);

    return (
        <div className="app">
            {isLoggedIn && isAdmin && <Sidebar />}  {/* แสดง Sidebar เฉพาะเมื่อผู้ใช้ล็อกอินแล้วและเป็น Admin */}
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Navigate to={isLoggedIn ? (isAdmin ? "/dashboard" : "/home") : "/login"} />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* เส้นทางสำหรับผู้ใช้ Admin */}
                    <Route path="/dashboard" element={isLoggedIn && isAdmin ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/showtimes" element={isLoggedIn && isAdmin ? <Showtime /> : <Navigate to="/login" />} />
                    <Route path="/members" element={isLoggedIn && isAdmin ? <Members /> : <Navigate to="/login" />} />
                    <Route path="/analytics" element={isLoggedIn && isAdmin ? <Analytics /> : <Navigate to="/login" />} />

                    {/* เส้นทางสำหรับผู้ใช้ที่ไม่ใช่ Admin */}
                    <Route path="/home" element={isLoggedIn && !isAdmin ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/myticket" element={isLoggedIn && !isAdmin ? <MyTicket /> : <Navigate to="/login" />} /> {/* เพิ่มเส้นทางสำหรับ MyTicket */}

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
