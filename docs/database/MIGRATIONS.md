# Alembic Migrations

## Commands

```powershell
cd C:\Shubham\MediVision\backend
.myenv\Scripts\Activate

alembic current
alembic heads
alembic check
```

Create migration:

```powershell
alembic revision --autogenerate -m "describe change"
```

Inspect before applying.

Apply:

```powershell
alembic upgrade head
```

## Recent Development Revisions

Recent revisions used during current project development include:

```text
278f7e40877a
9c2f47a1d8e3
a4c9e12b7f40
```

Always trust the live Alembic state over documentation.

Never apply a migration whose `down_revision` does not match the current migration chain.
