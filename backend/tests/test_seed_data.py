from app.seeds.master_data import SPECIALTIES


def test_specialties_seed_data():
    names = [
        specialty["name"]
        for specialty in SPECIALTIES
    ]

    assert len(names) > 0
    assert len(names) == len(set(names))

    assert "General Medicine" in names
    assert "Cardiology" in names
    assert "Neurology" in names