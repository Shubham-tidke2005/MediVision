from enum import Enum


class UserRole(str, Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"


class DoctorVerificationStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"
    
    
class SlotStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    HELD = "HELD"
    BOOKED = "BOOKED"
    BLOCKED = "BLOCKED"
    
    
class AppointmentType(str, Enum):
    IN_PERSON = "IN_PERSON"
    ONLINE = "ONLINE"
    PHONE = "PHONE"


class AppointmentStatus(str, Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"
    
class EncounterType(str, Enum):
    IN_PERSON = "IN_PERSON"
    ONLINE = "ONLINE"
    EMERGENCY = "EMERGENCY"
    FOLLOW_UP = "FOLLOW_UP"
    

class DiagnosisType(str, Enum):
    PRIMARY = "PRIMARY"
    SECONDARY = "SECONDARY"
    SUSPECTED = "SUSPECTED"
    
    
class DocumentType(str, Enum):
    LAB_REPORT = "LAB_REPORT"
    PRESCRIPTION = "PRESCRIPTION"
    MRI = "MRI"
    XRAY = "XRAY"
    DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY"
    
class AccessScope(str, Enum):
    FULL_HISTORY = "FULL_HISTORY"
    APPOINTMENT_ONLY = "APPOINTMENT_ONLY"
    
class MedicationSource(str, Enum):
    PRESCRIPTION = "PRESCRIPTION"
    MANUAL = "MANUAL"


class MedicationStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    STOPPED = "STOPPED"


class AdherenceStatus(str, Enum):
    TAKEN = "TAKEN"
    MISSED = "MISSED"
    SKIPPED = "SKIPPED"
    LATE = "LATE"