using Application.Features.Common.Responses;
using Application.Features.Employees.GetAllEmployee;
using Application.Features.Employees;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Application.Features.Employees.DeleteEmployee;
using Application.Services;
using Azure.Core;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace WebApp.Pages.Employee;
[Authorize(Roles = "Admin")]
public class EmployeeListModel : PageModel
{
    private readonly IMediator _mediator;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IMailService _mailService;
    public string Message { get; set; }


    public EmployeeListModel(IMediator mediator, UserManager<IdentityUser> userManager, IConfiguration configuration, IMailService mailService)
    {
        _mediator = mediator;
        _userManager = userManager;
        _configuration = configuration;
        _mailService = mailService;
    }
    public void OnGet(string message)
    {
        Message = message;
    }
    public async Task<JsonResult> OnGetEmployeeDataAsync(string SearchTerm,int PageSize,int CurrentPage)
    {
        var request = new GetAllEmployeeRequest
        {
            CurrentPage = CurrentPage,
            PageSize = PageSize,
            SearchTerm = SearchTerm,
            Paging = true
        };

        var result = await _mediator.Send(request);
        if (result.IsSuccess)
        {
            return new JsonResult(new { success = true, employees = result.Value });
        }

        return new JsonResult(new { success = false });

    }

    public async Task<JsonResult> OnGetDeactivateEmployeeAsync(int Id)
    {
        var result = await _mediator.Send(new DeleteEmployeeRequest { Id = Id });
        if(result.IsSuccess)
        {
            //TempData["SuccessMessage"] = "Employee deactivated successfully!";
            return new JsonResult(new { success = true });
        }
        return new JsonResult(new { success = false });
    }

    public async Task<JsonResult> OnGetSendPasswordMailAsync(string email)
    {
        var user=await _userManager.FindByNameAsync(email);
        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var baseUrl = _configuration["AppUrl"]?.TrimEnd('/');
        var resetLink = $"{baseUrl}/Auth/ResetPassword" +
            $"?email={Uri.EscapeDataString(email)}" +
            $"&token={Uri.EscapeDataString(token)}";
        var htmlContent = $@"
            <html>
            <body style='font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto;'>
            <p>Welcome! Please set up your password for your new account by clicking the link below:</p>
            <p><a href='{resetLink}' style='color: blue;'>Click here to set your password</a></p>
            <p>This link will expire in 24 hours.</p>
            </body>
            </html>";

        var plainTextContent = $@"
            Welcome! Please set up your password for your new account using this link:
            {resetLink}
            This link will expire in 24 hours.";
        //if (role!.ToLower().Equals("admin"))
        //{
        //}
        try
        {
            var emailSent = await _mailService.SendEmailAsync(
                _configuration["SendGridSettings:FromEmail"],
                email,
                "Setup Your Password",
                plainTextContent,
                htmlContent
            );
        }
        catch (Exception ex)
        {
            return new JsonResult(new { success = false });
        }
        //TempData["SuccessMessage"] = "Password sent successfully!";
        return new JsonResult(new { success = true });
    }
}