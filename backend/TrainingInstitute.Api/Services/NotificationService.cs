using Microsoft.EntityFrameworkCore;
using TrainingInstitute.Api.Data;
using TrainingInstitute.Api.DTOs.Notifications;
using TrainingInstitute.Api.Models;
using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Services;

public class NotificationService : INotificationService
{
    private const int MaxFetchLimit = 100;

    private readonly TrainingInstituteDbContext _context;

    public NotificationService(TrainingInstituteDbContext context)
    {
        _context = context;
    }

    public async Task CreateForUserAsync(
        int userId,
        string type,
        string title,
        string message,
        string? link = null)
    {
        var notification = BuildNotification(userId, type, title, message, link);
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();
    }

    public async Task CreateForAdminsAsync(
        string type,
        string title,
        string message,
        string? link = null)
    {
        var adminIds = await _context.Users
            .Where(u => u.Role == UserRole.Admin && u.IsActive)
            .Select(u => u.UserId)
            .ToListAsync();

        await InsertManyAsync(adminIds, type, title, message, link);
    }

    public async Task CreateForCourseTrainersAsync(
        int courseId,
        string type,
        string title,
        string message,
        string? link = null)
    {
        var trainerIds = await _context.CourseTrainers
            .Where(ct => ct.CourseId == courseId && ct.Trainer != null && ct.Trainer.IsActive)
            .Select(ct => ct.TrainerId)
            .Distinct()
            .ToListAsync();

        await InsertManyAsync(trainerIds, type, title, message, link);
    }

    public async Task<List<NotificationResponse>> GetMyNotificationsAsync(
        int userId,
        bool unreadOnly,
        int take)
    {
        var safeTake = Math.Clamp(take, 1, MaxFetchLimit);

        var query = _context.Notifications
            .Where(n => n.UserId == userId);

        if (unreadOnly)
        {
            query = query.Where(n => !n.IsRead);
        }

        var rows = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(safeTake)
            .ToListAsync();

        return rows.Select(MapToResponse).ToList();
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

        if (notification == null)
        {
            return false;
        }

        if (notification.IsRead)
        {
            return true;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<int> MarkAllReadAsync(int userId)
    {
        var now = DateTime.UtcNow;

        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        if (unread.Count > 0)
        {
            await _context.SaveChangesAsync();
        }

        return unread.Count;
    }

    private async Task InsertManyAsync(
        IReadOnlyCollection<int> userIds,
        string type,
        string title,
        string message,
        string? link)
    {
        if (userIds.Count == 0)
        {
            return;
        }

        foreach (var userId in userIds)
        {
            _context.Notifications.Add(BuildNotification(userId, type, title, message, link));
        }

        await _context.SaveChangesAsync();
    }

    private static Notification BuildNotification(
        int userId,
        string type,
        string title,
        string message,
        string? link)
    {
        return new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            Link = link,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static NotificationResponse MapToResponse(Notification notification)
    {
        return new NotificationResponse
        {
            NotificationId = notification.NotificationId,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            Link = notification.Link,
            IsRead = notification.IsRead,
            ReadAt = notification.ReadAt,
            CreatedAt = notification.CreatedAt
        };
    }
}
