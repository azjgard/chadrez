import type { NextFunction, Response, Request, RequestHandler } from "express";
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import { db, usersTable } from "./db";

type User = typeof usersTable.$inferSelect;

import type { useUser } from "@clerk/clerk-react";
import { eq } from "drizzle-orm";

export type ClerkUserResource = Exclude<
  ReturnType<typeof useUser>["user"],
  null | undefined
>;

const clerkMiddleware = ClerkExpressWithAuth({});

interface ClerkAuthenticatedRequest extends Request {
  auth: { userId: string; sessionId: string };
}

function isClerkAuthenticatedRequest(
  req: Request
): req is ClerkAuthenticatedRequest {
  return (
    "auth" in req &&
    typeof req.auth === "object" &&
    req.auth !== null &&
    "userId" in req.auth &&
    "sessionId" in req.auth
  );
}

interface FullAuthenticatedRequest extends Request {
  user: User;
}

function isFullAuthenticatedRequest(
  req: Request
): req is FullAuthenticatedRequest {
  return "user" in req;
}

function makeFullAuthenticatedRequest(
  req: Request,
  user: User
): req is FullAuthenticatedRequest {
  // eslint-disable-next-line
  (req as any).user = user;
  return true;
}

const fullAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isClerkAuthenticatedRequest(req)) {
    res.status(401).send("No userId found on request");
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, req.params["foreignId"]))
    .limit(1);

  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  if (!makeFullAuthenticatedRequest(req, user)) {
    res.status(401).send("Failed to make authenticated request");
    return;
  }

  next();
};

export function controllerWithClerkAuth<T extends object>(
  callback: (req: ClerkAuthenticatedRequest, res: Response) => T | Promise<T>
) {
  const controller: RequestHandler = async (req, res, next) => {
    if (!isClerkAuthenticatedRequest(req)) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await callback(req, res);
      if (!res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  return [clerkMiddleware, controller];
}

export function controllerWithFullAuth<T extends object>(
  callback: (req: FullAuthenticatedRequest, res: Response) => T | Promise<T>
) {
  const controller: RequestHandler = async (req, res, next) => {
    if (!isFullAuthenticatedRequest(req)) {
      res.status(401).send("Unauthorized");
      return;
    }

    try {
      const result = await callback(req, res);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  return [clerkMiddleware, fullAuthMiddleware, controller];
}
