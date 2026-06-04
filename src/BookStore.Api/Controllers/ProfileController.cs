using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new
        {
            Name = User.Identity?.Name,
            Email = User.FindFirst("email")?.Value
                 ?? User.FindFirst("preferred_username")?.Value,
            Claims = claims,
        });
    }
}
