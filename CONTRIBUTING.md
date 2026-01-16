# Contributing to Axios Robots

We love contributions! 🤝 Whether it's reporting a bug, suggesting a feature, or writing code, we'd love to have you involved.

Please feel free to submit a Pull Request. If you're looking for a place to start, check out the [Roadmap in our README](README.md#-roadmap).

## Project Structure

When contributing, please try to follow the existing **Clean Architecture** pattern:

- **`src/data/`**: Data access layer (Repositories).
- **`src/domain/`**: Core business logic.
    - **`interfaces/`**: Abstractions and contracts.
    - **`models/`**: Domain entities and value objects.
    - **`services/`**: Domain services.
    - **`strategies/`**: Strategy implementations (e.g. for Crawl-delay).
    - **`usecases/`**: Application-specific business rules.
- **`src/errors/`**: Custom error definitions.
- **`src/interceptor.ts`**: The main Axios interceptor entry point.
