import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import './myticket.css';
import Navbar from '../../components/navbar/navbar';
import { GetTicketById } from '../../services/https/index';

const MyTicket: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const memberID = localStorage.getItem('memberID');
    const token = localStorage.getItem('token');
  
    console.log("Using Member ID:", memberID); // เพิ่มบรรทัดนี้เพื่อตรวจสอบค่า
  
    if (!memberID || !token) {
      message.error('Please log in first');
      navigate('/login');
      return;
    }
  
    const fetchTickets = async () => {
      try {
        const data = await GetTicketById(Number(memberID));  // ใช้ GetTicketById
        console.log("Tickets data:", data);
        if (data && Array.isArray(data)) {
          setTickets(data);
        } else if (data) {
          setTickets([data]);
        } else {
          throw new Error("Data is not valid");
        }
      } catch (error) {
        console.error('Failed to load tickets:', error);
        message.error('Failed to load tickets. Please try again.');
      }
    };
  
    fetchTickets();
  }, [navigate]);

  const columns = [
    {
      title: 'Movie',
      dataIndex: ['ShowTime', 'Movie', 'MovieName'],
      key: 'movie',
      render: (text: any, record: any) => {
        const movieName = record.ShowTime?.Movie?.MovieName;
        console.log("Movie name:", movieName);
        return movieName || 'Unknown Movie';
      },
    },
    {
      title: 'Date',
      dataIndex: ['ShowTime', 'Showdate'],
      key: 'date',
      render: (text: string) => {
        console.log("Showdate:", text);
        return text ? new Date(text).toLocaleDateString() : 'Invalid Date';
      },
    },
    {
      title: 'Time',
      dataIndex: ['ShowTime', 'Showdate'],
      key: 'time',
      render: (text: string) => {
        console.log("Showtime:", text);
        return text ? new Date(text).toLocaleTimeString() : 'Invalid Time';
      },
    },
    {
      title: 'Seat',
      key: 'seat',
      render: (_: any, record: any) => {
        const seatNumbers = record.Seats ? record.Seats.map((seat: any) => seat.Seat_number).join(", ") : 'Unknown Seat';
        console.log("Seat number:", seatNumbers);
        return seatNumbers;
      },
    },
    {
      title: 'Theater',
      dataIndex: ['ShowTime', 'Theater', 'TheaterName'],
      key: 'theater',
      render: (text: any, record: any) => {
        const theaterName = record.ShowTime?.Theater?.TheaterName;
        console.log("Theater name:", theaterName);
        return theaterName || 'Unknown Theater';
      },
    },
  ];

  return (
    <div className="ticket-container">
      <Navbar />
      <h1 className="ticket-title">My Ticket History</h1>
      <Table
        dataSource={tickets}
        columns={columns}
        pagination={false}
        bordered
        className="ticket-table"
        rowClassName={(record, index) => (index % 2 === 0 ? 'row-light' : 'row-dark')}
      />
    </div>
  );
};

export default MyTicket;
