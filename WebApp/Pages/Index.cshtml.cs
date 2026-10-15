using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApplication.Pages;
[Authorize(Roles = "Engineer,Admin")]
public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    public IActionResult OnGet()
    {
        var roles = HttpContext.User.Claims
            .Where(c => c.Type == "role" || c.Type == System.Security.Claims.ClaimTypes.Role)
            .Select(c => c.Value)
            .ToList();

        if (roles.Contains("Admin"))
        {
            return RedirectToPage("Employee/EmployeeList");
        }
        else if (roles.Contains("Engineer"))
        {
            return RedirectToPage("Employee/EmployeeList");
        }

        // If no roles match, redirect to an access denied or default page
        return RedirectToPage("/AccessDenied");
    }
}
