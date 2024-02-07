import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
export const userRouter = createTRPCRouter({
  getUser: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.users.findFirst({
        where: (user, { eq }) => eq(user.id, input.id),
      });
    }),
});
