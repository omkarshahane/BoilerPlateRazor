using Application.Features.Employees.UpdateEmployee;
using Application.MappingConfig;
using Domain.Entities;
using Mapster;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Features.Employees;
public class EmployeeMapping : IMappingConfig
{
    public void ApplyConfig()
    {
        //for getby id and getall request
        TypeAdapterConfig<Employee, EmployeeResponse>.NewConfig()
         .Map(dest => dest.FirstName, src => src.FirstName);

        TypeAdapterConfig<UpdateEmployeeRequest, Employee>.NewConfig()  
         .Map(dest => dest.PhoneNumber, src => src.ContactNumber)
         .Map(dest => dest.EmailAddress, src => src.Email);

    }
}