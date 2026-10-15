using Ardalis.Result;
using Infrastructure.Common;
using Infrastructure.Context;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Users.DeleteUser;

public class DeleteUserHandler : IRequestHandler<DeleteUserRequest, Result<bool>>
{
    private readonly IContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ICurrentUserService _currentUserService;
    public DeleteUserHandler(IContext context, UserManager<IdentityUser> userManager, ICurrentUserService currentUserService)
    {
        _context = context;
        _userManager = userManager;
        _currentUserService = currentUserService;
    }
    public async Task<Result<bool>> Handle(DeleteUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (user is null) return Result.NotFound();


        var identityUser = await _userManager.FindByIdAsync(user.UserId);

        //changing status of user IsActive False
        user.IsActive = false;

        //Delete IdentityUser
        if (identityUser != null)
        {
            await _userManager.DeleteAsync(identityUser!);
        }
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}