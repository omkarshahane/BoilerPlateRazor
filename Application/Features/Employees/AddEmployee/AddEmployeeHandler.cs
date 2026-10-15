using Application.Features.Users.CreateUser;
using Application.Services;
using Ardalis.Result;
using Infrastructure.Context;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Transactions;

namespace Application.Features.Employees.AddEmployee;
public class AddEmployeeHandler : IRequestHandler<AddEmployeeRequest, Result<bool>>
{
    private readonly IContext _context;
    private readonly UserService _userService;
    private readonly UserManager<IdentityUser> _userManager;
    public AddEmployeeHandler(IContext context, UserService userService, UserManager<IdentityUser> userManager)
    {
        this._context = context;
        this._userService = userService;
        this._userManager = userManager;
    }

    public async Task<Result<bool>> Handle(AddEmployeeRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email!);

        if (user is not null)
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
        //todo replace user request as employee request
        var newuser = await _userService.CreateNewUserAsync(request, cancellationToken);
        if (newuser.IsSuccess == false)
        {
            return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "Unable to Create",
                    ErrorMessage = "Error while creating user."
                }
            });
        }
        return true;
    }
}
