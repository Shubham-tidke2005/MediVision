import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  Apple,
  CalendarDays,
  Droplets,
  Flame,
  Info,
  Leaf,
  LoaderCircle,
  Scale,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import {
  createDietPlan,
  getCurrentDietPlan,
  getDietPlans,
} from "@/features/wellness/api/dietApi";

import {
  getApiErrorMessage,
} from "@/lib/apiError";


// ======================================================
// OPTIONS
// ======================================================


const activityOptions = [
  {
    value: "SEDENTARY",
    label: "Sedentary",
  },
  {
    value: "LIGHT",
    label: "Light activity",
  },
  {
    value: "MODERATE",
    label: "Moderate activity",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "VERY_ACTIVE",
    label: "Very active",
  },
];


const dietOptions = [
  {
    value: "VEGETARIAN",
    label: "Vegetarian",
  },
  {
    value: "NON_VEGETARIAN",
    label: "Non-vegetarian",
  },
  {
    value: "VEGAN",
    label: "Vegan",
  },
];


const goalOptions = [
  {
    value: "WEIGHT_LOSS",
    label: "Weight management",
  },
  {
    value: "MAINTENANCE",
    label: "Maintain current weight",
  },
  {
    value: "WEIGHT_GAIN",
    label: "Higher-energy plan",
  },
];


// ======================================================
// HELPERS
// ======================================================


function formatEnum(
  value
) {
  if (!value) {
    return "";
  }


  return value
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );
}


function formatDate(
  value
) {
  if (!value) {
    return "";
  }


  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


// ======================================================
// TARGET CARD
// ======================================================


function TargetCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div
      className="
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
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
          "
        >
          {icon}
        </div>


        <div>
          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
            "
          >
            {label}
          </p>


          <p
            className="
              mt-1
              text-xl
              font-bold
              text-slate-900
            "
          >
            {value}
          </p>
        </div>
      </div>


      {description && (
        <p
          className="
            mt-3
            text-xs
            leading-5
            text-slate-500
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}


// ======================================================
// MEAL SECTION
// ======================================================


function MealSection({
  title,
  items,
}) {
  if (
    !items
    || items.length === 0
  ) {
    return null;
  }


  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <UtensilsCrossed
          className="
            h-4
            w-4
            text-teal-600
          "
        />


        <h3
          className="
            font-semibold
            text-slate-900
          "
        >
          {title}
        </h3>
      </div>


      <div
        className="
          mt-4
          space-y-3
        "
      >
        {items.map(
          (
            item
          ) => (
            <div
              key={
                item.id
              }
              className="
                rounded-lg
                bg-slate-50
                p-3
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-1

                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-900
                  "
                >
                  {
                    item.food_name
                  }
                </p>


                {item.quantity && (
                  <span
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    {
                      item.quantity
                    }
                  </span>
                )}
              </div>


              {item.instructions && (
                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  {
                    item.instructions
                  }
                </p>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}


// ======================================================
// PAGE
// ======================================================


export default function WellnessPage() {
  const queryClient =
    useQueryClient();


  const [
    form,
    setForm,
  ] = useState({
    age: "",
    height_cm: "",
    weight_kg: "",
    activity_level:
      "MODERATE",
    diet_preference:
      "VEGETARIAN",
    goal:
      "MAINTENANCE",
  });


  const [
    localError,
    setLocalError,
  ] = useState("");


  const {
    data: currentPlan,
    isLoading:
      currentLoading,
  } = useQuery({
    queryKey: [
      "current-diet-plan",
    ],

    queryFn:
      getCurrentDietPlan,
  });


  const {
    data: previousPlans = [],
  } = useQuery({
    queryKey: [
      "diet-plans",
    ],

    queryFn:
      getDietPlans,
  });


  const createPlan =
    useMutation({
      mutationFn:
        createDietPlan,

      onSuccess:
        async () => {
          setLocalError("");

          await Promise.all([
            queryClient
              .invalidateQueries({
                queryKey: [
                  "current-diet-plan",
                ],
              }),

            queryClient
              .invalidateQueries({
                queryKey: [
                  "diet-plans",
                ],
              }),
          ]);
        },
    });


  function updateField(
    event
  ) {
    const {
      name,
      value,
    } = event.target;


    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );
  }


  function submit(
    event
  ) {
    event.preventDefault();

    setLocalError("");


    const age =
      Number(
        form.age
      );


    const height =
      Number(
        form.height_cm
      );


    const weight =
      Number(
        form.weight_kg
      );


    if (
      !Number.isFinite(age)
      || age < 18
      || age > 100
    ) {
      setLocalError(
        "Enter an age between 18 and 100."
      );

      return;
    }


    if (
      !Number.isFinite(height)
      || height < 120
      || height > 230
    ) {
      setLocalError(
        "Enter a height between 120 and 230 cm."
      );

      return;
    }


    if (
      !Number.isFinite(weight)
      || weight < 30
      || weight > 300
    ) {
      setLocalError(
        "Enter a weight between 30 and 300 kg."
      );

      return;
    }


    createPlan.mutate({
      age,

      height_cm:
        height,

      weight_kg:
        weight,

      activity_level:
        form.activity_level,

      diet_preference:
        form.diet_preference,

      goal:
        form.goal,
    });
  }


  const plan =
    currentPlan
    ?? null;


  const groupedMeals =
    useMemo(
      () => {
        const result = {
          BREAKFAST: [],
          LUNCH: [],
          SNACK: [],
          DINNER: [],
        };


        for (
          const item
          of plan?.items
          ?? []
        ) {
          if (
            result[
              item.meal_type
            ]
          ) {
            result[
              item.meal_type
            ].push(
              item
            );
          }
        }


        return result;
      },
      [
        plan,
      ]
    );


  const mutationError =
    createPlan.isError
      ? getApiErrorMessage(
          createPlan.error,
          "Unable to generate meal plan."
        )
      : "";


  return (
    <div
      className="
        space-y-6
        pb-10
      "
    >
      {/* =============================================== */}
      {/* HEADER                                          */}
      {/* =============================================== */}

      <section>
        <p
          className="
            text-sm
            font-semibold
            text-blue-600
          "
        >
          Wellness
        </p>


        <h1
          className="
            mt-1
            text-2xl
            font-bold
            tracking-tight
            text-slate-900

            sm:text-3xl
          "
        >
          Diet & Wellness
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
          Create a simple rule-based meal
          suggestion using your measurements,
          activity level, food preference and
          wellness goal.
        </p>
      </section>


      {/* =============================================== */}
      {/* IMPORTANT NOTICE                                */}
      {/* =============================================== */}

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
        <Info
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
            General wellness guidance
          </p>


          <p
            className="
              mt-1
              text-sm
              leading-6
              text-sky-800
            "
          >
            This feature provides general
            wellness meal suggestions. It
            does not provide a medical diet
            prescription.
          </p>
        </div>
      </section>


      {/* =============================================== */}
      {/* FORM                                            */}
      {/* =============================================== */}

      <section
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm

          sm:p-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              bg-emerald-50
              text-emerald-600
            "
          >
            <Leaf
              className="h-5 w-5"
            />
          </div>


          <div>
            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Create Suggested Meal Plan
            </h2>


            <p
              className="
                mt-0.5
                text-xs
                text-slate-500
              "
            >
              Adults only in this initial
              wellness module.
            </p>
          </div>
        </div>


        <form
          onSubmit={
            submit
          }
          className="
            mt-6
            space-y-5
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4

              md:grid-cols-3
            "
          >
            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Age
              </span>

              <input
                type="number"
                name="age"
                min="18"
                max="100"
                value={
                  form.age
                }
                onChange={
                  updateField
                }
                required
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                  text-slate-900
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Height (cm)
              </span>

              <input
                type="number"
                step="0.1"
                name="height_cm"
                value={
                  form.height_cm
                }
                onChange={
                  updateField
                }
                required
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  text-sm
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Weight (kg)
              </span>

              <input
                type="number"
                step="0.1"
                name="weight_kg"
                value={
                  form.weight_kg
                }
                onChange={
                  updateField
                }
                required
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  px-3
                  text-sm
                  outline-none

                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </label>
          </div>


          <div
            className="
              grid
              grid-cols-1
              gap-4

              md:grid-cols-3
            "
          >
            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Activity level
              </span>

              <select
                name="activity_level"
                value={
                  form.activity_level
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                "
              >
                {activityOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Diet preference
              </span>

              <select
                name="diet_preference"
                value={
                  form.diet_preference
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                "
              >
                {dietOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>


            <label>
              <span
                className="
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Goal
              </span>

              <select
                name="goal"
                value={
                  form.goal
                }
                onChange={
                  updateField
                }
                className="
                  mt-2
                  min-h-[44px]
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  text-sm
                "
              >
                {goalOptions.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>
          </div>


          {(localError
            || mutationError)
            && (
              <div
                className="
                  rounded-lg
                  border
                  border-rose-200
                  bg-rose-50
                  p-3
                  text-sm
                  text-rose-700
                "
              >
                {
                  localError
                  || mutationError
                }
              </div>
            )}


          <button
            type="submit"
            disabled={
              createPlan.isPending
            }
            className="
              inline-flex
              min-h-[44px]
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              text-sm
              font-semibold
              text-white

              hover:bg-blue-700

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {createPlan.isPending
              ? (
                <>
                  <LoaderCircle
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Creating plan...
                </>
              )
              : (
                <>
                  <Sparkles
                    className="
                      h-4
                      w-4
                    "
                  />

                  Generate Suggested Plan
                </>
              )}
          </button>
        </form>
      </section>


      {/* =============================================== */}
      {/* CURRENT PLAN                                    */}
      {/* =============================================== */}

      {currentLoading ? (
        <section
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-8
            text-center
          "
        >
          <p
            className="
              text-sm
              text-slate-500
            "
          >
            Loading current plan...
          </p>
        </section>
      ) : plan ? (
        <section
          className="
            space-y-5
          "
        >
          <div>
            <p
              className="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-teal-600
              "
            >
              Current Plan
            </p>


            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-slate-900
              "
            >
              {
                plan.title
              }
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              {
                formatEnum(
                  plan.diet_preference
                )
              }

              {" · "}

              {
                formatEnum(
                  plan.activity_level
                )
              }

              {" · "}

              {
                formatEnum(
                  plan.goal
                )
              }
            </p>
          </div>


          {/* TARGETS */}

          <div
            className="
              grid
              grid-cols-1
              gap-4

              md:grid-cols-3
            "
          >
            <TargetCard
              icon={
                <Flame
                  className="h-5 w-5"
                />
              }
              label="Estimated Calories"
              value={
                `${plan.estimated_daily_calories.toLocaleString()} kcal/day`
              }
              description="Rough wellness estimate, not a prescribed calorie target."
            />


            <TargetCard
              icon={
                <Droplets
                  className="h-5 w-5"
                />
              }
              label="Water Estimate"
              value={
                `${
                  (
                    plan.water_target_ml
                    / 1000
                  ).toFixed(1)
                } L/day`
              }
              description="General hydration estimate. Individual needs can vary."
            />


            <TargetCard
              icon={
                <Scale
                  className="h-5 w-5"
                />
              }
              label="BMI"
              value={
                Number(
                  plan.bmi
                ).toFixed(
                  1
                )
              }
              description="Displayed as a basic measurement only."
            />
          </div>


          {/* MEALS */}

          <div
            className="
              grid
              grid-cols-1
              gap-4

              lg:grid-cols-2
            "
          >
            <MealSection
              title="Breakfast"
              items={
                groupedMeals.BREAKFAST
              }
            />


            <MealSection
              title="Lunch"
              items={
                groupedMeals.LUNCH
              }
            />


            <MealSection
              title="Snack"
              items={
                groupedMeals.SNACK
              }
            />


            <MealSection
              title="Dinner"
              items={
                groupedMeals.DINNER
              }
            />
          </div>


          {/* CALCULATION NOTE */}

          <section
            className="
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              p-4
            "
          >
            <div
              className="
                flex
                items-start
                gap-3
              "
            >
              <Info
                className="
                  mt-0.5
                  h-5
                  w-5
                  shrink-0
                  text-slate-500
                "
              />


              <div>
                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                  "
                >
                  How this plan was created
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  {
                    plan.calculation_note
                  }
                </p>
              </div>
            </div>
          </section>


          {/* SAFETY */}

          <section
            className="
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              p-4
            "
          >
            <p
              className="
                text-sm
                font-semibold
                text-amber-900
              "
            >
              General wellness suggestion
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
                plan.safety_message
              }
            </p>
          </section>
        </section>
      ) : (
        <section
          className="
            rounded-xl
            border
            border-dashed
            border-slate-200
            bg-white
            p-8
            text-center
          "
        >
          <Apple
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
            No meal plan yet
          </p>


          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Enter your information above
            to create your first suggested
            meal plan.
          </p>
        </section>
      )}


      {/* =============================================== */}
      {/* PLAN HISTORY                                    */}
      {/* =============================================== */}

      {previousPlans.length > 0 && (
        <section
          className="
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
              items-center
              gap-2
            "
          >
            <CalendarDays
              className="
                h-5
                w-5
                text-blue-600
              "
            />


            <h2
              className="
                font-semibold
                text-slate-900
              "
            >
              Plan History
            </h2>
          </div>


          <div
            className="
              mt-4
              divide-y
              divide-slate-100
            "
          >
            {previousPlans.map(
              (
                previous
              ) => (
                <div
                  key={
                    previous.id
                  }
                  className="
                    flex
                    flex-col
                    gap-2
                    py-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-slate-900
                      "
                    >
                      {
                        previous.title
                      }
                    </p>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-500
                      "
                    >
                      {
                        formatDate(
                          previous.created_at
                        )
                      }

                      {" · "}

                      {
                        formatEnum(
                          previous
                            .diet_preference
                        )
                      }
                    </p>
                  </div>


                  <span
                    className={`
                      w-fit
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-semibold

                      ${
                        previous.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }
                    `}
                  >
                    {previous.is_active
                      ? "Current"
                      : "Previous"}
                  </span>
                </div>
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}