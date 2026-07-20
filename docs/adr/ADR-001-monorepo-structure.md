# ADR-001: Monorepo Structure

**Status:** Accepted
**Date:** 2026-07-16
**Author:** Equipe EventOS AI

## Context

We need to define the repository structure for EventOS AI Enterprise. The project includes multiple products (EventOS, Minisitio, HealthOS, GovOS) sharing a common platform core.

## Decision

We will use a monorepo structure with the following top-level layout:

```
enterprise-platform/
├── platform-core/
├── platform-sdk/
├── platform-ui/
├── platform-ai/
├── platform-cli/
├── platform-devops/
├── platform-observability/
├── platform-security/
├── platform-templates/
├── platform-generators/
└── products/
    ├── eventos/
    ├── minisitio/
    ├── health/
    ├── agro/
    ├── gov/
    └── retail/
```

## Consequences

- Shared code is reused across all products
- CI/CD must handle monorepo efficiently (affected-path detection)
- Clear separation between platform core and product-specific code
- Enables `enterprise new product` CLI generator

## Related

- DEC-000012: Platform Extensibility
- BC-001 through BC-027
