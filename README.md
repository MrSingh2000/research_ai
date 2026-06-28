# ResearchAI

> An iterative, production-oriented multi-agent research assistant built using **LangGraph**, **LangChain**, **Ollama**, and **Tavily**.

The goal of this project is to demonstrate how autonomous AI agents can collaboratively perform deep research, evaluate their own work, iteratively fill knowledge gaps, and generate professional research reports.

---

# Features

* Multi-agent architecture
* Iterative research loop
* Automatic research planning
* Parallel web research
* Structured information extraction
* Incremental summarization
* Self-critique and gap detection
* Automatic follow-up research
* Professional report generation
* Markdown → PDF report pipeline (planned)

---

# Architecture
# Architecture

```text
                              ┌──────────────────────┐
                              │     User Query       │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   Supervisor Agent   │
                              └───────┬──────────────┘
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
                     ▼                                 ▼
            ┌─────────────────┐             ┌─────────────────┐
            │ Planner Agent   │             │ Direct Research │
            └────────┬────────┘             └────────┬────────┘
                     │                              │
                     └──────────────┬───────────────┘
                                    ▼
                         ┌────────────────────────┐
                         │   Research Agent       │
                         │  (Web Search + Tools)  │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │  Research Formatter    │
                         │ (Structured Documents) │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │  Summarizer Agent      │
                         │ (Incremental Summary)  │
                         └───────────┬────────────┘
                                     │
                      Summary complete? (Supervisor)
                           │                     │
                        Yes│                     │No
                           ▼                     ▼
                         END              ┌──────────────────┐
                                          │  Critic Agent    │
                                          └────────┬─────────┘
                                                   │
                             Research complete?    │
                             ┌───────────────┬─────┘
                             │               │
                           Yes               No
                             │               │
                             ▼               │
                  ┌────────────────────┐     │
                  │  Report Generator  │◄────┘
                  │   (Markdown)       │
                  └─────────┬──────────┘
                            ▼
                     Professional Report
                            │
                            ▼
                       PDF Export (Planned)
```

## Workflow

1. **Supervisor** receives the user's query and decides whether the request requires planning or can proceed directly to research.
2. **Planner** decomposes complex requests into independent research tasks.
3. **Research Agent** performs web research using external search tools.
4. **Research Formatter** converts raw research into structured documents.
5. **Summarizer** incrementally synthesizes the latest research into an information-complete summary.
6. The workflow then branches:

   * If no review is required, the graph terminates.
   * Otherwise, the summary is sent to the **Critic**.
7. **Critic** determines whether the current research completely answers the user's request.

   * If research is incomplete, it generates new, standalone research queries which are sent back to the **Research Agent**.
   * If research is complete, execution continues to the **Report Generator**.
8. **Report Generator** transforms the approved summary into a polished, publication-quality Markdown report suitable for PDF generation.
9. The final Markdown report can be exported as a professionally formatted PDF.

## Iterative Research Loop

```text
Planner
    │
    ▼
Research
    │
    ▼
Formatter
    │
    ▼
Summarizer
    │
    ▼
Critic
    │
    ├─────────────── Complete ───────────────► Report
    │
    ▼
Generate Missing Research Queries
    │
    ▼
Research
```

Unlike a traditional RAG pipeline, the system continuously improves its knowledge by identifying gaps, performing additional targeted research, and updating the summary until the Critic determines that the user's query has been answered comprehensively.


---

# Technology Stack

* LangGraph
* LangChain
* Ollama
* Tavily Search
* Zod
* TypeScript
* Vitest

---

# Testing

The project includes:

* Unit tests for graph nodes
* Integration tests for agents
* Structured output validation
* Graph execution testing

---

# Design Principles

Every agent has exactly one responsibility.

| Agent            | Responsibility        |
| ---------------- | --------------------- |
| Supervisor       | Route workflow        |
| Planner          | Create research plan  |
| Researcher       | Collect information   |
| Formatter        | Structure research    |
| Summarizer       | Losslessly synthesize |
| Critic           | Evaluate completeness |
| Report Generator | Produce final report  |

This separation makes the system easier to extend, test, and maintain.

---

# Future Improvements

* Parallel researcher nodes using `Send`
* Persistent checkpoint storage
* Citation validation
* Image and chart generation
* Automatic source quality ranking
* Human-in-the-loop review
* PDF export with table of contents
* DOCX export
* Streaming report generation
* Multi-model routing
* Cost and token usage analytics

---

# Project Goal

The objective of this project is to explore production-grade agentic workflows rather than simple prompt chaining.

By combining planning, research, self-evaluation, and iterative refinement, the system demonstrates how modern LLM agents can autonomously perform complex research tasks while maintaining modularity, scalability, and clear separation of responsibilities.
