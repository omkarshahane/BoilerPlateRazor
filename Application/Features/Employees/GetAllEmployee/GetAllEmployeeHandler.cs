using Application.Extensions;
using Application.Features.Common.Responses;
using Ardalis.Result;
using Domain.Entities;
using Infrastructure.Context;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Employees.GetAllEmployee;
public class GetAllEmployeeHandler : IRequestHandler<GetAllEmployeeRequest, Result<PaginatedList<EmployeeResponse>>>
{
    private readonly IContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    public GetAllEmployeeHandler(IContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }
    public async Task<Result<PaginatedList<EmployeeResponse>>> Handle(GetAllEmployeeRequest request, CancellationToken cancellationToken)
    {
        string? searchTerm = !String.IsNullOrEmpty(request.SearchTerm)
          ? request.SearchTerm.Replace(" ", string.Empty).ToLower() : request.SearchTerm;

        var employees = _context.Employees.AsNoTracking()
                        .Where(x => x.IsDelete == false)
                         .WhereIf(!string.IsNullOrEmpty(request.SearchTerm), x =>
                x.FirstName.Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                x.LastName.Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                x.EmployeeNumber.Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                x.EmailAddress.Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                x.PhoneNumber.Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                    (x.FirstName + x.LastName).Replace(" ", string.Empty).ToLower().Contains(searchTerm) ||
                    (x.LastName + x.FirstName).Replace(" ", string.Empty).ToLower().Contains(searchTerm))
                        .OrderByDescending(x => x.CreatedOn);
        var result = await employees.ToPaginatedListAsync<Employee, EmployeeResponse>(request.CurrentPage, request.PageSize, request.Paging);
        foreach (var x in result.Result)
        {
            var user = await _userManager.FindByEmailAsync(x.EmailAddress);
            if (user != null)
            {
                var roles = await _userManager.GetRolesAsync(user);
                x.EmployeeCategory = roles.FirstOrDefault();
            }
        }
        return Result<PaginatedList<EmployeeResponse>>.Success(result);
    }
}
