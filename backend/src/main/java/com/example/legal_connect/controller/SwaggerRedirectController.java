package com.example.legal_connect.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerRedirectController {

    @GetMapping("/")
    public String redirectToSwagger() {
        return "redirect:/swagger-ui.html";
    }
    
    @GetMapping("/docs")
    public String redirectToDocs() {
        return "redirect:/swagger-ui.html";
    }
}
