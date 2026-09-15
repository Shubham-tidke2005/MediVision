import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import PageHeader from "@/components/common/PageHeader";

import DoctorCard from "@/features/discovery/components/DoctorCard";
import DoctorFilters from "@/features/discovery/components/DoctorFilters";

import {
  getDiscoverySpecialties,
  getDoctors,
} from "@/features/discovery/api/discoveryApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


export default function DoctorDiscoveryPage() {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    specialtyId,
    setSpecialtyId,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");


  const [
    appliedFilters,
    setAppliedFilters,
  ] = useState({
    search: "",
    specialtyId: "",
    city: "",
  });


  const [
    page,
    setPage,
  ] = useState(1);


  const {
    data: specialties = [],
  } = useQuery({
    queryKey: [
      "discovery-specialties",
    ],

    queryFn:
      getDiscoverySpecialties,
  });


  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "doctor-discovery",
      appliedFilters,
      page,
    ],

    queryFn: () =>
      getDoctors({
        ...appliedFilters,
        page,
        pageSize: 12,
      }),
  });


  function applyFilters() {
    setPage(1);

    setAppliedFilters({
      search:
        search.trim(),

      specialtyId,

      city:
        city.trim(),
    });
  }


  function clearFilters() {
    setSearch("");
    setSpecialtyId("");
    setCity("");

    setPage(1);

    setAppliedFilters({
      search: "",
      specialtyId: "",
      city: "",
    });
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Doctors"
        description="Discover verified healthcare professionals by specialty and location."
      />


      <DoctorFilters
        search={search}
        setSearch={setSearch}
        specialtyId={
          specialtyId
        }
        setSpecialtyId={
          setSpecialtyId
        }
        city={city}
        setCity={setCity}
        specialties={
          specialties
        }
        onApply={
          applyFilters
        }
        onClear={
          clearFilters
        }
      />


      {isLoading && (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <p
            className="
              text-sm
              text-slate-500
            "
          >
            Searching doctors...
          </p>
        </div>
      )}


      {isError && (
        <div
          role="alert"
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
            text-sm
            text-slate-700
            shadow-sm
          "
        >
          {getApiErrorMessage(
            error,
            "Unable to load doctors."
          )}
        </div>
      )}


      {!isLoading
        && !isError
        && data?.items?.length
          === 0 && (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
            shadow-sm
          "
        >
          <h2
            className="
              font-semibold
              text-slate-900
            "
          >
            No doctors found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            Try changing your specialty,
            location, or search terms.
          </p>
        </div>
      )}


      {data?.items?.length > 0 && (
        <>
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <p
              className="
                text-sm
                text-slate-500
              "
            >
              {data.total} verified{" "}
              {data.total === 1
                ? "doctor"
                : "doctors"}{" "}
              found
            </p>
          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            {data.items.map(
              (doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                />
              )
            )}
          </div>


          <div
            className="
              flex
              items-center
              justify-center
              gap-3
            "
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (current) =>
                    current - 1
                )
              }
              className="
                min-h-[44px]
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700

                hover:bg-slate-50

                disabled:pointer-events-none
                disabled:opacity-50
              "
            >
              Previous
            </button>


            <span
              className="
                text-sm
                text-slate-500
              "
            >
              Page {data.page}
              {" of "}
              {data.total_pages}
            </span>


            <button
              type="button"
              disabled={
                page
                >= data.total_pages
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1
                )
              }
              className="
                min-h-[44px]
                rounded-lg
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-700

                hover:bg-slate-50

                disabled:pointer-events-none
                disabled:opacity-50
              "
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}