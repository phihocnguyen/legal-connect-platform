package com.example.legal_connect.config;

import com.example.legal_connect.entity.*;
import com.example.legal_connect.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Data Seeder for Analytics Testing
 * Generates mock data for users, posts, replies, and votes
 * Runs automatically on startup (always executes)
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AnalyticsDataSeeder {

    private final UserRepository userRepository;
    private final PostCategoryRepository postCategoryRepository;
    private final ForumRepository forumRepository;
    private final PostReplyRepository postReplyRepository;
    private final PostVoteRepository postVoteRepository;
    private final PasswordEncoder passwordEncoder;
    
    private final Random random = new Random();
    
    private static final String[] VIETNAMESE_FIRST_NAMES = {
        "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi",
        "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
    };
    
    private static final String[] VIETNAMESE_MIDDLE_NAMES = {
        "Văn", "Thị", "Đức", "Minh", "Hữu", "Thanh", "Quang", "Anh", "Tuấn", "Hoàng",
        "Xuân", "Thu", "Hà", "Mai", "Lan"
    };
    
    private static final String[] VIETNAMESE_LAST_NAMES = {
        "An", "Bình", "Cường", "Dũng", "Đạt", "Hải", "Hùng", "Khang", "Long", "Nam",
        "Phong", "Quân", "Sơn", "Thắng", "Trung", "Tú", "Vinh", "Vương", "Hoa", "Linh"
    };
    
    private static final String[] POST_TITLES = {
        "Thủ tục ly hôn đơn phương cần những giấy tờ gì?",
        "Quyền thừa kế của con riêng khi bố mẹ tái hôn",
        "Tranh chấp đất đai giữa anh em ruột, xử lý thế nào?",
        "Hợp đồng lao động thời vụ có được hưởng BHXH không?",
        "Sa thải nhân viên trong thời gian thai sản có hợp pháp?",
        "Đơn phương chấm dứt hợp đồng thuê nhà trước hạn",
        "Bồi thường thiệt hại khi xe bị đâm ở bãi giữ xe",
        "Quyền lợi của người lao động khi công ty phá sản",
        "Thủ tục kê khai thuế thu nhập cá nhân năm 2024",
        "Xin giấy phép kinh doanh online cần những gì?",
        "Hỏi về điều kiện nhận trợ cấp thất nghiệp",
        "Tranh chấp hợp đồng mua bán nhà đất chưa công chứng",
        "Quyền nuôi con sau ly hôn thuộc về ai?",
        "Thủ tục đăng ký kết hôn với người nước ngoài",
        "Tư vấn về hợp đồng chuyển nhượng quyền sử dụng đất",
        "Vi phạm giao thông bị tạm giữ bằng lái, xử lý thế nào?",
        "Bị công ty nợ lương 3 tháng, có thể làm gì?",
        "Quyền và nghĩa vụ của người thuê nhà trọ",
        "Thủ tục đăng ký bảo hộ nhãn hiệu hàng hóa",
        "Tư vấn về hợp đồng vay tiền có lãi suất cao"
    };
    
    private static final String[] CATEGORIES = {
        "Luật Dân sự", "Luật Hình sự", "Luật Lao động", 
        "Luật Đất đai", "Luật Hôn nhân và Gia đình", "Luật Kinh doanh",
        "Luật Giao thông", "Luật Thuế", "Luật Thương mại",
        "Luật Doanh nghiệp", "Luật Bảo hiểm xã hội", "Luật Bất động sản",
        "Luật Trật tự an toàn giao thông", "Luật Bảo vệ người tiêu dùng", "Luật Sở hữu trí tuệ"
    };

    @Bean
    public CommandLineRunner seedAnalyticsData() {
        return args -> {
            log.info("🌱 Starting Analytics Data Seeding...");
            
            long userCount = userRepository.count();
            if (userCount > 5) {
                log.info("⚠️  Data already exists (found {} users). Skipping seeding.", userCount);
                return;
            }
            
            try {
                seedData();
                log.info("✅ Analytics Data Seeding completed successfully!");
            } catch (Exception e) {
                log.error("❌ Error during data seeding: {}", e.getMessage(), e);
            }
        };
    }
    
    @Transactional
    public void seedData() {
        log.info("Creating categories...");
        List<PostCategory> categories = createCategories();
        
        log.info("Creating users...");
        List<User> users = createUsers(10); // 10 users
        List<User> lawyers = createLawyers(10); // 10 lawyers
        
        log.info("Creating posts...");
        List<Post> posts = createPosts(categories, users, lawyers, 100); // 100 posts
        
        log.info("Creating replies...");
        createReplies(posts, users, lawyers, 200); // 200 replies
        
        log.info("Creating votes...");
        createVotes(posts, users, 150); // 150 votes
        
        log.info("📊 Mock data created:");
        log.info("  - Categories: {}", categories.size());
        log.info("  - Users: {}", users.size());
        log.info("  - Lawyers: {}", lawyers.size());
        log.info("  - Posts: {}", posts.size());
        log.info("  - Replies: ~500");
        log.info("  - Votes: ~300");
    }
    
    private List<PostCategory> createCategories() {
        List<PostCategory> categories = new ArrayList<>();
        
        for (int i = 0; i < CATEGORIES.length; i++) {
            String name = CATEGORIES[i];
            PostCategory category = new PostCategory();
            category.setName(name);
            category.setSlug(createSlug(name));
            category.setDescription("Thảo luận về " + name);
            category.setIcon("⚖️");
            category.setDisplayOrder(i);
            category.setIsActive(true);
            category.setCreatedAt(LocalDateTime.now().minusDays(90));
            category.setUpdatedAt(LocalDateTime.now().minusDays(90));
            
            categories.add(postCategoryRepository.save(category));
        }
        
        return categories;
    }
    
    private List<User> createUsers(int count) {
        List<User> users = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            String fullName = generateVietnameseName();
            User user = User.builder()
                .email("user" + i + "@example.com")
                .password(passwordEncoder.encode("password123"))
                .fullName(fullName)
                .role(User.Role.USER)
                .authProvider(User.AuthProvider.LOCAL)
                .build();
            
            User savedUser = userRepository.save(user);
            
            LocalDateTime randomDate = LocalDateTime.now()
                .minusDays(random.nextInt(90))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));
            
            userRepository.flush();
            savedUser.setCreatedAt(randomDate);
            users.add(userRepository.save(savedUser));
        }
        
        return users;
    }
    
    private List<User> createLawyers(int count) {
        List<User> lawyers = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            String fullName = "Luật sư " + generateVietnameseName();
            User lawyer = User.builder()
                .email("lawyer" + i + "@lawfirm.com")
                .password(passwordEncoder.encode("password123"))
                .fullName(fullName)
                .role(User.Role.LAWYER)
                .authProvider(User.AuthProvider.LOCAL)
                .build();
            
            User savedLawyer = userRepository.save(lawyer);
            
            LocalDateTime randomDate = LocalDateTime.now()
                .minusDays(random.nextInt(90))
                .minusHours(random.nextInt(24));
            
            userRepository.flush();
            savedLawyer.setCreatedAt(randomDate);
            lawyers.add(userRepository.save(savedLawyer));
        }
        
        return lawyers;
    }
    
    private List<Post> createPosts(List<PostCategory> categories, List<User> users, 
                                   List<User> lawyers, int count) {
        List<Post> posts = new ArrayList<>();
        List<User> allUsers = new ArrayList<>();
        allUsers.addAll(users);
        allUsers.addAll(lawyers);
        
        for (int i = 0; i < count; i++) {
            Post post = new Post();
            
            String title = POST_TITLES[random.nextInt(POST_TITLES.length)] + " #" + (i + 1);
            post.setTitle(title);
            post.setSlug(createSlug(title) + "-" + i);
            
            post.setContent(generatePostContent());
            
            post.setCategory(categories.get(random.nextInt(categories.size())));
            
            post.setAuthor(allUsers.get(random.nextInt(allUsers.size())));
            
            post.setViews(random.nextInt(1000));
            post.setReplyCount(random.nextInt(20));
            post.setUpvoteCount(random.nextInt(50));
            post.setDownvoteCount(random.nextInt(10));
            post.setIsActive(true);
            post.setPinned(random.nextDouble() < 0.05); // 5% pinned
            post.setSolved(random.nextDouble() < 0.3); // 30% solved
            post.setIsHot(random.nextDouble() < 0.1); // 10% hot
            
            Post savedPost = forumRepository.save(post);
            
            LocalDateTime randomDate = LocalDateTime.now()
                .minusDays(random.nextInt(60))
                .minusHours(random.nextInt(24))
                .minusMinutes(random.nextInt(60));
            
            forumRepository.flush();
            savedPost.setCreatedAt(randomDate);
            savedPost.setUpdatedAt(randomDate);
            posts.add(forumRepository.save(savedPost));
        }
        
        return posts;
    }
    
    private void createReplies(List<Post> posts, List<User> users, List<User> lawyers, int count) {
        List<User> allUsers = new ArrayList<>();
        allUsers.addAll(users);
        allUsers.addAll(lawyers);
        
        for (int i = 0; i < count; i++) {
            PostReply reply = new PostReply();
            
            Post post = posts.get(random.nextInt(posts.size()));
            reply.setPost(post);
            
            reply.setAuthor(allUsers.get(random.nextInt(allUsers.size())));
            
            reply.setContent(generateReplyContent());
            
            reply.setIsActive(true);
            reply.setIsSolution(random.nextDouble() < 0.1); // 10% are solutions
            reply.setUpvoteCount(random.nextInt(30));
            reply.setDownvoteCount(random.nextInt(5));
            
            PostReply savedReply = postReplyRepository.save(reply);
            
            LocalDateTime replyDate = post.getCreatedAt()
                .plusHours(random.nextInt(48))
                .plusMinutes(random.nextInt(60));
            
            if (replyDate.isAfter(LocalDateTime.now())) {
                replyDate = LocalDateTime.now().minusHours(random.nextInt(24));
            }
            
            postReplyRepository.flush();
            savedReply.setCreatedAt(replyDate);
            savedReply.setUpdatedAt(replyDate);
            postReplyRepository.save(savedReply);
        }
    }
    
    private void createVotes(List<Post> posts, List<User> users, int count) {
        for (int i = 0; i < count; i++) {
            PostVote vote = new PostVote();
            
            Post post = posts.get(random.nextInt(posts.size()));
            vote.setPost(post);
            
            User user = users.get(random.nextInt(users.size()));
            vote.setUser(user);
            
            vote.setVoteType(random.nextDouble() < 0.8 ? 
                PostVote.VoteType.UPVOTE : PostVote.VoteType.DOWNVOTE);
            
            try {
                PostVote savedVote = postVoteRepository.save(vote);
                
                LocalDateTime voteDate = post.getCreatedAt()
                    .plusHours(random.nextInt(72));
                
                if (voteDate.isAfter(LocalDateTime.now())) {
                    voteDate = LocalDateTime.now().minusHours(random.nextInt(12));
                }
                
                postVoteRepository.flush();
                savedVote.setCreatedAt(voteDate);
                savedVote.setUpdatedAt(voteDate);
                postVoteRepository.save(savedVote);
            } catch (Exception e) {
                log.debug("Skipping duplicate vote: {}", e.getMessage());
            }
        }
    }
    
    private String generateVietnameseName() {
        String firstName = VIETNAMESE_FIRST_NAMES[random.nextInt(VIETNAMESE_FIRST_NAMES.length)];
        String middleName = VIETNAMESE_MIDDLE_NAMES[random.nextInt(VIETNAMESE_MIDDLE_NAMES.length)];
        String lastName = VIETNAMESE_LAST_NAMES[random.nextInt(VIETNAMESE_LAST_NAMES.length)];
        return firstName + " " + middleName + " " + lastName;
    }
    
    private String generatePostContent() {
        String[] templates = {
            "Tôi đang gặp vấn đề về {}. Xin các luật sư tư vấn giúp tôi. Cảm ơn!",
            "Mọi người cho tôi hỏi về {}. Trường hợp của tôi như thế nào?",
            "Hiện tại tôi đang trong tình huống {}. Tôi nên làm gì?",
            "Xin được tư vấn về {}. Tôi rất cần sự giúp đỡ từ các chuyên gia.",
            "Vấn đề {} của tôi đang rất cấp bách. Mong nhận được sự hỗ trợ."
        };
        
        String template = templates[random.nextInt(templates.length)];
        return template.replace("{}", "vấn đề pháp lý");
    }
    
    private String generateReplyContent() {
        String[] replies = {
            "Theo quy định pháp luật hiện hành, trường hợp của bạn cần xem xét kỹ hơn. Bạn có thể cung cấp thêm thông tin không?",
            "Tôi khuyên bạn nên tìm gặp luật sư để được tư vấn trực tiếp. Đây là vấn đề khá phức tạp.",
            "Về vấn đề này, bạn cần chuẩn bị các giấy tờ liên quan và làm theo đúng thủ tục pháp luật.",
            "Tôi đã từng gặp trường hợp tương tự. Bạn nên làm như sau...",
            "Cảm ơn bạn đã chia sẻ. Theo kinh nghiệm của tôi thì...",
            "Đây là vấn đề khá phổ biến. Giải pháp tốt nhất là...",
            "Bạn cần lưu ý một số điểm quan trọng trong trường hợp này..."
        };
        
        return replies[random.nextInt(replies.length)];
    }
    
    private String createSlug(String text) {
        return text.toLowerCase()
            .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
            .replaceAll("[èéẹẻẽêềếệểễ]", "e")
            .replaceAll("[ìíịỉĩ]", "i")
            .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
            .replaceAll("[ùúụủũưừứựửữ]", "u")
            .replaceAll("[ỳýỵỷỹ]", "y")
            .replaceAll("[đ]", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
