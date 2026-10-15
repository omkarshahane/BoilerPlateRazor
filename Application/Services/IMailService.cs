using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace Application.Services;
public interface IMailService
{
    Task<bool> SendEmailAsync(string fromEmail, string toEmail, string subject, string plainTextContent, string htmlContent);

    Task<Response> SendEmailAsync(SendGridMessage message);

    Task<bool> SendEmailWithTemplateAsync<T>(string toEmail, string templateId, T data, string? subject);
}
