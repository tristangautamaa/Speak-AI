# SPEAK — Product Brief

## Vision

Help people speak with calm confidence.

Most people aren't bad at thinking — they're bad at translating thoughts into clear, composed speech under pressure. SPEAK gives them a low-stakes environment to practice, get real feedback, and build a habit of intentional speaking.

## Target User

**Primary:** Professionals who need to communicate clearly — job seekers, early-career engineers, managers preparing for presentations, non-native English speakers.

**Secondary:** Anyone who wants to sound more confident and polished in everyday conversation.

## Core Problem

Existing tools for communication practice either:
- Require a human coach (expensive, scheduling friction)
- Record video and show it back (anxiety-inducing, not actionable)
- Focus on business writing, not spoken language

SPEAK is async, private, and instant. You speak. You get coached. You improve.

## MVP Scope (Laptop Web Only)

The MVP validates the core coaching loop:

1. User starts a session
2. User speaks
3. App transcribes speech in real time
4. AI coach responds with concrete, specific feedback
5. Metrics update — user sees where they stand

**In scope for MVP:**
- `/conversation` practice screen
- Browser speech recognition (Chrome)
- Local rule-based coach responses
- Confidence, tempo, clarity, filler metrics

**Out of scope for MVP:**
- User accounts or progress history
- Mobile support
- LLM-powered coaching (comes after local loop is stable)
- Server-side transcription or voice output
- Payment or subscriptions

## Philosophy

**Real before beautiful.** Get a working coaching loop before polishing UI.

**Simple before smart.** A rule-based coach that gives useful feedback beats a broken LLM integration.

**Loop before infrastructure.** Users need to feel progress within one session before we optimize latency, build auth, or deploy globally.

**Laptop-first.** Users practice speaking — they need a keyboard, a comfortable chair, and Chrome. Mobile is a distraction for this phase.

## Success Metric for MVP

A user completes one speaking practice session and feels like they learned something specific about their communication.
