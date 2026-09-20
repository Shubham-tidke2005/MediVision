import {
  useState,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Activity,
  Apple,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  HeartPulse,
  LoaderCircle,
  Moon,
  ShieldCheck,
  Syringe,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getHealthArticles,
  getHealthCategories,
} from "@/features/healthEducation/api/healthEducationApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


function getCategoryIcon(
  category
) {
  if (
    category
    === "DIABETES_PREVENTION"
  ) {
    return (
      <Droplets
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "HYPERTENSION_AWARENESS"
  ) {
    return (
      <HeartPulse
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "HEALTHY_DIET"
  ) {
    return (
      <Apple
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "SLEEP"
  ) {
    return (
      <Moon
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "EXERCISE"
  ) {
    return (
      <Dumbbell
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "VACCINATION"
  ) {
    return (
      <Syringe
        className="h-5 w-5"
      />
    );
  }


  if (
    category
    === "GENERAL_SCREENING"
  ) {
    return (
      <ClipboardCheck
        className="h-5 w-5"
      />
    );
  }


  return (
    <Activity
      className="h-5 w-5"
    />
  );
}


function formatCategory(
  value
) {
  if (!value) {
    return "";
  }


  const labels = {
    DIABETES_PREVENTION:
      "Diabetes Prevention",

    HYPERTENSION_AWARENESS:
      "Blood Pressure",

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


export default function HealthEducationPage() {
  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(
    null
  );


  const {
    data: categories = [],
    isLoading:
      categoriesLoading,
  } = useQuery({
    queryKey: [
      "health-education-categories",
    ],

    queryFn:
      getHealthCategories,
  });


  const {
    data: articles = [],
    isLoading:
      articlesLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "health-education-articles",
      selectedCategory,
    ],

    queryFn: () =>
      getHealthArticles(
        selectedCategory
      ),
  });


  const loading = (
    categoriesLoading
    || articlesLoading
  );


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* HEADER */}

      <section>
        <div
          className="
            flex
            items-center
            gap-2
            text-blue-600
          "
        >
          <BookOpen
            className="h-5 w-5"
          />

          <p
            className="
              text-sm
              font-semibold
            "
          >
            Health Education
          </p>
        </div>


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
          Preventive Health
        </h1>


        <p
          className="
            mt-2
            max-w-3xl
            text-sm
            leading-6
            text-slate-500
          "
        >
          Explore general educational
          information about healthy habits,
          prevention awareness and routine
          preventive care.
        </p>
      </section>


      {/* INFORMATION NOTICE */}

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
            Educational information only
          </p>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-sky-800
            "
          >
            These articles provide general
            health education. They do not
            diagnose conditions or replace
            advice from a qualified healthcare
            professional.
          </p>
        </div>
      </section>


      {/* CATEGORIES */}

      <section>
        <h2
          className="
            font-semibold
            text-slate-900
          "
        >
          Browse Topics
        </h2>


        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setSelectedCategory(
                null
              )
            }
            className={`
              min-h-[40px]
              rounded-full
              border
              px-4
              text-sm
              font-semibold
              transition

              ${
                selectedCategory
                === null
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            All
          </button>


          {categories.map(
            (
              category
            ) => (
              <button
                key={
                  category.code
                }
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category.code
                  )
                }
                className={`
                  inline-flex
                  min-h-[40px]
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  text-sm
                  font-semibold
                  transition

                  ${
                    selectedCategory
                    === category.code
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                {
                  getCategoryIcon(
                    category.code
                  )
                }

                {
                  category.label
                }
              </button>
            )
          )}
        </div>
      </section>


      {/* LOADING */}

      {loading && (
        <section
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
              h-6
              w-6
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
            Loading health articles...
          </p>
        </section>
      )}


      {/* ERROR */}

      {isError && (
        <section
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
              "Unable to load preventive health articles."
            )
          }
        </section>
      )}


      {/* ARTICLES */}

      {!loading
        && !isError
        && (
          <section>
            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  font-semibold
                  text-slate-900
                "
              >
                {selectedCategory
                  ? formatCategory(
                      selectedCategory
                    )
                  : "All Articles"}
              </h2>


              <span
                className="
                  text-xs
                  text-slate-500
                "
              >
                {
                  articles.length
                }{" "}
                article
                {
                  articles.length
                  === 1
                    ? ""
                    : "s"
                }
              </span>
            </div>


            {articles.length > 0 ? (
              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4

                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {articles.map(
                  (
                    article
                  ) => (
                    <article
                      key={
                        article.id
                      }
                      className="
                        flex
                        h-full
                        flex-col
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        p-5
                        shadow-sm
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-600
                          "
                        >
                          {
                            getCategoryIcon(
                              article.category
                            )
                          }
                        </div>


                        {article
                          .is_featured
                          && (
                            <span
                              className="
                                rounded-full
                                bg-emerald-50
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                text-emerald-700
                              "
                            >
                              Featured
                            </span>
                          )}
                      </div>


                      <p
                        className="
                          mt-4
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


                      <h3
                        className="
                          mt-2
                          text-lg
                          font-bold
                          leading-6
                          text-slate-900
                        "
                      >
                        {
                          article.title
                        }
                      </h3>


                      <p
                        className="
                          mt-3
                          flex-1
                          text-sm
                          leading-6
                          text-slate-500
                        "
                      >
                        {
                          article.summary
                        }
                      </p>


                      <Link
                        to={
                          `/health-education/${article.slug}`
                        }
                        className="
                          mt-5
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-blue-600

                          hover:text-blue-700
                        "
                      >
                        Read Article

                        <ArrowRight
                          className="h-4 w-4"
                        />
                      </Link>
                    </article>
                  )
                )}
              </div>
            ) : (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  border-dashed
                  border-slate-200
                  bg-white
                  p-10
                  text-center
                "
              >
                <BookOpen
                  className="
                    mx-auto
                    h-8
                    w-8
                    text-slate-400
                  "
                />


                <p
                  className="
                    mt-3
                    font-semibold
                    text-slate-900
                  "
                >
                  No articles found
                </p>
              </div>
            )}
          </section>
        )}
    </div>
  );
}