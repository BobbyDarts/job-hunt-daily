// /src/lib/transform.test.ts

import { describe, it, expect } from "vitest";

import { objectToCamelCase, objectToSnakeCase } from "@/lib/transform";

describe("transform utilities", () => {
  describe("objectToSnakeCase", () => {
    it("converts camelCase keys to snake_case", () => {
      const input = {
        userId: 1,
        createdAt: "2024-01-01",
      };

      const result = objectToSnakeCase(input);

      expect(result).toEqual({
        user_id: 1,
        created_at: "2024-01-01",
      });
    });

    it("preserves values without mutation", () => {
      const input = {
        isActive: true,
      };

      const result = objectToSnakeCase(input);

      expect(result).toEqual({
        is_active: true,
      });
      expect(Object.keys(result)).toEqual(["is_active"]);
    });

    it("handles single key objects", () => {
      const input = { userId: 123 };

      expect(objectToSnakeCase(input)).toEqual({
        user_id: 123,
      });
    });

    it("handles empty objects", () => {
      expect(objectToSnakeCase({})).toEqual({});
    });

    it("handles problematic acronym case correctly", () => {
      const input = {
        userID: 1,
      };

      const result = objectToSnakeCase(input);

      // This documents expected behavior (important!)
      expect(result).toEqual({
        user_id: 1,
      });
    });
  });

  describe("objectToCamelCase", () => {
    it("converts snake_case keys to camelCase", () => {
      const input = {
        user_id: 1,
        created_at: "2024-01-01",
      };

      const result = objectToCamelCase(input);

      expect(result).toEqual({
        userId: 1,
        createdAt: "2024-01-01",
      });
    });

    it("preserves values", () => {
      const input = {
        is_active: true,
      };

      const result = objectToCamelCase(input);

      expect(result.isActive).toBe(true);
    });

    it("handles empty objects", () => {
      expect(objectToCamelCase({})).toEqual({});
    });

    it("handles single key objects", () => {
      expect(objectToCamelCase({ user_id: 1 })).toEqual({
        userId: 1,
      });
    });
  });
});
