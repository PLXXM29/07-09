package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)

// GetTickets รับข้อมูลตั๋วทั้งหมด
func ListTickets(c *gin.Context) {
	var tickets []entity.Ticket

	// ดึงข้อมูลตั๋วทั้งหมดจากฐานข้อมูล
	if err := config.DB().Preload("Member").Preload("Payment").Find(&tickets).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tickets)
}

// GetTicketByID รับข้อมูลตั๋วตาม ID
func GetTicketsById(c *gin.Context) {
	ID := c.Param("id")
	var ticket entity.Ticket

	// ค้นหาตั๋วตาม ID
	if err := config.DB().Preload("Member").Preload("Payment").First(&ticket, ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}
	c.JSON(http.StatusOK, ticket)
}

// CreateTicket สร้างตั๋วใหม่
func CreateTicket(c *gin.Context) {
	var ticket entity.Ticket

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// บันทึกข้อมูลตั๋วใหม่
	if err := config.DB().Create(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Ticket created", "data": ticket})
}

// UpdateTicket อัปเดตข้อมูลตั๋ว
func UpdateTicket(c *gin.Context) {
	ID := c.Param("id")
	var ticket entity.Ticket

	// ค้นหาตั๋วตาม ID
	if err := config.DB().First(&ticket, ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// Binding ข้อมูลจาก request body
	if err := c.ShouldBindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดตข้อมูลตั๋ว
	if err := config.DB().Save(&ticket).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket updated", "data": ticket})
}

// DeleteTicket ลบข้อมูลตั๋ว
func DeleteTicket(c *gin.Context) {
	ID := c.Param("id")

	// ลบข้อมูลตั๋วตาม ID
	if err := config.DB().Where("id = ?", ID).Delete(&entity.Ticket{}).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket deleted"})
}
