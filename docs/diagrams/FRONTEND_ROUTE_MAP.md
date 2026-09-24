# Frontend Route Map

```mermaid
flowchart TD
    APP[AppRoutes]
    APP --> PUB[Public]
    APP --> AUTH[Authenticated]

    PUB --> HOME[Home /]
    PUB --> SERVICES[/services]
    PUB --> ABOUT[/about]
    PUB --> SAFETY[/safety]
    PUB --> LOGIN[/login]
    PUB --> REGISTER[/register]

    AUTH --> SHARED[Shared]
    AUTH --> PATIENT[Patient]
    AUTH --> DOCTOR[Doctor]
    AUTH --> ADMIN[Admin]

    SHARED --> DASH[/dashboard]
    SHARED --> NOTIF[/notifications]

    PATIENT --> SYM[/symptom-assessment]
    PATIENT --> IMG[/medical-image]
    PATIENT --> DOCS[/doctors]
    PATIENT --> HIST[/patient/history]
    PATIENT --> NEAR[/nearby]
    PATIENT --> SOS[/sos]

    DOCTOR --> PR[/doctor/patients]
    DOCTOR --> AV[/doctor/availability]
    DOCTOR --> ENC[/doctor/encounters/:encounterId]

    ADMIN --> AD[/admin]
    ADMIN --> AUD[/admin/audit]
```
