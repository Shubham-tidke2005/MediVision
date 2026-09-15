import {
  z,
} from "zod";


const experienceSchema =
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return undefined;
      }

      return Number(value);
    },

    z
      .number({
        message:
          "Experience is required.",
      })
      .int(
        "Experience must be a whole number."
      )
      .min(
        0,
        "Experience cannot be negative."
      )
      .max(
        80,
        "Enter a valid experience value."
      )
  );


const consultationFeeSchema =
  z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return undefined;
      }

      return Number(value);
    },

    z
      .number()
      .min(
        0,
        "Consultation fee cannot be negative."
      )
      .optional()
  );


export const doctorProfileSchema =
  z
    .object({
      first_name: z
        .string()
        .trim()
        .min(
          1,
          "First name is required."
        )
        .max(100),

      last_name: z
        .string()
        .trim()
        .min(
          1,
          "Last name is required."
        )
        .max(100),

      registration_number: z
        .string()
        .trim()
        .min(
          2,
          "Registration number is required."
        )
        .max(100),

      qualification: z
        .string()
        .trim()
        .min(
          2,
          "Qualification is required."
        )
        .max(255),

      experience_years:
        experienceSchema,

      default_consultation_fee:
        consultationFeeSchema,

      bio: z
        .string()
        .max(
          3000,
          "Bio is too long."
        )
        .optional(),

      specialty_ids: z
        .array(
          z.string()
        )
        .min(
          1,
          "Select at least one specialty."
        ),

      primary_specialty_id: z
        .string()
        .min(
          1,
          "Choose a primary specialty."
        ),

      is_accepting_patients:
        z.boolean(),

      address_line1:
        z.string()
        .max(255)
        .optional(),

      address_line2:
        z.string()
        .max(255)
        .optional(),

      city:
        z.string()
        .max(100)
        .optional(),

      district:
        z.string()
        .max(100)
        .optional(),

      state:
        z.string()
        .max(100)
        .optional(),

      postal_code:
        z.string()
        .max(20)
        .optional(),

      country:
        z.string()
        .max(100)
        .optional(),
    })
    .superRefine(
      (data, ctx) => {
        if (
          !data.specialty_ids.includes(
            data.primary_specialty_id
          )
        ) {
          ctx.addIssue({
            code:
              "custom",

            path: [
              "primary_specialty_id",
            ],

            message:
              "Primary specialty must be one of the selected specialties.",
          });
        }
      }
    );