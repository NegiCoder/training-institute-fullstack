/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.DTOs.Notifications;

namespace TrainingInstitute.Api.Services;

public interface INotificationService
{
    Task CreateForUserAsync(int userId, string type, string title, string message, string? link = null);

    Task CreateForAdminsAsync(string type, string title, string message, string? link = null);

    Task CreateForCourseTrainersAsync(int courseId, string type, string title, string message, string? link = null);

    Task<List<NotificationResponse>> GetMyNotificationsAsync(int userId, bool unreadOnly, int take);

    Task<int> GetUnreadCountAsync(int userId);

    Task<bool> MarkAsReadAsync(int userId, int notificationId);

    Task<int> MarkAllReadAsync(int userId);
}
