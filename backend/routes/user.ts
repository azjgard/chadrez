import { Router } from "express";
import "dotenv/config";
import { controllerWithClerkAuth } from "../middleware";
import { db, usersTable } from "../db";
import { eq } from "drizzle-orm";

const router = Router();

router.get(
  "/",
  controllerWithClerkAuth(async (req, res) => {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, req.auth.userId))
      .limit(1);

    if (!existingUser) {
      return res.status(404).send("User not found");
    }

    return existingUser;
  })
);

router.post(
  "/",
  controllerWithClerkAuth(async (req, res) => {
    const { name, email } = req.body || {};

    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, req.auth.userId))
      .limit(1);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const newUser: typeof usersTable.$inferInsert = {
      clerkId: req.auth.userId,
      name,
      email,
    };

    // console.log(newUser);

    const [user] = await db.insert(usersTable).values(newUser).returning();
    return user;
  })
);

export default router;
