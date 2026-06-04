namespace BookStore.Client.Models;

public record Book(
    Guid    Id,
    string  Title,
    string  Author,
    string  Isbn,
    int     Year,
    string  Genre,
    decimal Price,
    bool    InStock);
