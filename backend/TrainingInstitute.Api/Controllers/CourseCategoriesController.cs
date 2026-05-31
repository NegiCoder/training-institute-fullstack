using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TrainingInstitute.Api.DTOs.CourseCategories;
using TrainingInstitute.Api.Services;

namespace  TrainingInstitute.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class CourseCategoriesController : ControllerBase
{
    private readonly ICourseCategoryService courseCategoryService;

    public CourseCategoriesController(ICourseCategoryService courseCategoryService)

    {
        this.courseCategoryService = courseCategoryService;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await courseCategoryService.GetAllAsync();
        return Ok(categories);
    }


    [HttpGet("{courseCategoryId}")]
    public async Task<IActionResult> GetById(int courseCategoryId)
    {
        var category = await courseCategoryService.GetByIdAsync(courseCategoryId);
        if (category == null)
        {
            return NotFound(
                new
                {
                    message = "course category not found"
                });
        }

        return Ok(category);
    }



    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCourseCategoryRequest request)
    {
        try
        {
            var category = await courseCategoryService.CreateAsync(request);
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                }
            );

        }
    }


    [HttpPut("{courseCategoryId}")]
    [Authorize(Roles = "Admin")]

    public async Task<IActionResult> Update(int courseCategoryId, [FromBody] UpdateCourseCategoryRequest request)
    {
        try
        {
            var category = await courseCategoryService.UpdateAsync(courseCategoryId, request);
            if (category == null)
            {
                return NotFound(
                    new
                    {
                        message = "course category not found"
                    }
                );
            }
            return Ok(category);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                }
            );

        }
    }



    [HttpDelete("{courseCategoryId}")]
[Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int courseCategoryId)
    {
        var isDeleted = await courseCategoryService.DeleteAsync(courseCategoryId);
        if (!isDeleted)
        {
            return NotFound(
                new
                {
                    message = "course category not found"
                }
            );
        }
        return NoContent();
    }













}
