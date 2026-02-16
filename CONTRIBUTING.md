# Contributing to Music Recommendation System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/music-app/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node/Python versions)
   - Screenshots if applicable

### Suggesting Features

1. Check existing feature requests
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/music-app.git
   cd music-app
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Add tests if applicable

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend/frontend && npm test
   
   # Python linting
   cd scripts && flake8 . --max-line-length=120
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Wait for review

## Development Guidelines

### Code Style

**Python (FastAPI)**
- Follow PEP 8
- Use type hints
- Maximum line length: 120 characters
- Use descriptive variable names

**TypeScript/JavaScript (React)**
- Use ESLint configuration
- Prefer functional components
- Use TypeScript for type safety
- Follow React best practices

**SQL (Prisma)**
- Use migrations for schema changes
- Keep migrations atomic
- Add comments for complex queries

### Project Structure

- Keep related files together
- Use consistent naming conventions
- Separate concerns (API, business logic, UI)
- Document complex algorithms

### Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for good test coverage
- Test edge cases

### Documentation

- Update README.md for user-facing changes
- Add code comments for complex logic
- Update API documentation for endpoint changes
- Keep CHANGELOG.md updated

## Areas for Contribution

### High Priority
- Bug fixes
- Performance optimizations
- Security improvements
- Test coverage improvements

### Features
- New recommendation algorithms
- Additional music sources
- UI/UX improvements
- Mobile responsiveness

### Documentation
- API documentation
- Tutorials and guides
- Code examples
- Translation (i18n)

## Getting Started

1. **Set up development environment**
   - Follow [SETUP.md](./SETUP.md)
   - Ensure all tests pass
   - Verify you can run the app locally

2. **Pick an issue**
   - Look for "good first issue" labels
   - Comment on the issue to claim it
   - Ask questions if unclear

3. **Start coding**
   - Create a feature branch
   - Make small, focused commits
   - Test frequently

4. **Submit PR**
   - Ensure code follows style guidelines
   - All tests pass
   - Documentation updated

## Review Process

- PRs will be reviewed within 2-3 business days
- Address review comments promptly
- Be open to feedback and suggestions
- Maintain a positive attitude

## Questions?

- Open a discussion on GitHub
- Check existing issues and PRs
- Review code comments and documentation

Thank you for contributing! 🎉
