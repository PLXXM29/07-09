import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import './navbar.css';

const { Header } = Layout;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('isLogin') === 'true');
  const email = localStorage.getItem('memberEmail'); // ดึงอีเมลจาก localStorage

  const handleLogout = () => {
    const email = localStorage.getItem('email'); // นำอีเมลจาก Local Storage มาแสดงใน console
    console.log(`email: ${email} is logout`);

    localStorage.removeItem('isLogin');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('email'); // ลบข้อมูลอีเมลออกด้วย

    navigate('/login');
  };
  const handleLoginClick = () => {
    if (isLoggedIn) {
      handleLogout(); // ถ้าผู้ใช้ล็อกอินแล้วให้ล็อกเอาท์
    } else {
      navigate('/login'); // ถ้ายังไม่ได้ล็อกอินให้ไปที่หน้า login
    }
  };

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLogin') === 'true');
  }, []);

  return (
    <Header className="header">
      <div className="logo">
        MERJE CINIPLEX
      </div>
      <div className="menu">
        <span className="link" onClick={() => navigate('/home')}>Home</span>
        <span className="link" onClick={() => navigate('/myticket')}>MyTicket</span>
        <span className="link" onClick={() => navigate('/news')}>MERJE news</span>
        <span className="link" onClick={() => navigate('/reward')}>Reward</span>
        <Button type="primary" className="button" onClick={handleLoginClick}>
          {isLoggedIn ? 'Logout' : 'Login'}
        </Button>
      </div>
    </Header>
  );
};

export default Navbar;
