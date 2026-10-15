package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// 创建一个默认的路由引擎
	r := gin.Default()
	//配置路由
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "值:%v", "你好gin")
	})
	r.GET("/new", func(c *gin.Context) {
		c.String(http.StatusOK, "值:%v", "进入new路由")
	})
	r.POST("/add", func(c *gin.Context) {
		c.String(http.StatusOK, "post请求的add路了由")
	})

	r.PUT("/edit", func(c *gin.Context) {
		c.String(200, "这是一个put请求 主要用于编辑数据")
	})

	r.DELETE("/delete", func(c *gin.Context) {
		c.String(200, "这是一个DELETE请求 用于删除数据")
	})
	r.Run(":8080") // 默认在 localhost:8080 启动服务

}
