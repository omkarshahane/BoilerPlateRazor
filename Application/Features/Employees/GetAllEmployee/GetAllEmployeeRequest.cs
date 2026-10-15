using Application.Features.Common.Requests;
using Application.Features.Common.Responses;
using Ardalis.Result;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Employees.GetAllEmployee;
public record GetAllEmployeeRequest : PaginatedRequest, IRequest<Result<PaginatedList<EmployeeResponse>>>
{
    public string? SearchTerm { get; set; }
    public int TotalCount { get; set; }
}
