using BookStore.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BooksController(ILogger<BooksController> logger) : ControllerBase
{
    // In-memory store for demo purposes
    private static readonly List<Book> _books =
    [
        new() { Title = "Clean Code", Author = "Robert C. Martin", Isbn = "9780132350884", Year = 2008, Genre = "Programming", Price = 39.99m },
        new() { Title = "The Pragmatic Programmer", Author = "Andrew Hunt", Isbn = "9780135957059", Year = 2019, Genre = "Programming", Price = 44.99m },
        new() { Title = "Domain-Driven Design", Author = "Eric Evans", Isbn = "9780321125217", Year = 2003, Genre = "Architecture", Price = 54.99m },
        new() { Title = "Designing Data-Intensive Applications", Author = "Martin Kleppmann", Isbn = "9781449373320", Year = 2017, Genre = "Architecture", Price = 49.99m },
    ];

    [HttpGet]
    [Authorize(Policy = "books:read")]
    public ActionResult<IEnumerable<Book>> GetAll()
    {
        logger.LogInformation("GET /api/books called by {User}", User.Identity?.Name ?? "service-account");
        return Ok(_books);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "books:read")]
    public ActionResult<Book> GetById(Guid id)
    {
        var book = _books.FirstOrDefault(b => b.Id == id);
        return book is null ? NotFound() : Ok(book);
    }

    [HttpPost]
    [Authorize(Policy = "books:write")]
    public ActionResult<Book> Create([FromBody] CreateBookRequest request)
    {
        var book = new Book
        {
            Title = request.Title,
            Author = request.Author,
            Isbn = request.Isbn,
            Year = request.Year,
            Genre = request.Genre,
            Price = request.Price,
            InStock = request.InStock,
        };
        _books.Add(book);
        logger.LogInformation("Book created: {Title} by {Author}", book.Title, book.Author);
        return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "books:write")]
    public ActionResult<Book> Update(Guid id, [FromBody] CreateBookRequest request)
    {
        var existing = _books.FirstOrDefault(b => b.Id == id);
        if (existing is null) return NotFound();

        existing.Title = request.Title;
        existing.Author = request.Author;
        existing.Isbn = request.Isbn;
        existing.Year = request.Year;
        existing.Genre = request.Genre;
        existing.Price = request.Price;
        existing.InStock = request.InStock;

        return Ok(existing);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "books:write")]
    public IActionResult Delete(Guid id)
    {
        var book = _books.FirstOrDefault(b => b.Id == id);
        if (book is null) return NotFound();

        _books.Remove(book);
        return NoContent();
    }
}
