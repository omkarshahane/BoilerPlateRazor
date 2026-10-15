using Application.Features.Employees.AddEmployee;
using Application.Features.Lookups.GetAllLookups;
using Application.Features.Lookups.Responses;
using Flurl.Util;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace WebApp.Pages.Employee;
[Authorize(Roles = "Admin")]
public class AddEmployeeModel : PageModel
{
    private readonly IMediator _mediator;
    [BindProperty(SupportsGet = true)]
    public int ReturnPage { get; set; } = 1;
    [BindProperty(SupportsGet = true)]
    public int PageSize { get; set; } = 10;
    [BindProperty(SupportsGet = true)]
    public string SearchTerm { get; set; }
    public AddEmployeeModel(IMediator mediator)
    {
        _mediator = mediator;
    }
     public string ErrorMessage { get; set; }
    [BindProperty]
    public AddEmployeeRequest EmployeeRequest { get; set; }
    public async Task<IActionResult> OnGetAsync()
    {
        return Page();
    }
    public async Task<IActionResult> OnPostAsync()
    {
        TempData.Keep();
        var result = await _mediator.Send(EmployeeRequest);
        if (result.IsSuccess)
        {
            TempData["SuccessMessage"] = "Employee details saved successfully";
            return RedirectToPage("/Employee/EmployeeList", new
            {
                currentPage = ReturnPage,
                searchTerm = SearchTerm,
                pageSize = PageSize
            });
        }
        foreach (var error in result.ValidationErrors)
        {
            // Get the property name from the Identifier
            string propertyName = error.Identifier ?? string.Empty;

            // If the property name is empty, add it as a model-level error
            if (error.Identifier == "EmailExist")
            {
                // Add email existence error
                ModelState.AddModelError("EmployeeRequest.Email", error.ErrorMessage);
            }
            else
            {
                // Add the error for the specific property
                ModelState.AddModelError($"EmployeeRequest.{propertyName}", error.ErrorMessage);
            }
        }
        return Page();
    }
}