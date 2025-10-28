package handler

import (
	"WhyAi/internal/domain"
	"WhyAi/pkg/logger"
	"WhyAi/pkg/responser"
	"io"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

func (h *Handler) ScanPhoto(c *gin.Context) {
	_, err := h.middleware.GetUserId(c)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusUnauthorized, domain.UnAuthorizedError)
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		responser.NewErrorResponse(c, http.StatusBadRequest, "invalid form data")
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		responser.NewErrorResponse(c, http.StatusBadRequest, "no files provided")
		return
	}

	sort.Slice(files, func(i, j int) bool {
		return files[i].Filename < files[j].Filename
	})

	var fileReaders []io.Reader
	var filenames []string

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			responser.NewErrorResponse(c, http.StatusBadRequest, "failed to open file: "+fileHeader.Filename)
			return
		}
		defer file.Close()

		fileReaders = append(fileReaders, file)
		filenames = append(filenames, fileHeader.Filename)
	}

	logger.Log.Infof("processing %d files: %v", len(files), filenames)

	scan, err := h.service.Scan.ScanPhoto(fileReaders, filenames)
	if err != nil {
		responser.NewErrorResponse(c, http.StatusInternalServerError, err.Error())
		logger.Log.Errorf("failed to scan photo: %v", err)
		return
	}
	logger.Log.Infof("scan result: %v", scan)
	c.JSON(http.StatusOK, gin.H{
		"result": scan,
	})
}
