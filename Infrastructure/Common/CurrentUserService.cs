using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing.Constraints;
using System.Security.Claims;

namespace Infrastructure.Common;


public class CurrentUserService : ICurrentUserService
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
    public string Role { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        Id = httpContextAccessor.HttpContext.User.FindFirstValue("Id");
        UserId = httpContextAccessor.HttpContext.User.FindFirstValue("UserId");
        Email = httpContextAccessor.HttpContext.User.FindFirstValue("Email");
        FirstName = httpContextAccessor.HttpContext.User.FindFirstValue("FirstName");
        LastName = httpContextAccessor.HttpContext.User.FindFirstValue("LastName");
        Role = httpContextAccessor.HttpContext.User.FindFirstValue("Role");
    }
}
