package config

import (
	"fmt"
	"time"

	"github.com/tanapon395/sa-67-example/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("cinema.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {

	// ตรวจสอบการเชื่อมต่อฐานข้อมูล
	if db == nil {
		fmt.Println("Database connection failed")
	} else {
		fmt.Println("Database connected successfully")
	}

	// AutoMigrate สำหรับทุก entity พร้อมตรวจสอบการทำงาน
	err := db.AutoMigrate(
		&entity.Member{},
		&entity.Gender{},
		&entity.Movie{},
		&entity.Theater{},
		&entity.ShowTimes{},
		&entity.Ticket{},
		&entity.Seat{},       // ตรวจสอบว่ามีการสร้างตารางที่นั่ง
		&entity.Payment{},
		&entity.BookSeat{},
		&entity.Booking{},
	)
	if err != nil {
		fmt.Println("Error in AutoMigrate:", err)
	} else {
		fmt.Println("AutoMigrate completed successfully.")
	}

	// สร้างข้อมูลเพศ
	GenderMale := entity.Gender{Name: "Male"}
	GenderFemale := entity.Gender{Name: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Gender{Name: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Gender{Name: "Female"})

	// สร้างข้อมูลสมาชิก
	hashedPassword, _ := HashPassword("123456")
	Member := &entity.Member{
		UserName:   "user1",
		FirstName:  "John",
		LastName:   "Doe",
		Email:      "john.doe@example.com",
		Password:   hashedPassword,
		GenderID:   GenderMale.ID,
		TotalPoint: 100,
		Role:       "customer",
	}
	db.FirstOrCreate(Member, &entity.Member{
		Email: "john.doe@example.com",
	})

	// สร้างข้อมูลภาพยนตร์ 3 เรื่อง
	movies := []entity.Movie{
		{MovieName: "Inception", MovieDuration: 120},
		{MovieName: "The Dark Knight", MovieDuration: 152},
		{MovieName: "Interstellar", MovieDuration: 169},
	}

	for i := range movies {
		if err := db.FirstOrCreate(&movies[i], entity.Movie{MovieName: movies[i].MovieName}).Error; err != nil {
			fmt.Printf("Error creating movie: %s\n", err)
		}
	}

	// สร้างข้อมูลโรงหนัง 3 โรง
	theaters := []entity.Theater{
		{TheaterName: "Theater 1"},
		{TheaterName: "Theater 2"},
		{TheaterName: "Theater 3"},
	}

	for i := range theaters {
		if err := db.FirstOrCreate(&theaters[i], entity.Theater{TheaterName: theaters[i].TheaterName}).Error; err != nil {
			fmt.Printf("Error creating theater: %s\n", err)
		}
	}

	// สร้างที่นั่งสำหรับแต่ละโรงหนัง
	seatNumbers := []string{}
	for row := 'A'; row <= 'H'; row++ {
		for num := 1; num <= 20; num++ {
			seatNumber := fmt.Sprintf("%c%d", row, num)
			seatNumbers = append(seatNumbers, seatNumber)
		}
	}

	for _, theater := range theaters {
		for _, seatNo := range seatNumbers {
			seat := entity.Seat{
				SeatNo:    seatNo,
				Status:    "Available",
				Price:     200,
				TheaterID: &theater.ID,
			}
			if err := db.FirstOrCreate(&seat, &entity.Seat{SeatNo: seatNo, TheaterID: &theater.ID}).Error; err != nil {
				fmt.Printf("Error creating seat: %s\n", err)
				fmt.Println(err)
			}
		}
	}

	// สร้างข้อมูลการฉายภาพยนตร์
	showTimes := []entity.ShowTimes{
		{ShowDate: time.Date(2024, 10, 28, 14, 0, 0, 0, time.UTC), MovieID: movies[0].ID, TheaterID: theaters[0].ID},
		{ShowDate: time.Date(2024, 10, 28, 16, 0, 0, 0, time.UTC), MovieID: movies[1].ID, TheaterID: theaters[1].ID},
		{ShowDate: time.Date(2024, 10, 29, 12, 0, 0, 0, time.UTC), MovieID: movies[2].ID, TheaterID: theaters[2].ID},
	}

	for i := range showTimes {
		if err := db.FirstOrCreate(&showTimes[i], entity.ShowTimes{ShowDate: showTimes[i].ShowDate, MovieID: showTimes[i].MovieID, TheaterID: showTimes[i].TheaterID}).Error; err != nil {
			fmt.Printf("Error creating showtime: %s\n", err)
		}
	}

	// สร้าง tickets สำหรับสมาชิกที่ 1
	tickets := []entity.Ticket{
		{Point: 10, Status: "Booked", MemberID: Member.ID},
		{Point: 15, Status: "Booked", MemberID: Member.ID},
	}

	for i := range tickets {
		if err := db.Create(&tickets[i]).Error; err != nil {
			fmt.Printf("Error creating ticket: %s\n", err)
		}
	}

	// สร้าง payments และเชื่อมโยง ticket_id ที่ถูกต้อง
	now := time.Now()

	payments := []entity.Payment{
		{TotalPrice: 600, Status: "Paid", PaymentTime: now, MemberID: Member.ID, TicketID: tickets[0].ID},
		{TotalPrice: 900, Status: "Paid", PaymentTime: now, MemberID: Member.ID, TicketID: tickets[1].ID},
	}

	for i := range payments {
		if err := db.Create(&payments[i]).Error; err != nil {
			fmt.Printf("Error creating payment: %s\n", err)
		} else {
			fmt.Printf("Payment %d created with ID: %d\n", i+1, payments[i].ID)
		}
	}

	// สร้างการจองและเชื่อมโยงกับที่นั่งและการฉายภาพยนตร์ที่สอดคล้องกัน
	seatNumbersForBooking := []string{"A1", "A2", "A3"}
	for _, seatNo := range seatNumbersForBooking {
		// ค้นหาที่นั่งในโรงภาพยนตร์ที่ถูกต้อง
		var seat entity.Seat
		if err := db.Where("seat_no = ? AND theater_id = ?", seatNo, theaters[0].ID).First(&seat).Error; err != nil {
			fmt.Printf("Error finding seat: %s\n", err)
			continue
		}

		// ตรวจสอบสถานะที่นั่งก่อนการจอง
		if seat.Status != "Available" {
			fmt.Printf("Seat %s is not available\n", seatNo)
			continue
		}

		booking := entity.Booking{
			MemberID:    Member.ID,
			ShowTimeID:  showTimes[0].ID, // เชื่อมโยงกับการฉายภาพยนตร์ที่ถูกต้อง
			SeatID:      seat.ID,
			BookingTime: time.Now(),
			Status:      "confirmed",
		}

		if err := db.Create(&booking).Error; err != nil {
			fmt.Printf("Error creating booking: %s\n", err)
		}

		// อัปเดตสถานะที่นั่งหลังจากการจอง
		db.Model(&seat).Update("Status", "Booked")
	}

	fmt.Println("Database setup complete")
}
