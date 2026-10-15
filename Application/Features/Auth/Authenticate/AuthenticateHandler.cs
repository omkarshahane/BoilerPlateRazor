using Application.Features.Auth.Authenticate;
using Ardalis.Result;
using Infrastructure.Context;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.EntityFrameworkCore;
using Mapster;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using System;
using Microsoft.Extensions.Configuration;
using Domain.Entities;
using System.Linq;

public class AuthenticateHandler : IRequestHandler<AuthenticateRequest, Result<AuthenticateResponse>>
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthenticateHandler(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IConfiguration configuration,
        IContext context,
        IHttpContextAccessor httpContextAccessor)

    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<AuthenticateResponse>> Handle(AuthenticateRequest request, CancellationToken cancellationToken)
    {
        // Get user first to avoid multiple database calls
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result.Invalid(new List<ValidationError> {
                new ValidationError
                {
                    Identifier = "Incorrect",
                    ErrorMessage = "Invalid email or password. Please try again."
                }
            });
        }

        // Attempt to sign in
        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!signInResult.Succeeded)
        {
            return Result.Invalid(new List<ValidationError> {
                new ValidationError
                {
                    Identifier = "Incorrect",
                    ErrorMessage = "Invalid email or password. Please try again."
                }
            });
        }

        // Get roles
        var roles = await _userManager.GetRolesAsync(user);

        // Get employee details
        var userDetails = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == user.Id && x.IsActive == true,
                cancellationToken: cancellationToken);

        if (userDetails == null)
        {
            return Result.Invalid(new List<ValidationError> {
                new ValidationError
                {
                    Identifier = "Incorrect",
                    ErrorMessage = "Your account is inactive. Please contact your administrator."
                }
            });
        }

        var claims = new List<Claim>
                {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim("Id", Convert.ToString(userDetails.Id)),
            new Claim("UserId", userDetails.UserId),
            new Claim("Email", userDetails.EmailAddress),
            new Claim("FirstName", userDetails.FirstName),
            new Claim("LastName", userDetails.LastName),
            new Claim("Role", roles.FirstOrDefault()),
            new Claim(ClaimTypes.Name, userDetails.FirstName+" "+userDetails.LastName),
            new Claim(ClaimTypes.Email, userDetails.EmailAddress)
             };
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var claimsIdentity = new ClaimsIdentity(
            claims, CookieAuthenticationDefaults.AuthenticationScheme);
        int cookieExpiryTime = Convert.ToInt32(_configuration["CookieExpiry"]);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(cookieExpiryTime)
        };
        await _httpContextAccessor.HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                        new ClaimsPrincipal(claimsIdentity),
                        authProperties);

        // Create response
        var response = userDetails.Adapt<AuthenticateResponse>();
        response.Id = userDetails.Id;
        response.Roles = roles;
        response.FirstName = userDetails.FirstName;
        response.LastName = userDetails.LastName;
        return Result.Success(response);
    }
}