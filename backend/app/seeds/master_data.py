from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.doctor import Specialty


SPECIALTIES = [
    {
        "name": "General Medicine",
        "description": "General healthcare, common illnesses, preventive care, and initial medical evaluation.",
    },
    {
        "name": "Cardiology",
        "description": "Diagnosis and treatment of heart and cardiovascular conditions.",
    },
    {
        "name": "Neurology",
        "description": "Diagnosis and treatment of disorders involving the brain, spinal cord, and nervous system.",
    },
    {
        "name": "Dermatology",
        "description": "Diagnosis and treatment of skin, hair, and nail conditions.",
    },
    {
        "name": "Orthopedics",
        "description": "Diagnosis and treatment of bones, joints, muscles, ligaments, and related conditions.",
    },
    {
        "name": "Psychiatry",
        "description": "Assessment and treatment of mental and behavioral health conditions.",
    },
    {
        "name": "ENT",
        "description": "Diagnosis and treatment of ear, nose, and throat conditions.",
    },
    {
        "name": "Ophthalmology",
        "description": "Diagnosis and treatment of eye and vision-related conditions.",
    },
    {
        "name": "Pediatrics",
        "description": "Healthcare for infants, children, and adolescents.",
    },
    {
        "name": "Gynecology",
        "description": "Healthcare related to the female reproductive system.",
    },
]


def seed_specialties(db: Session) -> tuple[int, int]:
    existing_names = set(
        db.scalars(
            select(Specialty.name)
        ).all()
    )

    inserted = 0
    skipped = 0

    for specialty_data in SPECIALTIES:
        if specialty_data["name"] in existing_names:
            skipped += 1
            continue

        db.add(
            Specialty(
                name=specialty_data["name"],
                description=specialty_data["description"],
                is_active=True,
            )
        )

        inserted += 1

    return inserted, skipped

def seed_master_data() -> None:
    db = SessionLocal()

    try:
        inserted, skipped = seed_specialties(db)

        db.commit()

        print("MediVision master-data seed completed.")
        print(f"Specialties inserted: {inserted}")
        print(f"Specialties skipped:  {skipped}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
        
        
if __name__ == "__main__":
    seed_master_data()