package com.example.legal_connect.service;

import com.example.legal_connect.entity.*;
import com.example.legal_connect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MentionService {
    
    private final MentionRepository mentionRepository;
    private final UserRepository userRepository;
    private final ForumRepository forumRepository;
    private final PostReplyRepository replyRepository;
    private final NotificationService notificationService;
    
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([\\w\\s]+)");
    
    /**
     * Extract usernames from content that match @username pattern
     */
    public List<String> extractMentionsFromContent(String content) {
        List<String> mentions = new ArrayList<>();
        if (content == null || content.trim().isEmpty()) {
            return mentions;
        }
        
        // Remove HTML tags first to get clean text
        String cleanContent = content.replaceAll("<[^>]*>", " ");
        
        Matcher matcher = MENTION_PATTERN.matcher(cleanContent);
        while (matcher.find()) {
            String username = matcher.group(1).trim();
            if (!username.isEmpty() && !mentions.contains(username)) {
                mentions.add(username);
            }
        }
        
        return mentions;
    }
    
    /**
     * Create mention entities for a post
     */
    @Transactional
    public void createMentionsForPost(Long postId, String content, Long authorId) {
        List<String> mentionedNames = extractMentionsFromContent(content);
        if (mentionedNames.isEmpty()) {
            return;
        }
        
        Post post = forumRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Author not found"));
        
        createAndNotifyMentions(mentionedNames, author, post, null, content);
    }
    
    /**
     * Create mention entities for a reply
     */
    @Transactional
    public void createMentionsForReply(Long replyId, String content, Long authorId) {
        List<String> mentionedNames = extractMentionsFromContent(content);
        if (mentionedNames.isEmpty()) {
            return;
        }
        
        PostReply reply = replyRepository.findById(replyId)
            .orElseThrow(() -> new RuntimeException("Reply not found"));
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Author not found"));
        
        // Update mentioned user IDs in reply
        List<Long> mentionedUserIds = new ArrayList<>();
        for (String name : mentionedNames) {
            Optional<User> user = userRepository.findByFullName(name);
            user.ifPresent(u -> mentionedUserIds.add(u.getId()));
        }
        
        if (!mentionedUserIds.isEmpty()) {
            reply.setMentionedUserIds(String.join(",", mentionedUserIds.stream()
                .map(String::valueOf).toArray(String[]::new)));
            replyRepository.save(reply);
        }
        
        createAndNotifyMentions(mentionedNames, author, null, reply, content);
    }
    
    private void createAndNotifyMentions(List<String> mentionedNames, User author, 
                                        Post post, PostReply reply, String content) {
        for (String mentionedName : mentionedNames) {
            Optional<User> mentionedUser = userRepository.findByFullName(mentionedName);
            
            if (mentionedUser.isPresent() && !mentionedUser.get().getId().equals(author.getId())) {
                User mentioned = mentionedUser.get();
                
                // Create mention entity
                Mention mention = Mention.builder()
                    .mentionedUser(mentioned)
                    .mentioningUser(author)
                    .post(post)
                    .reply(reply)
                    .contentSnippet(getContentSnippet(content, 100))
                    .build();
                
                mentionRepository.save(mention);
                
                // Create notification
                String message = author.getFullName() + " đã nhắc đến bạn trong " + 
                    (post != null ? "bài viết" : "câu trả lời");
                Long entityId = post != null ? post.getId() : reply.getId();
                String entityType = post != null ? "POST" : "REPLY";
                
                notificationService.createNotification(
                    mentioned.getId(),
                    Notification.NotificationType.MENTION,
                    message,
                    entityId,
                    entityType
                );
            }
        }
    }
    
    private String getContentSnippet(String content, int maxLength) {
        if (content == null) return "";
        String cleanContent = content.replaceAll("<[^>]*>", " ").trim();
        if (cleanContent.length() <= maxLength) {
            return cleanContent;
        }
        return cleanContent.substring(0, maxLength) + "...";
    }
}

