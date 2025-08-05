# Contributing to AtaMind

Thank you for your interest in contributing to AtaMind! This document provides guidelines and information for contributors.

## 🌟 Overview

AtaMind is an AI-powered Turkish children's education platform that helps parents transmit cultural values through personalized storytelling. We welcome contributions that enhance the educational experience, improve AI capabilities, or expand cultural content.

## 🤝 How to Contribute

### Types of Contributions
- **Bug fixes**: Fix issues in the codebase
- **Feature development**: Add new AI capabilities or educational features
- **Cultural content**: Enhance Turkish cultural storytelling elements
- **Documentation**: Improve guides, tutorials, and technical documentation
- **Testing**: Add test coverage and quality assurance
- **UI/UX improvements**: Enhance user experience and accessibility

### Before You Start
1. **Check existing issues**: Look for similar bugs or feature requests
2. **Open an issue**: Discuss major changes before implementing
3. **Fork the repository**: Create your own copy to work on
4. **Review the codebase**: Understand the multi-agent AI architecture

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key
- Git for version control

### Local Development
1. **Fork and clone**
```bash
git clone https://github.com/your-username/atamind.git
cd atamind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.example .env
# Configure your .env with required API keys and database URL
```

4. **Initialize database**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing throughout
- **ESLint**: Follow existing linting rules
- **Prettier**: Maintain consistent formatting
- **Comments**: Document complex AI logic and cultural considerations

### Architecture Principles
- **Multi-Agent Design**: Maintain separation between AI agents
- **Cultural Sensitivity**: Ensure Turkish cultural accuracy
- **Safety First**: Prioritize child safety in all features
- **Performance**: Optimize for real-time AI processing

### Commit Guidelines
Use conventional commit format:
```
type(scope): description

feat(storyteller): add cultural context analysis
fix(guardian): improve content safety validation
docs(readme): update API documentation
test(voice): add emotion detection tests
```

### Branch Naming
- `feature/agent-improvement-storyteller`
- `fix/voice-analysis-bug`
- `docs/api-documentation`
- `test/child-psychology-agent`

## 🧪 Testing

### Running Tests
```bash
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests
npm run test:ai         # AI agent tests
```

### Test Coverage
- **AI Agents**: Test each agent's core functionality
- **Cultural Content**: Validate Turkish cultural accuracy
- **Safety Systems**: Ensure content validation works
- **User Interactions**: Test complete user workflows

### Writing Tests
- Use descriptive test names
- Test edge cases and error conditions
- Mock external API calls (Gemini, etc.)
- Include cultural appropriateness tests

## 🤖 AI Development Guidelines

### Working with AI Agents
When modifying AI agents:
1. **Maintain Agent Roles**: Don't blur responsibilities between agents
2. **Cultural Context**: Ensure Turkish cultural understanding
3. **Safety Validation**: Test content appropriateness thoroughly
4. **Performance**: Monitor AI response times and accuracy

### Gemini API Usage
- Follow rate limiting best practices
- Handle API errors gracefully
- Cache appropriate responses
- Monitor token usage and costs

### Adding New AI Features
1. **Design Document**: Create RFC for major AI changes
2. **Safety Review**: Ensure child safety considerations
3. **Cultural Review**: Validate Turkish cultural accuracy
4. **Performance Testing**: Measure impact on response times

## 🌍 Cultural Contributions

### Turkish Cultural Content
- **Accuracy**: Verify historical and cultural facts
- **Appropriateness**: Ensure age-appropriate content
- **Diversity**: Include various Turkish regional traditions
- **Modern Relevance**: Connect traditional values to contemporary life

### Cultural Review Process
1. **Research**: Use authoritative Turkish cultural sources
2. **Expert Review**: Consider consultation with cultural experts
3. **Community Feedback**: Engage Turkish-speaking community
4. **Iterative Improvement**: Refine based on user feedback

## 📚 Documentation

### Documentation Standards
- **Clear Examples**: Provide working code samples
- **Turkish Context**: Explain cultural considerations
- **API Documentation**: Keep endpoint docs current
- **User Guides**: Write for non-technical parents

### Documentation Types
- **Technical Docs**: API references, architecture guides
- **User Guides**: Parent and educator instructions
- **Cultural Guides**: Turkish cultural context explanations
- **Developer Guides**: Contribution and setup instructions

## 🔍 Code Review Process

### Submitting Pull Requests
1. **Descriptive Title**: Clearly explain the change
2. **Detailed Description**: Include context and reasoning
3. **Test Coverage**: Add appropriate tests
4. **Documentation**: Update relevant documentation
5. **Screenshots**: Include UI changes visuals

### Review Criteria
- **Functionality**: Does it work as intended?
- **Safety**: Is it safe for children?
- **Cultural Accuracy**: Is Turkish content appropriate?
- **Performance**: Does it maintain system performance?
- **Code Quality**: Is it well-written and maintainable?

### Review Process
1. **Automated Checks**: CI/CD pipeline validation
2. **Peer Review**: Code review by maintainers
3. **Cultural Review**: Turkish cultural accuracy check
4. **Safety Review**: Child safety validation
5. **Final Approval**: Maintainer approval and merge

## 🚀 Release Process

### Version Management
- **Semantic Versioning**: MAJOR.MINOR.PATCH
- **AI Model Updates**: Track AI capability improvements
- **Cultural Content**: Version cultural content additions
- **Safety Updates**: Prioritize safety-related releases

### Release Notes
Include:
- **New Features**: AI capabilities and user features
- **Bug Fixes**: Issues resolved
- **Cultural Updates**: New Turkish content
- **Breaking Changes**: API or behavior changes
- **Safety Improvements**: Enhanced child protection

## 🛡️ Security and Safety

### Security Guidelines
- **API Keys**: Never commit secrets to version control
- **Input Validation**: Sanitize all user inputs
- **Authentication**: Properly implement user authentication
- **Data Privacy**: Protect child and family data

### Child Safety
- **Content Review**: All AI-generated content must be reviewed
- **Age Appropriateness**: Validate content for target age groups
- **Cultural Sensitivity**: Ensure respectful cultural representation
- **Harmful Content**: Implement robust filtering systems

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Documentation**: Check existing guides first
- **Email**: Direct contact for sensitive issues

### Asking Questions
1. **Search First**: Check existing issues and documentation
2. **Be Specific**: Provide clear problem descriptions
3. **Include Context**: Share relevant code and error messages
4. **Cultural Context**: Mention Turkish cultural considerations

## 🏆 Recognition

### Contributor Recognition
- **Contributors File**: Listed in CONTRIBUTORS.md
- **Release Notes**: Acknowledged in version releases
- **Community**: Highlighted in community discussions
- **Special Recognition**: Outstanding contributions featured

### Areas for Recognition
- **Technical Excellence**: Innovative AI implementations
- **Cultural Contributions**: Authentic Turkish content
- **Safety Improvements**: Enhanced child protection
- **Community Building**: Helping other contributors

## 📋 Issue Templates

### Bug Reports
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Cultural Context** (if applicable)
Turkish cultural considerations

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js version: [e.g., 18.0.0]
```

### Feature Requests
```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Cultural Considerations**
Turkish cultural aspects to consider

**AI Implications**
Impact on AI agents and processing

**Alternative Solutions**
Other ways to solve this problem
```

## 📜 Code of Conduct

### Our Standards
- **Respectful Communication**: Be kind and professional
- **Inclusive Environment**: Welcome all contributors
- **Cultural Sensitivity**: Respect Turkish cultural heritage
- **Child Safety Priority**: Always prioritize child welfare
- **Constructive Feedback**: Provide helpful, actionable feedback

### Unacceptable Behavior
- Harassment or discrimination
- Inappropriate cultural representations
- Compromising child safety
- Sharing personal information
- Disrespectful or unprofessional conduct

## 📄 License

By contributing to AtaMind, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to AtaMind! Together, we're building the future of AI-powered cultural education for Turkish children. 🇹🇷