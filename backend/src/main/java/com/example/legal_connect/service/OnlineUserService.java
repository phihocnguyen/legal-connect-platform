package com.example.legal_connect.service;

import com.example.legal_connect.dto.chat.OnlineUsersResponse;
import com.example.legal_connect.dto.chat.UserOnlineStatus;

import java.util.List;
public interface OnlineUserService {
    void addUser(String userId, String userName, String userType, String sessionId, String avatar);
    void removeUser(String userId);
    void removeUserBySessionId(String sessionId);
    void updateLastSeen(String userId);
    OnlineUsersResponse getOnlineUsers();
    boolean isUserOnline(String userId);
    UserOnlineStatus getUserOnlineStatus(String userId);
    int getTotalOnlineUsers();
    List<UserOnlineStatus> getOnlineUsersByType(String userType);
}