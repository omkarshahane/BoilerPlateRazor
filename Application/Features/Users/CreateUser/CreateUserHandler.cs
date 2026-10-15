using Ardalis.Result;
using Application.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;


namespace Application.Features.Users.CreateUser;
public class CreateUserHandler : IRequestHandler<CreateUserRequest, Result<string>>
{
    private readonly UserService _userService;
    private readonly UserManager<IdentityUser> _userManager;

    public CreateUserHandler(UserService userService, UserManager<IdentityUser> userManager)
    {
        _userService = userService;
        _userManager = userManager;
    }

    public async Task<Result<string>> Handle(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email!);

        if (user is not null)
        {
            return Result.Invalid(new List<ValidationError>
            {
                new ValidationError
                {
                    Identifier = "Unable to Create",
                    ErrorMessage = "User with provided email id already exists."
                }
            });
        }
        return "";
    }
}
