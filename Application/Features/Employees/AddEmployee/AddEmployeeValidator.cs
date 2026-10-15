using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Employees.AddEmployee;
public class AddEmployeeValidator:AbstractValidator<AddEmployeeRequest>
{
    public AddEmployeeValidator()
    {
        RuleFor(x => x.EmployeeNumber)
            .NotEmpty().WithMessage("Employee number is required.");

        RuleFor(x => x.EmployeeCategory)
            .NotEmpty().WithMessage("Employee category is required.");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email address.")
            .Matches(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")
            .WithMessage("Invalid email format must contain @ and .");

        RuleFor(x => x.ContactNumber)
            .NotEmpty().WithMessage("Contact number is required.")
            .Matches(@"^\+?[0-9]*$").WithMessage("Contact number can only contain numbers")
            .MaximumLength(15).WithMessage("“Contact number cannot exceed 15 digits");

        RuleFor(x => x.HomeAddress)
            .NotEmpty().WithMessage("Home address is required.");
    }
}

