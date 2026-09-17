"use client";

import { getPublicSupabaseClient } from "@/lib/store/client";

const requestHandler =
  () =>
  async ({
    endpoint,
    page = 1,
    perPage = 10,
    search = "",
    sortBy,
    sortOrder = "desc",
    filters = {},
    meta = {},
  }) => {
    const supabase = getPublicSupabaseClient();

    try {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { select = "*", search: searchColumn, filters: filterConfig = {} } = meta;

      let query = supabase.from(endpoint).select(select, {
        count: "exact",
      });

      // Search
      if (search && searchColumn) {
        if (typeof searchColumn === "string" && searchColumn.includes(",")) {
          const conditions = searchColumn
            .split(",")
            .map((col) => `${col.trim()}.ilike.%${search}%`)
            .join(",");
          query = query.or(conditions);
        } else {
          query = query.ilike(searchColumn, `%${search}%`);
        }
      }

      // Filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          return;
        }

        const config = filterConfig[key];

        if (!config) {
          return;
        }

        const column = config.column ?? key;
        const operator = config.operator ?? "eq";

        switch (operator) {
          case "eq":
            query = query.eq(column, value);
            break;

          case "neq":
            query = query.neq(column, value);
            break;

          case "gt":
            query = query.gt(column, value);
            break;

          case "gte":
            query = query.gte(column, value);
            break;

          case "lt":
            query = query.lt(column, value);
            break;

          case "lte":
            query = query.lte(column, value);
            break;

          case "in":
            query = query.in(column, Array.isArray(value) ? value : [value]);
            break;

          case "ilike":
            query = query.ilike(column, `%${value}%`);
            break;

          default:
            query = query.eq(column, value);
            break;
        }
      });

      // Sorting
      if (sortBy) {
        query = query.order(sortBy, {
          ascending: sortOrder !== "desc",
        });
      }

      // Pagination + execute query
      const { data, count, error } = await query.range(from, to);

      if (error) {
        console.error("[ReactList] Supabase fetch error:", error);
        throw error;
      }

      return {
        items: data ?? [],
        count: count ?? 0,
      };
    } catch (error) {
      console.error("[ReactList] Request handler error:", error);
      throw error;
    }
  };

export default requestHandler;
