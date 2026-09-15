import {
  z,
} from "zod";


const optionalHeight =
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
        20,
        "Height must be at least 20 cm."
      )
      .max(
        300,
        "Height must be less than 300 cm."
      )
      .optional()
  );


export const patientProfileSchema =
  z.object({
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

    date_of_birth: z
      .string()
      .min(
        1,
        "Date of birth is required."
      )
      .refine(
        (value) => {
          const selected =
            new Date(value);

          const today =
            new Date();

          return (
            !Number.isNaN(
              selected.getTime()
            ) &&
            selected <= today
          );
        },
        "Date of birth cannot be in the future."
      ),

    gender: z
      .string()
      .optional(),

    blood_group: z
      .string()
      .optional(),

    height_cm:
      optionalHeight,

    emergency_notes: z
      .string()
      .max(
        2000,
        "Emergency notes are too long."
      )
      .optional(),

    address_line1: z
      .string()
      .max(255)
      .optional(),

    address_line2: z
      .string()
      .max(255)
      .optional(),

    city: z
      .string()
      .max(100)
      .optional(),

    district: z
      .string()
      .max(100)
      .optional(),

    state: z
      .string()
      .max(100)
      .optional(),

    postal_code: z
      .string()
      .max(20)
      .optional(),

    country: z
      .string()
      .max(100)
      .optional(),
  });