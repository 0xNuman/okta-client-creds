using BookStore.Client.Models;
using Refit;

namespace BookStore.Client.Api;

public interface IBookStoreApi
{
    [Get("/api/books")]
    Task<List<Book>> GetAllBooks();

    [Get("/api/books/{id}")]
    Task<Book> GetBookById(Guid id);

    [Post("/api/books")]
    Task<Book> CreateBook([Body] CreateBookRequest book);

    [Put("/api/books/{id}")]
    Task<Book> UpdateBook(Guid id, [Body] CreateBookRequest book);

    [Delete("/api/books/{id}")]
    Task DeleteBook(Guid id);
}
