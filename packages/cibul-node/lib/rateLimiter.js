import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

export default function getRateLimiter(redis, opts) {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: new RedisStore({
      sendCommand: async (...args) => redis.call(...args),
    }),
    ...opts,
  });
}
