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
      .max(
        100,
        "First name is too long."
      ),

    last_name: z
      .string()
      .trim()
      .min(
        1,
        "Last name is required."
      )
      .max(
        100,
        "Last name is too long."
      ),

    date_of_birth: z
      .string()
      .min(
        1,
        "Date of birth is required."
      )
      .refine(
        (value) => {
          const selected =
            new Date(
              `${value}T00:00:00`
            );

          const today =
            new Date();

          today.setHours(
            23,
            59,
            59,
            999
          );

          return (
            !Number.isNaN(
              selected.getTime()
            ) &&
            selected <= today
          );
        },
        {
          message:
            "Date of birth cannot be in the future.",
        }
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
      .max(
        255,
        "Address line 1 is too long."
      )
      .optional(),

    address_line2: z
      .string()
      .max(
        255,
        "Address line 2 is too long."
      )
      .optional(),

    city: z
      .string()
      .max(
        100,
        "City is too long."
      )
      .optional(),

    district: z
      .string()
      .max(
        100,
        "District is too long."
      )
      .optional(),

    state: z
      .string()
      .max(
        100,
        "State is too long."
      )
      .optional(),

    postal_code: z
      .string()
      .max(
        20,
        "Postal code is too long."
      )
      .optional(),

    country: z
      .string()
      .max(
        100,
        "Country is too long."
      )
      .optional(),
  });