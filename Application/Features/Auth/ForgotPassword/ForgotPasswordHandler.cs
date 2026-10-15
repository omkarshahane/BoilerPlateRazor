using Ardalis.Result;
using Application.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
namespace Application.Features.Auth.ForgotPassword;
public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordRequest, Result<bool>>
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IMailService _mailService;
    private readonly IConfiguration _configuration;
    private readonly IContext _context;

    public ForgotPasswordHandler(IContext context,
        UserManager<IdentityUser> userManager,
        IMailService mailService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _context = context;
        _mailService = mailService;
        _configuration = configuration;
    }

    public async Task<Result<bool>> Handle(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result.Invalid(new List<ValidationError> {
                new ValidationError
                {
                    Identifier = "Incorrect",
                    ErrorMessage = "The email address entered is not registered"
                }
            });
        }
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

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var baseUrl = _configuration["AppUrl"]?.TrimEnd('/');
        var resetLink = $"{baseUrl}/Auth/ResetPassword" +
            $"?email={Uri.EscapeDataString(request.Email)}" +
            $"&token={Uri.EscapeDataString(token)}";
        var htmlContent = $@"
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .button {{
                        background-color: #4CAF50;
                        border: none;
                        color: white !important;
                        padding: 15px 32px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 20px 0;
                        cursor: pointer;
                        border-radius: 4px;
                    }}
                    .button:hover {{
                        background-color: #45a049;
                    }}
                    .message {{
                        margin: 20px 0;
                        color: #666666;
                    }}
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style='text-align: center;'>
                        <a href='{resetLink}' class='button'>
                            Reset Password
                        </a>
                    </div>
                    <p class='message'>If you didn't request this password reset, you can safely ignore this email.</p>
                    <p class='message'>This link will expire in 24 hours for security reasons.</p>
                </div>
            </body>
            </html>";

        var plainTextContent = $@"
    Reset Your Password
    We received a request to reset your password. Please click the following link to create a new password:
    {resetLink}
    If you didn't request this password reset, you can safely ignore this email.
    This link will expire in 24 hours for security reasons.";

        try
        {
            var emailSent = await _mailService.SendEmailAsync(
                _configuration["SendGridSettings:FromEmail"],
                request.Email,
                "Reset Your Password",
                plainTextContent,
                htmlContent
            );

            return emailSent
                ? Result.Success(true)
                : Result.Error("Failed to send reset password email");
        }
        catch (Exception ex)
        {
            return Result.Error($"An error occurred: {ex.Message}");
        }
    }
}