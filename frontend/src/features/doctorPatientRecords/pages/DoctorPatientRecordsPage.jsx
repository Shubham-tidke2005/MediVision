import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileHeart,
  LoaderCircle,
  Pill,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  getDoctorPatientRecord,
  getDoctorPatientRecords,
} from "@/features/doctorPatientRecords/api/doctorPatientRecordsApi";

function errorMessage(error, fallback) {
  const detail = error?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

function formatEnum(value) {
  if (!value) return "";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function AccessBadge({ value }) {
  const styles = {
    APPOINTMENT: "border-blue-200 bg-blue-50 text-blue-700",
    PATIENT_GRANT: "border-emerald-200 bg-emerald-50 text-emerald-700",
    FULL_HISTORY: "border-emerald-200 bg-emerald-50 text-emerald-700",
    APPOINTMENT_ONLY: "border-blue-200 bg-blue-50 text-blue-700",
    DOCUMENTS_ONLY: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[value] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}>
      {formatEnum(value)}
    </span>
  );
}

function ConsultationCard({ event }) {
  const consultation = event?.consultation;
  const appointment = consultation?.appointment;
  const encounter = consultation?.encounter;
  const diagnoses = consultation?.diagnoses ?? [];
  const prescription = consultation?.prescription;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Consultation</h3>
            <p className="mt-1 text-sm text-slate-500">{formatDateTime(event.occurred_at)}</p>
          </div>
        </div>
        {appointment?.status && (
          <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {formatEnum(appointment.status)}
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Appointment type</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {formatEnum(appointment?.appointment_type) || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Encounter</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {encounter ? formatEnum(encounter.encounter_type) : "Not recorded"}
          </p>
        </div>
      </div>

      {appointment?.reason && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Visit reason</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{appointment.reason}</p>
        </div>
      )}

      {encounter?.chief_complaint && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Chief complaint</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{encounter.chief_complaint}</p>
        </div>
      )}

      {diagnoses.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-sky-600" />
            <h4 className="text-sm font-semibold text-slate-900">Diagnoses</h4>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {diagnoses.map((diagnosis) => (
              <span key={diagnosis.id} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                {diagnosis.name}
                {diagnosis.diagnosis_type ? ` · ${formatEnum(diagnosis.diagnosis_type)}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {prescription && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-600" />
            <h4 className="text-sm font-semibold text-slate-900">Prescription</h4>
          </div>
          <div className="mt-3 space-y-2">
            {prescription.items?.map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{item.medicine?.name}</span>
                {" · "}{item.dose}{" · "}{item.frequency}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function PatientRecordPanel({ patientId }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!patientId) {
        setData(null);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getDoctorPatientRecord(patientId);
        if (active) setData(response);
      } catch (requestError) {
        if (active) setError(errorMessage(requestError, "Unable to load this patient record."));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [patientId]);

  if (!patientId) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <FileHeart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Select a Patient</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Choose an authorized Patient to view the records available to your Doctor account.</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Loading patient record...
        </div>
      </section>
    );
  }

  if (error) {
    return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</section>;
  }

  if (!data) return null;

  const patient = data.patient;
  const events = data.history?.events ?? [];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h2>
              <p className="mt-1 text-sm text-slate-500">{patient.patient_code}</p>
            </div>
          </div>
          <AccessBadge value={data.access_mode} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Info label="Date of birth" value={formatDate(patient.date_of_birth)} />
          <Info label="Gender" value={patient.gender || "—"} />
          <Info label="Blood group" value={patient.blood_group || "—"} />
          <Info label="Related appointments" value={patient.appointment_count} />
        </div>

        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
            <p className="text-xs leading-5 text-slate-600">{data.access_notice}</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-semibold text-slate-900">Medical Record Timeline</h2>
          <p className="mt-1 text-sm text-slate-500">{data.history?.total_events ?? 0} authorized records</p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Activity className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">No authorized timeline records</p>
            <p className="mt-1 text-sm text-slate-500">No consultation records are available under the current access scope.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) =>
              event.consultation ? (
                <ConsultationCard key={event.id} event={event} />
              ) : (
                <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{formatEnum(event.event_type)}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(event.occurred_at)}</p>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function DoctorPatientRecordsPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [directory, setDirectory] = useState({
    total: 0,
    appointment_linked_count: 0,
    active_grant_count: 0,
    items: [],
  });
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDoctorPatientRecords({ search });
        if (!active) return;
        setDirectory(response);

        if (selectedPatientId && !response.items.some((p) => p.id === selectedPatientId)) {
          setSelectedPatientId(null);
        }
      } catch (requestError) {
        if (active) setError(errorMessage(requestError, "Unable to load authorized Patients."));
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [search, selectedPatientId]);

  const selectedPatient = useMemo(
    () => directory.items.find((p) => p.id === selectedPatientId) ?? null,
    [directory.items, selectedPatientId]
  );

  return (
    <div className="space-y-6 pb-10">
      <section>
        <p className="text-sm font-semibold text-blue-600">Doctor Workspace</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Patient Records</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Access only Patients connected to your appointments or active Patient-controlled medical access grants.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={UsersRound} label="Authorized Patients" value={directory.total} />
        <StatCard icon={CalendarDays} label="Appointment-linked" value={directory.appointment_linked_count} />
        <StatCard icon={ShieldCheck} label="Active Grants" value={directory.active_grant_count} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or Patient ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="mt-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading Patients...
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
              )}

              {!loading && !error && directory.items.length === 0 && (
                <div className="py-10 text-center">
                  <UsersRound className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">No authorized Patients</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Patients appear here after an appointment relationship or active access grant exists.
                  </p>
                </div>
              )}

              {!loading && !error && directory.items.map((patient) => {
                const active = selectedPatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${active ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{patient.first_name} {patient.last_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{patient.patient_code}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {patient.access_sources.map((source) => (
                        <AccessBadge key={source} value={source} />
                      ))}
                      {patient.active_grant_scope && <AccessBadge value={patient.active_grant_scope} />}
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500">
                      {patient.appointment_count} related appointment{patient.appointment_count === 1 ? "" : "s"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <PatientRecordPanel patientId={selectedPatientId} />
        </div>
      </section>
    </div>
  );
}
