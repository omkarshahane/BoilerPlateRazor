using Application.Features.Auth.Authenticate;
using MediatR;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace WebApp.Pages.Auth;

public class LoginModel : PageModel
{
    private readonly IMediator _mediator;
    private readonly IConfiguration _configuration;

    [BindProperty]
    public AuthenticateRequest LoginInput { get; set; } = new();

    [TempData]
    public bool setCall { get; set; } = true;

    public LoginModel(IMediator mediator, IConfiguration configuration)
    {
        _mediator = mediator;
        _configuration = configuration;
    }
  
    public async Task<IActionResult> OnGetAsync()
    {
        if(setCall)
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            setCall = false;

            return RedirectToPage("/Auth/Login");
        }
        return Page();
    }
    public async Task<IActionResult> OnPostAsync()
    {
        if (LoginInput != null)
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var result = await _mediator.Send(LoginInput);

            if (result.IsSuccess)
            {
                if (result.Value.Roles.FirstOrDefault().Equals("Admin"))
                {
                    return RedirectToPage("/Index");

                }
                if (result.Value.Roles.FirstOrDefault().Equals("Engineer"))
                {
                    return RedirectToPage("/Index");

                }
            }
            foreach (var error in result.ValidationErrors)
            {
                // Get the property name from the Identifier
                string propertyName = error.Identifier ?? string.Empty;

                // If the property name is empty, add it as a model-level error
                if (error.Identifier == "Incorrect")
                {
                    // Add email existence error
                    ModelState.AddModelError("LoginInput.Password", error.ErrorMessage);
                }
                else
                {
                    // Add the error for the specific property
                    ModelState.AddModelError($"LoginInput.{propertyName}", error.ErrorMessage);
                }
            }
        }
        return Page();
    }
}