using Application.Features.Common.Requests;
using Application.Features.Common.Responses;
using Ardalis.Result;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Employees.UpdateEmployee;
public class UpdateEmployeeRequest :IRequest<Result<bool>>
{
    public int Id { get; set; }
    public string? EmployeeNumber { get; set; }
    public string? EmployeeCategory { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? ContactNumber { get; set; }
    public string? HomeAddress { get; set; }
    public bool IsEscalatorEngineer { get; set; }
    public bool IsPartTimeOrCompressed { get; set; }
    public bool IsActive { get; set; }

}
