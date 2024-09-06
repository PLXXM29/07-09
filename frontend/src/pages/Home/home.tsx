import React, { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/navbar/navbar';
import './home.css'; // นำเข้าไฟล์ CSS

// ประกาศ interface สำหรับข้อมูลที่ได้รับจาก API
interface Movie {
  ID: number;
  MovieName: string;
}

interface Showtime {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  showdate: string;
  movie_id: number;
  theater_id: number;
  movieName?: string; // เพิ่ม movieName ใน interface 
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]); // สร้าง state สำหรับเก็บข้อมูล
  const [loading, setLoading] = useState<boolean>(true); // สร้าง state สำหรับโหลดข้อมูล

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ดึงข้อมูล showtimes
        const showtimesResponse = await axios.get('http://localhost:8000/api/showtimes');
        const showtimesData = showtimesResponse.data;

        // ดึงข้อมูลหนังทั้งหมด
        const moviesResponse = await axios.get('http://localhost:8000/api/movies');
        const moviesData: Movie[] = moviesResponse.data;

        // รวมข้อมูล showtimes กับ movieName
        const showtimesWithMovies = showtimesData.map((showtime: Showtime) => {
          const movie = moviesData.find((movie: Movie) => movie.ID === showtime.movie_id);
          return {
            ...showtime,
            movieName: movie?.MovieName || "Unknown Movie", // ถ้าหากเจอหนังที่สัมพันธ์กันให้เพิ่ม movieName
          };
        });

        setShowtimes(showtimesWithMovies);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const goToBooking = (showtime: Showtime) => {
    // แสดงข้อมูลทั้งหมดของ showtime ใน console
    console.log("Selected Showtime Details:", showtime);

    // นำทางไปยังหน้าการจองหนัง
    navigate(`/booking/${showtime.movie_id}`);
  };

  if (loading) {
    return <div>Loading...</div>; // แสดงข้อความระหว่างโหลดข้อมูล
  }

  return (
    <div className="home-container">
      <Navbar />
      <h1 className="home-title">WELCOME TO MERJE CINIPLEX</h1>
      <div className="movie-buttons">
        {showtimes.length > 0 ? (
          showtimes.map(showtime => {
            const key = `${showtime.id || Math.random()}-${showtime.movie_id || Math.random()}-${showtime.theater_id || Math.random()}`;
            return (
              <Button
                key={key}  // ใช้ key ที่ไม่ซ้ำกัน
                type="primary"
                size="large"
                onClick={() => goToBooking(showtime)}
                className="home-button"
              >
                {`Movie Title: ${showtime.movieName}`} {/* แสดงชื่อหนัง */}
              </Button>
            );
          })
        ) : (
          <div>No movies available</div> // แสดงข้อความเมื่อไม่มีข้อมูลหนัง
        )}
      </div>
    </div>
  );
};

export default Home;
