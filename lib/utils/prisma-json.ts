/**
 * Prisma JSON Field Utilities
 *
 * Type-safe helpers for working with Prisma's JSON fields.
 * Prisma stores JSON as loose types (JsonValue/InputJsonValue),
 * but our application uses strongly-typed interfaces.
 */

import type { Prisma } from '@prisma/client'

/**
 * Parses a Prisma JsonValue into a specific type.
 * Use when reading JSON fields from Prisma models.
 *
 * @example
 * const maschile = fromJsonValue<AdjectiveGenderForms>(adj.maschile)
 */
export function fromJsonValue<T>(value: Prisma.JsonValue): T {
  return value as T
}

/**
 * Converts an object to Prisma InputJsonValue.
 * Use when writing JSON fields to Prisma models.
 *
 * @example
 * await repository.update(id, { data: toJsonInput(myObject) })
 */
export function toJsonInput<T extends object>(value: T): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue
}
