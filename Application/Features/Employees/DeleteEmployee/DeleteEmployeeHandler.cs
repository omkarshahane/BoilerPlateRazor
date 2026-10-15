using Ardalis.Result;
using Infrastructure.Context;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Employees.DeleteEmployee;
public class DeleteEmployeeHandler : IRequestHandler<DeleteEmployeeRequest, Result<bool>>
{
    private readonly IContext _context;
    public DeleteEmployeeHandler(IContext context)
    {
        _context = context;
    }
    public async Task<Result<bool>> Handle(DeleteEmployeeRequest request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.Id && x.IsDelete == false && x.IsActive==true, cancellationToken);

        if (employee! == null) { return Result.NotFound(); }

        employee.IsActive = false;
        _context.Employees.Update(employee);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
