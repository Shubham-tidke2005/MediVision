import {
  useQuery,
} from "@tanstack/react-query";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Info,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getHealthArticle,
} from "@/features/healthEducation/api/healthEducationApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function formatCategory(
  value
) {
  const labels = {
    DIABETES_PREVENTION:
      "Diabetes Prevention",

    HYPERTENSION_AWARENESS:
      "Blood Pressure Awareness",

    HEALTHY_DIET:
      "Healthy Diet",

    SLEEP:
      "Sleep",

    EXERCISE:
      "Exercise",

    VACCINATION:
      "Vaccination",

    GENERAL_SCREENING:
      "Health Screenings",
  };


  return labels[
    value
  ] ?? value;
}


export default function HealthArticlePage() {
  const {
    slug,
  } = useParams();


  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "health-education-article",
      slug,
    ],

    queryFn: () =>
      getHealthArticle(
        slug
      ),

    enabled:
      Boolean(
        slug
      ),
  });


  if (
    isLoading
  ) {
    return (
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-10
          text-center
        "
      >
        <LoaderCircle
          className="
            mx-auto
            h-7
            w-7
            animate-spin
            text-blue-600
          "
        />

        <p
          className="
            mt-3
            text-sm
            text-slate-500
          "
        >
          Loading article...
        </p>
      </div>
    );
  }


  if (
    isError
    || !article
  ) {
    return (
      <div
        className="
          space-y-4
        "
      >
        <Link
          to="/health-education"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-blue-600
          "
        >
          <ArrowLeft
            className="h-4 w-4"
          />

          Back to Preventive Health
        </Link>


        <div
          className="
            rounded-xl
            border
            border-rose-200
            bg-rose-50
            p-4
            text-sm
            text-rose-700
          "
        >
          {
            getApiErrorMessage(
              error,
              "Unable to load this health article."
            )
          }
        </div>
      </div>
    );
  }


  return (
    <div
      className="
        mx-auto
        max-w-4xl
        space-y-6
        pb-10
      "
    >
      <Link
        to="/health-education"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-blue-600

          hover:text-blue-700
        "
      >
        <ArrowLeft
          className="h-4 w-4"
        />

        Preventive Health
      </Link>


      {/* HEADER */}

      <header
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm

          sm:p-8
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-50
            text-blue-600
          "
        >
          <BookOpen
            className="h-5 w-5"
          />
        </div>


        <p
          className="
            mt-5
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-blue-600
          "
        >
          {
            formatCategory(
              article.category
            )
          }
        </p>


        <h1
          className="
            mt-2
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          {
            article.title
          }
        </h1>


        <p
          className="
            mt-4
            text-base
            leading-7
            text-slate-600
          "
        >
          {
            article.summary
          }
        </p>
      </header>


      {/* EDUCATIONAL NOTICE */}

      <section
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-sky-200
          bg-sky-50
          p-4
        "
      >
        <ShieldCheck
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-sky-600
          "
        />


        <div>
          <p
            className="
              text-sm
              font-semibold
              text-sky-900
            "
          >
            Educational information
          </p>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-sky-800
            "
          >
            This article provides general
            health information. It does not
            determine whether you have a
            medical condition.
          </p>
        </div>
      </section>


      {/* ARTICLE */}

      <article
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm

          sm:p-8
        "
      >
        <h2
          className="
            text-lg
            font-bold
            text-slate-900
          "
        >
          Overview
        </h2>


        <div
          className="
            mt-4
            whitespace-pre-line
            text-sm
            leading-7
            text-slate-600
          "
        >
          {
            article.content
          }
        </div>
      </article>


      {/* KEY POINTS */}

      {article
        .key_points
        ?.length > 0
        && (
          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Key Points
            </h2>


            <div
              className="
                mt-4
                space-y-3
              "
            >
              {article
                .key_points
                .map(
                  (
                    point,
                    index
                  ) => (
                    <div
                      key={
                        `${index}-${point}`
                      }
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <CheckCircle2
                        className="
                          mt-0.5
                          h-5
                          w-5
                          shrink-0
                          text-emerald-600
                        "
                      />


                      <p
                        className="
                          text-sm
                          leading-6
                          text-slate-600
                        "
                      >
                        {
                          point
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
          </section>
        )}


      {/* PROFESSIONAL ADVICE */}

      <section
        className="
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          p-5
        "
      >
        <Info
          className="
            mt-0.5
            h-5
            w-5
            shrink-0
            text-amber-600
          "
        />


        <div>
          <p
            className="
              text-sm
              font-semibold
              text-amber-900
            "
          >
            Professional guidance
          </p>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-amber-800
            "
          >
            {
              article
                .professional_advice_note
            }
          </p>
        </div>
      </section>


      {/* SOURCE */}

      {article.source_name && (
        <section
          className="
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            p-4
          "
        >
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            Reference
          </p>


          {article.source_url ? (
            <a
              href={
                article.source_url
              }
              target="_blank"
              rel="noreferrer"
              className="
                mt-2
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
              "
            >
              {
                article.source_name
              }

              <ExternalLink
                className="h-4 w-4"
              />
            </a>
          ) : (
            <p
              className="
                mt-2
                text-sm
                text-slate-600
              "
            >
              {
                article.source_name
              }
            </p>
          )}
        </section>
      )}
    </div>
  );
}