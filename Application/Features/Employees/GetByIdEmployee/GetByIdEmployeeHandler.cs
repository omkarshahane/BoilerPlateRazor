using Application.Features.Common.Responses;
using Application.Features.Employees.GetAllEmployee;
using Application.Services;
using Ardalis.Result;
using Infrastructure.Context;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Employees.GetByIdEmployee;
public class GetByIdEmployeeHandler : IRequestHandler<GetByIdEmployeeRequest, Result<EmployeeResponse>>
{
    private readonly IContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    public GetByIdEmployeeHandler(IContext context,UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    public async Task<Result<EmployeeResponse>> Handle(GetByIdEmployeeRequest request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
                    .FirstOrDefaultAsync( x => x.Id == request.Id && x.IsDelete == false);
        if (employee! == null) { return Result.NotFound(); }

        var user = await _userManager.FindByEmailAsync(employee.EmailAddress);
        var role=await _userManager.GetRolesAsync(user);

        var result = employee.Adapt<EmployeeResponse>();
        result.EmployeeCategory = role.FirstOrDefault().ToString(); 
        return Result<EmployeeResponse>.Success(result);

    }
}