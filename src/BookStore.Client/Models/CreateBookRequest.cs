namespace BookStore.Client.Models;

public record CreateBookRequest(
    string  Title,
    string  Author,
    string  Isbn,
    int     Year,
    string  Genre,
    decimal Price,
    bool    InStock);
