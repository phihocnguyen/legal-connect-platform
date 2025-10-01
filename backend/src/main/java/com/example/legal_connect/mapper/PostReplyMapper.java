package com.example.legal_connect.mapper;

import com.example.legal_connect.dto.forum.PostReplyDto;
import com.example.legal_connect.entity.PostReply;
import com.example.legal_connect.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PostReplyMapper {

    private final UserMapper userMapper;

    /**
     * Convert PostReply entity to PostReplyDto
     */
    public PostReplyDto toDto(PostReply reply) {
        if (reply == null) {
            return null;
        }

        PostReplyDto.PostReplyDtoBuilder builder = PostReplyDto.builder()
                .id(reply.getId())
                .content(reply.getContent())
                .postId(reply.getPost().getId())
                .parentId(reply.getParent() != null ? reply.getParent().getId() : null)
                .isActive(reply.getIsActive())
                .isSolution(reply.getIsSolution())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .isTopLevel(reply.isTopLevel())
                .childrenCount(reply.getChildrenCount());

        // Map author if available
        if (reply.getAuthor() != null) {
            builder.author(toUserSummaryDto(reply.getAuthor()));
        }

        // Map children if available
        if (reply.getChildren() != null && !reply.getChildren().isEmpty()) {
            List<PostReplyDto> childrenDtos = reply.getChildren().stream()
                .filter(PostReply::getIsActive)
                .map(this::toDto)
                .collect(Collectors.toList());
            builder.children(childrenDtos);
        }

        return builder.build();
    }

    /**
     * Convert User to UserSummaryDto for replies
     */
    public PostReplyDto.UserSummaryDto toUserSummaryDto(User user) {
        if (user == null) {
            return null;
        }

        return PostReplyDto.UserSummaryDto.builder()
                .id(user.getId())
                .name(getAuthorName(user))
                .email(user.getEmail())
                .role(getAuthorRole(user))
                .avatar(user.getAvatar())
                .build();
    }

    /**
     * Helper method to get author name
     */
    private String getAuthorName(User user) {
        return userMapper.getDisplayName(user);
    }

    /**
     * Helper method to get author role
     */
    private String getAuthorRole(User user) {
        return userMapper.getRoleString(user);
    }
}