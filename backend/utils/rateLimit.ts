import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
	limit: number;
	windowMs: number;
	keyPrefix: string;
	getKey?: (req: Request) => string;
};

type RateLimitState = {
	count: number;
	windowStart: number;
};

const stores = new Map<string, Map<string, RateLimitState>>();

export default function createRateLimit({
	limit,
	windowMs,
	keyPrefix,
	getKey = (req: Request) => (req.session?.githubId ? String(req.session.githubId) : (req.ip as string)),
}: RateLimitOptions) {
	if (!stores.has(keyPrefix)) {
		stores.set(keyPrefix, new Map());
	}

	const store = stores.get(keyPrefix)!;

	return (req: Request, res: Response, next: NextFunction) => {
		const rateLimitKey = getKey(req) || req.ip as string;
		const now = Date.now();
		const existing = store.get(rateLimitKey);

		if (!existing || now - existing.windowStart >= windowMs) {
			store.set(rateLimitKey, {
				count: 1,
				windowStart: now,
			});

			res.setHeader("X-RateLimit-Limit", String(limit));
			res.setHeader("X-RateLimit-Remaining", String(limit - 1));
			res.setHeader("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));

			return next();
		}

		if (existing.count >= limit) {
			const resetAt = existing.windowStart + windowMs;
			res.setHeader("X-RateLimit-Limit", String(limit));
			res.setHeader("X-RateLimit-Remaining", "0");
			res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

			return res.status(429).json({
				success: false,
				message: "Too many requests. Please try again later.",
				name: "RateLimitExceeded",
			});
		}

		existing.count += 1;
		store.set(rateLimitKey, existing);

		const remaining = limit - existing.count;
		const resetAt = existing.windowStart + windowMs;

		res.setHeader("X-RateLimit-Limit", String(limit));
		res.setHeader("X-RateLimit-Remaining", String(remaining));
		res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

		next();
	};
}
