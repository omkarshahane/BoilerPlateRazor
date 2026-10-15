
using Infrastructure.Context;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace WebApp.Common;

public class AuthorizationHandlerMiddleware : IMiddleware
{
    private readonly IContext _context;

    public AuthorizationHandlerMiddleware(IContext context)
    {
        _context = context;
    }
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var email = context.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        if (email != null)
        {
            var isActiveUser = await _context.Employees.AnyAsync(x => x.EmailAddress == email && x.IsActive == true);

            if (!isActiveUser)
            {
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                context.Response.Redirect("/Auth/Login");
            }
        }
        await next(context);
    }
}
