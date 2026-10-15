using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Employees;
public class EmployeeResponse
{
    public int Id { get; set; }
    public string EmployeeNumber { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string EmailAddress { get; set; }
    public string EmployeeCategory { get; set; }
    public string PhoneNumber { get; set; }
    public string HomeAddress { get; set; }
    public bool IsEscalatorEngineer { get; set; }
    public bool IsPartTimeOrCompressed { get; set; }
    public bool IsActive { get; set; }
}
