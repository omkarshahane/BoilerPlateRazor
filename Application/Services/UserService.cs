using Ardalis.Result;
using Application.Features.Users.CreateUser;
using Domain.Entities;
using Infrastructure.Context;
using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;
using Application.Features.Employees.AddEmployee;
using MediatR;

namespace Application.Services;
public class UserService
{
    private readonly IContext _context;
    private readonly IMediator _medator;

    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly IMailService _mailService;

    public UserService(IContext context, IMediator _mediator, UserManager<IdentityUser> userManager, IConfiguration configuration, IMailService mailService)
    {
        _context = context;
        _userManager = userManager;
        _configuration = configuration;
        _mailService = mailService;

    }
    public async Task<Result<Employee>> CreateNewUserAsync(AddEmployeeRequest request, CancellationToken cancellationToken, Boolean sendMail = true)
    {
        using (var scope = new TransactionScope(TransactionScopeOption.RequiresNew, TransactionScopeAsyncFlowOption.Enabled))
        {
            try
            {
                var user = await CreateNewUserAsyncTransaction(_context, request, cancellationToken);
                scope.Complete();
                return user;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
    public async Task<Result<Employee>> CreateNewUserAsyncTransaction(IContext _context, AddEmployeeRequest request, CancellationToken cancellationToken, Boolean sendMail = true)
    {
        var user = await _userManager.FindByEmailAsync(request.Email!);

        if (user is not null)
        {
            //return Result.Error(passwordHashResult.Errors.Select(e => e.Description).ToArray());
            return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "Unable to Add",
                    ErrorMessage = "Employee with provided email id already exists."
                }
            });
        }
        user = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email,
            LockoutEnabled = false,
        };

        //get roles from appsettings.json and according to request.Role create password for user
        //take employee category as role
        var role = _configuration.GetSection($"UserSettings:{request.EmployeeCategory}:Role").Value;
        //var a = config.GetValue<string>("Role");

        string? pass = PasswordGenerator.GeneratePassword();
        //string? password = config.GetValue<string>("Password");
        var passwordHashResult = await _userManager.CreateAsync(user, pass);

        if (!passwordHashResult.Succeeded)
        {
            //return Result.Error(passwordHashResult.Errors.Select(e => e.Description).ToArray());
            return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "Unable to Create",
                    ErrorMessage = "Error while creating user"
                }
            });
        }

        // Add role to user
        await _userManager.AddToRoleAsync(user, role!);
        var orignalUser = request.Adapt<Domain.Entities.Employee>();
        orignalUser.UserId = user.Id;
        orignalUser.EmailAddress = user.Email;
        orignalUser.PhoneNumber = request.ContactNumber;
        orignalUser.IsEscalatorEngineer = request.IsEscalatorEngineer;

        _context.Employees.Add(orignalUser);
        await _context.SaveChangesAsync(cancellationToken);

        //send email of login details 

        if (sendMail)
        {
            //Admin Login Credentials
            if (role!.ToLower().Equals("admin"))
            {
                var emailData = new
                {
                    Username = request.Email,
                    request.FirstName,
                    request.LastName,
                    Password = pass,
                };
                var toEmail = request.Email;
                string subject = "Admin Login Information";
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var baseUrl = _configuration["AppUrl"]?.TrimEnd('/');
            var resetLink = $"{baseUrl}/Auth/ResetPassword" +
                $"?email={Uri.EscapeDataString(request.Email)}" +
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
                    request.Email,
                    "Setup Your Password",
                    plainTextContent,
                    htmlContent
                );
            }
            catch (Exception ex)
            {
                return Result.Error($"An error occurred: {ex.Message}");
            }
        }
        return orignalUser;
    }
}
