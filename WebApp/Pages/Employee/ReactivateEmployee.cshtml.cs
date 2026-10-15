using Application.Features.Employees.GetByIdEmployee;
using Application.Features.Employees.UpdateEmployee;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApp.Pages.Employee;
[Authorize(Roles = "Admin")]
public class ReactivateEmployeeModel : PageModel
{
    private readonly IMediator _mediator;

    public ReactivateEmployeeModel(IMediator mediator)
    {
        _mediator = mediator;
    }
    [TempData]
    public string FullName { get; set; }
    [BindProperty]
    public UpdateEmployeeRequest Employee { get; set; }
    // Add property to store the return page number
    [BindProperty(SupportsGet = true)]
    public int ReturnPage { get; set; } = 1;
    [BindProperty(SupportsGet = true)]
    public int PageSize { get; set; } = 10;
    [BindProperty(SupportsGet = true)]
    public string SearchTerm { get; set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        var getEmployeeRequest = new GetByIdEmployeeRequest { Id = id };
        var result = await _mediator.Send(getEmployeeRequest);
        FullName = result.Value.FirstName + " " + result.Value.LastName;
        if (!result.IsSuccess)
        {
            return RedirectToPage("/Error");
        }

        Employee = new UpdateEmployeeRequest
        {
            Id = result.Value.Id,
            EmployeeNumber = result.Value.EmployeeNumber,
            EmployeeCategory = result.Value.EmployeeCategory,
            FirstName = result.Value.FirstName,
            LastName = result.Value.LastName,
            Email = result.Value.EmailAddress,
            ContactNumber = result.Value.PhoneNumber,
            HomeAddress = result.Value.HomeAddress,
            IsEscalatorEngineer = result.Value.IsEscalatorEngineer,
            IsPartTimeOrCompressed = result.Value.IsPartTimeOrCompressed,
            IsActive=true,

        };

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        Employee.IsActive = true;
        var result = await _mediator.Send(Employee);

        if (result.IsSuccess)
        {
            TempData["SuccessMessage"] = "Employee activated successfully!";
            return RedirectToPage("/Employee/EmployeeList", new
            {
                currentPage = ReturnPage,
                searchTerm = SearchTerm,
                pageSize = PageSize
            });
        }

        ModelState.AddModelError("", "Error updating employee");
        return Page();
    }
}