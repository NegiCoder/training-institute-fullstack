/*
 * Copyright (c) 2026 Anshul Negi
 * GitHub: https://github.com/NegiCoder
 * Unauthorized copying, modification, or distribution of this file
 * without explicit permission is prohibited.
 */

using TrainingInstitute.Api.Models.Enums;

namespace TrainingInstitute.Api.Models;

// course ka ek module / lesson - video, pdf ya link ho sakta hai
public class CourseContent
{
    public int CourseContentId { get; set; }

    public int CourseId { get; set; }

    public Course? Course { get; set; }

    public string ModuleName { get; set; } = string.Empty;

    public ContentType ContentType { get; set; }

    // file ka path ya URL - yahi se khulega
    public string UrlOrPath { get; set; } = string.Empty;

    // UI me kis order me dikhana hai
    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int? UpdatedBy { get; set; }

    // ye module kis kis student ne complete kiya
    public ICollection<StudentModuleProgress> ModuleProgressRows { get; set; } = new List<StudentModuleProgress>();
}
