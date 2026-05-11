<!-- code-review-graph MCP tools -->

# MCP Tools: code-review-graph

IMPORTANT: This project uses a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep, Glob, or direct file reads.

The graph provides:
- faster code exploration
- architectural relationships
- dependency tracking
- impact analysis
- caller/callee tracing
- shared component discovery
- test relationships
- lower token usage

Use raw file scanning only after graph exploration when exact implementation details are required.

---

# Graph-First Development Rules

- Never begin architecture exploration with direct file reads.
- Always identify existing components/modules before creating new ones.
- Prefer extending existing implementations over duplicating logic.
- Preserve the existing Stitch-generated design system and component structure.
- Shared layout/theme/navigation components are considered critical nodes.
- High impact radius changes should be reviewed before modification.

---

# Recommended Workflow

## 1. Understand Architecture

Use:
- `get_architecture_overview`
- `list_communities`

Goal:
- understand module boundaries
- identify shared systems
- locate critical UI/layout components

---

## 2. Discover Existing Components

Use:
- `semantic_search_nodes`
- `query_graph`

Before creating:
- pages
- layouts
- cards
- forms
- tables
- charts
- dialogs
- hooks
- providers

Always search for existing implementations first.

Prefer reuse over duplication.

---

## 3. Trace Relationships

Use:
- `query_graph`

Patterns:
- callers_of
- callees_of
- imports_of
- tests_for
- dependencies_of

Goal:
- understand how modules interact
- identify shared dependencies
- avoid breaking connected flows

---

## 4. Analyze Impact Before Changes

Use:
- `get_impact_radius`
- `get_affected_flows`

Required before modifying:
- layouts
- navigation
- providers
- shared UI components
- authentication
- theme systems
- global state
- API clients

---

## 5. Review Changes

Use:
- `detect_changes`
- `get_review_context`

Goal:
- risk-scored review
- token-efficient code inspection
- identify unintended side effects

---

# UI & Design System Rules

This project uses a Stitch-generated UI system.

Reference design:
“Remix of Remix of Pixel-Perfect Page (Desktop) — ID: 4810585282142419495”

Requirements:
- Preserve exact Stitch visual fidelity.
- Do not redesign existing layouts/components.
- Reuse existing dashboard structures and shared UI components.
- All new pages/modules must visually match the original Stitch project.
- Maintain consistency in:
  - spacing
  - typography
  - shadows
  - colors
  - responsiveness
  - animations
  - cards
  - forms
  - tables
  - charts
  - sidebar/navigation

Avoid:
- parallel UI systems
- inconsistent layouts
- duplicate components
- generic admin-template styling

---

# Component Reuse Policy

Before creating a new component:
1. Search graph for similar existing components.
2. Reuse or extend existing implementations whenever possible.
3. Avoid duplicate abstractions.

Do NOT create multiple versions of:
- cards
- tables
- modals
- charts
- layout wrappers
- metric widgets
- form systems

---

# Folder Structure Guidelines

- Shared UI → `/components`
- Shared hooks → `/hooks`
- Shared utilities → `/lib`
- Feature modules → `/features`
- Maps/GIS → `/features/maps`
- Surveys → `/features/surveys`
- Analytics → `/features/analytics`
- Claims → `/features/claims`
- Admin → `/features/admin`

---

# Performance Guidelines

- Avoid unnecessary re-renders.
- Reuse existing hooks/providers/query layers.
- Lazy load heavy analytics and GIS modules.
- Keep dashboard rendering efficient.
- Avoid deeply nested component trees where possible.

---

# Preferred Tool Usage

| Goal | Preferred Tool |
|---|---|
| Architecture understanding | `get_architecture_overview` |
| Find modules/components | `semantic_search_nodes` |
| Trace dependencies | `query_graph` |
| Impact analysis | `get_impact_radius` |
| Execution path analysis | `get_affected_flows` |
| Code review | `detect_changes` |
| Focused source inspection | `get_review_context` |

Fallback to:
- Grep
- Glob
- direct file reads

ONLY when graph context is insufficient.

---

# Project Direction

The application is an enterprise-grade AI-powered agricultural governance and intelligence platform.

Core domains include:
- farmer registry
- GIS mapping
- crop surveys
- rainfall analytics
- drought monitoring
- insurance verification
- compensation tracking
- AI risk analysis
- field operations
- government administration

All implementations should align with this architecture and maintain design consistency across the platform.
