package com.verbaltest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * CORS 配置 —— 使用 Servlet Filter 而非 WebMvcConfigurer.addCorsMappings，
 * 并且提升到最高优先级，确保错误响应（400/404/500 等）也能带上 CORS 头。
 *
 * 允许来源通过 app.cors.allowed-origins（环境变量 ALLOWED_ORIGINS）配置：
 * - 本地开发默认 "*"
 * - 线上设置成具体的前端域名，例 https://your-frontend-domain.com
 */
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsConfig {

    private final String[] allowedOrigins;

    public CorsConfig(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        for (String origin : allowedOrigins) {
            config.addAllowedOriginPattern(origin.trim());
        }
        config.setAllowedMethods(List.of("GET", "POST", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
