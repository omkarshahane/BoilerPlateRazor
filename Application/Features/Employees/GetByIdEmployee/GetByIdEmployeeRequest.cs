using Ardalis.Result;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Employees.GetByIdEmployee;
public class GetByIdEmployeeRequest:IRequest<Result<EmployeeResponse>>
{
    public int Id { get; set; }
}
