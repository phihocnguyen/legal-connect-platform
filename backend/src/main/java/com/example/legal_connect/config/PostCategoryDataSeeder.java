package com.example.legal_connect.config;

import com.example.legal_connect.entity.PostCategory;
import com.example.legal_connect.repository.PostCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PostCategoryDataSeeder implements CommandLineRunner {

    private final PostCategoryRepository postCategoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (postCategoryRepository.count() == 0) {
            seedPostCategories();
            log.info("Post categories seeded successfully!");
        } else {
            log.info("Post categories already exist, skipping seeding.");
        }
    }

    private void seedPostCategories() {
        List<PostCategory> categories = Arrays.asList(
                createCategory("dan-su", "Luật Dân sự", 
                    "Thảo luận về các vấn đề liên quan đến luật dân sự, hợp đồng, thừa kế...", 
                    "⚖️", 1),
                    
                createCategory("hinh-su", "Luật Hình sự", 
                    "Trao đổi về các vấn đề liên quan đến tội phạm, hình phạt...", 
                    "👨‍⚖️", 2),
                    
                createCategory("dat-dai", "Luật Đất đai", 
                    "Thảo luận về quyền sử dụng đất, giấy tờ nhà đất...", 
                    "🏘️", 3),
                    
                createCategory("lao-dong", "Luật Lao động", 
                    "Trao đổi về quyền lợi người lao động, hợp đồng lao động...", 
                    "👥", 4),
                    
                createCategory("kinh-doanh", "Luật Kinh doanh", 
                    "Thảo luận về thành lập doanh nghiệp, đầu tư...", 
                    "💼", 5),
                    
                createCategory("thue", "Luật Thuế", 
                    "Trao đổi về các vấn đề thuế, kê khai thuế...", 
                    "📊", 6),
                    
                createCategory("gia-dinh", "Luật Hôn nhân và Gia đình", 
                    "Thảo luận về kết hôn, ly hôn, nuôi con...", 
                    "👨‍👩‍👧‍👦", 7),
                    
                createCategory("bao-hiem", "Luật Bảo hiểm", 
                    "Trao đổi về bảo hiểm xã hội, bảo hiểm y tế...", 
                    "🛡️", 8)
        );

        postCategoryRepository.saveAll(categories);
    }

    private PostCategory createCategory(String slug, String name, String description, String icon, int displayOrder) {
        PostCategory category = new PostCategory();
        category.setSlug(slug);
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setDisplayOrder(displayOrder);
        category.setIsActive(true);
        return category;
    }
}