package com.eventvenue.controller;

import com.eventvenue.dto.ApiResponse;
import com.eventvenue.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8000"})
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "general") String type) {
        try {
            String url = fileUploadService.uploadImage(file, type);
            
            Map<String, Object> data = new HashMap<>();
            data.put("url", url);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Image uploaded successfully")
                    .data(data)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @PostMapping("/images")
    public ResponseEntity<ApiResponse> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "type", defaultValue = "general") String type) {
        try {
            if (files.length > 10) {
                return ResponseEntity.badRequest().body(ApiResponse.builder()
                        .success(false)
                        .message("Maximum 10 images allowed")
                        .build());
            }
            
            List<String> urls = fileUploadService.uploadImages(files, type);
            
            Map<String, Object> data = new HashMap<>();
            data.put("urls", urls);
            
            return ResponseEntity.ok(ApiResponse.builder()
                    .success(true)
                    .message("Images uploaded successfully")
                    .data(data)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}
