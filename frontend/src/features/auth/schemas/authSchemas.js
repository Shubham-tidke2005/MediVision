import { z } from "zod";

import {
  ROLES,
} from "@/constants/roles";


export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email(
      "Enter a valid email address."
    ),

  password: z
    .string()
    .min(
      1,
      "Password is required."
    )
    .max(
      128,
      "Password is too long."
    ),
});


export const registerSchema = z
  .object({
    role: z.enum([
      ROLES.PATIENT,
      ROLES.DOCTOR,
    ]),

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address."
      ),

    phone_number: z
      .string()
      .trim()
      .max(
        20,
        "Phone number is too long."
      )
      .optional(),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters."
      )
      .max(
        128,
        "Password is too long."
      ),

    confirmPassword: z
      .string()
      .min(
        1,
        "Confirm your password."
      ),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      path: ["confirmPassword"],
      message:
        "Passwords do not match.",
    }
  );