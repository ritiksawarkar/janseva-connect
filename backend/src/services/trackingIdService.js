import { query } from '../config/db.js';

/**
 * Concurrency-safe Unique Tracking ID Service
 * Uses PostgreSQL SEQUENCE to guarantee uniqueness under concurrent load.
 * Format: JSC-<YYYY>-<000001>
 */
export const generateTrackingId = async (dbClient = null) => {
  const currentYear = new Date().getFullYear();
  const executor = dbClient || { query };

  const seqResult = await executor.query("SELECT nextval('complaint_tracking_seq') AS next_val");
  const nextVal = parseInt(seqResult.rows[0].next_val, 10);
  const formattedNumber = String(nextVal).padStart(6, '0');

  return `JSC-${currentYear}-${formattedNumber}`;
};

export default {
  generateTrackingId
};

