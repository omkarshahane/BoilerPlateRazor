using Application.Features.Employees.AddEmployee;
using Ardalis.Result;
using Infrastructure.Context;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Employees.UpdateEmployee;
public class UpdateEmployeeHandler : IRequestHandler<UpdateEmployeeRequest, Result<bool>>
{
    private readonly IContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    public UpdateEmployeeHandler(IContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    //public async Task<Result<bool>> Handle(UpdateEmployeeRequest request, CancellationToken cancellationToken)
    //{
    //    var employee = await _context.Employees
    //        .FirstOrDefaultAsync(x => x.Id == request.Id && x.IsDelete == false , cancellationToken);

    //    if (employee == null)
    //    {
    //        return Result<bool>.NotFound();
    //    }
    //    var isDuplicateMail = _context.Employees
    //        .Any(x => x.Id != request.Id && x.EmailAddress == request.Email && x.IsDelete == false); 
    //    if (isDuplicateMail)
    //    {
    //        return Result.Invalid(new List<ValidationError>
    //        {
    //            new ValidationError
    //            {
    //                Identifier = "EmailExist",
    //                ErrorMessage = "Email already register with us"
    //            }
    //        });
    //    }
    //    var user = await _userManager.FindByEmailAsync(employee.EmailAddress);
    //    var role = await _userManager.GetRolesAsync(user);
    //    if (!role.FirstOrDefault().ToLower().ToString().Equals(request.EmployeeCategory.ToLower()))
    //    {
    //        await _userManager.RemoveFromRoleAsync(user, request.EmployeeCategory);
    //        await _userManager.AddToRoleAsync(user, request.EmployeeCategory);

    //    }

    //    request.Adapt(employee);

    //    _context.Employees.Update(employee);
    //    await _context.SaveChangesAsync(cancellationToken);

    //    return Result<bool>.Success(true);

    //}


    public async Task<Result<bool>> Handle(UpdateEmployeeRequest request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.Id && x.IsDelete == false, cancellationToken);

        if (employee == null)
        {
            return Result<bool>.NotFound();
        }

        // Get the associated Identity user once
        var user = await _userManager.FindByEmailAsync(employee.EmailAddress);
        if (user == null)
        {
            return Result.Invalid(new List<ValidationError>
        {
            new ValidationError
            {
                Identifier = "UserNotFound",
                ErrorMessage = "Associated user account not found"
            }
        });
        }

        // Check for duplicate email only if email is being changed
        if (!employee.EmailAddress.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var isDuplicateMail = _context.Employees
                .Any(x => x.Id != request.Id && x.EmailAddress == request.Email && x.IsDelete == false);
            if (isDuplicateMail)
            {
                return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "EmailExist",
                    ErrorMessage = "Email already register with us"
                }
            });
            }

            // Generate email change token
            var token = await _userManager.GenerateChangeEmailTokenAsync(user, request.Email);

            // Change the email
            var emailUpdateResult = await _userManager.ChangeEmailAsync(user, request.Email, token);
            if (!emailUpdateResult.Succeeded)
            {
                return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "EmailUpdateFailed",
                    ErrorMessage = "Failed to update user email"
                }
            });
            }

            // Update UserName if it's same as email
            if (user.UserName == employee.EmailAddress)
            {
                var setUserNameResult = await _userManager.SetUserNameAsync(user, request.Email);
                if (!setUserNameResult.Succeeded)
                {
                    return Result.Invalid(new List<ValidationError>
                {
                    new ValidationError
                    {
                        Identifier = "UserNameUpdateFailed",
                        ErrorMessage = "Failed to update username"
                    }
                });
                }
            }
        }

        // Update role if changed
        var roles = await _userManager.GetRolesAsync(user);
        var currentRole = roles.FirstOrDefault();
        if (currentRole != null && !currentRole.Equals(request.EmployeeCategory, StringComparison.OrdinalIgnoreCase))
        {
            await _userManager.RemoveFromRoleAsync(user, currentRole);
            await _userManager.AddToRoleAsync(user, request.EmployeeCategory);
        }

        // Update employee entity
        request.Adapt(employee);

        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
