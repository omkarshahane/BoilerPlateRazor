using Application.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using System.Security.Claims;
using System.Text;

public static class AuthSetup
{
    public static IServiceCollection AddAuthSetup(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        })
        .AddCookie(options =>
        {
            options.Cookie.Name = "AuthCookie";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;

            // Set cookie expiration to 5 minutes
            options.ExpireTimeSpan = TimeSpan.FromMinutes(5);

            options.LoginPath = "/Auth/Login";
            options.LogoutPath = "/Auth/Logout";
            options.AccessDeniedPath = "/common/pagenotfound";
            // Enable sliding expiration to create new cookie
            options.SlidingExpiration = true;

            // This will enforce cookie renewal
            options.Events = new CookieAuthenticationEvents
            {
                OnValidatePrincipal = async context =>
                {
                    if (context.Properties.IsPersistent &&
                        context.Properties.ExpiresUtc.HasValue &&
                        context.Properties.ExpiresUtc.Value < DateTime.UtcNow.AddMinutes(2))
                    {
                        // Delete old cookie
                        await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

                        // Create new cookie with renewed expiration
                        var identity = context.Principal.Identity as ClaimsIdentity;
                        var authProperties = new AuthenticationProperties
                        {
                            IsPersistent = true,
                            ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(5)
                        };

                        await context.HttpContext.SignInAsync(
                            CookieAuthenticationDefaults.AuthenticationScheme,
                            new ClaimsPrincipal(identity),
                            authProperties);
                    }
                }
            };
        });

        return services;
    }
}