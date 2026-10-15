using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Auth.ResetPassword;
public class ResetPasswordHandler : IRequestHandler<ResetPasswordRequest, Result<bool>>
{
    private readonly UserManager<IdentityUser> _userManager;

    public ResetPasswordHandler(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<bool>> Handle(ResetPasswordRequest request, CancellationToken cancellationToken)
    {

        // Your existing password match validation
        if (request.NewPassword != request.ConfirmPassword)
        {
            return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = nameof(request.ConfirmPassword),
                    ErrorMessage = "Passwords do not match"
                }
            });
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Result.NotFound();
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (result.Succeeded)
        {
            return Result.Success(true);
        }

        return Result.Invalid(result.Errors.Select(e => new ValidationError
        {
            Identifier = "Password",
            ErrorMessage = e.Description
        }).ToList());
    }
}