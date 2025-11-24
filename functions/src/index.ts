// functions/src/index.ts
import * as admin from "firebase-admin";
// OJO: ya NO importamos "firebase-functions" v1 (era solo para config())
// import * as functions from "firebase-functions";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";

// Usamos require para Stripe, sin tipos (evitamos problemas con TS)
const Stripe = require("stripe");

admin.initializeApp();
const db = admin.firestore();

/* ===================== Stripe (pagos) ===================== */

// AHORA: solo leemos de variables de entorno (secrets) y las limpiamos
const stripeSecret: string = (process.env.STRIPE_SECRET || "").trim();
const stripeWebhookSecret: string = (process.env.STRIPE_WH_SECRET || "").trim();

// Inicialización perezosa (lazy) para evitar fallos al arrancar el contenedor
let stripe: any = null;

function getStripe(): any {
  if (!stripe) {
    if (!stripeSecret) {
      throw new Error(
        "Stripe secret key no configurada (STRIPE_SECRET no está disponible en el entorno)."
      );
    }
    stripe = new Stripe(stripeSecret, {
      // Usamos la versión por defecto de la cuenta, sin forzar apiVersion
    });
  }
  return stripe;
}

/**
 * createPaymentIntent
 *
 * Llamado desde la app con:
 *   const fn = httpsCallable(getFunctions(), "createPaymentIntent");
 *   fn({ planId: "premium_autodidacta" });
 *
 * data.planId:
 *   - "premium_autodidacta" → cobra 400 MXN
 *   - "bunkan_alumno"      → cobra 250 MXN
 */
export const createPaymentIntent = onCall(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET"],
  },
  async (request) => {
    const { planId } = request.data as { planId: string };

    let amount: number;

    switch (planId) {
      case "premium_autodidacta":
        amount = 40000; // 400.00 MXN en centavos
        break;
      case "bunkan_alumno":
        amount = 25000; // 250.00 MXN en centavos
        break;
      default:
        throw new HttpsError("invalid-argument", "Plan inválido");
    }

    try {
      const stripeClient = getStripe();
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount,
        currency: "mxn",
        // Más adelante aquí puedes agregar metadata.firebaseUid, etc.
        // metadata: {
        //   planId,
        //   firebaseUid: request.auth?.uid ?? "",
        // },
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error: any) {
      console.error("Error creando PaymentIntent:", error);
      throw new HttpsError("internal", "No se pudo crear el pago");
    }
  }
);

/**
 * stripeWebhook
 *
 * Endpoint que recibe los eventos de Stripe (checkout.session.completed)
 * y marca al usuario como premium en Firestore, por 28 días.
 */
export const stripeWebhook = onRequest(
  {
    region: "us-central1",
    secrets: ["STRIPE_SECRET", "STRIPE_WH_SECRET"],
  },
  async (req: any, res: any) => {
    if (req.method !== "POST") {
      res.status(400).send("Only POST requests are accepted");
      return;
    }

    const stripeClient = getStripe();
    let event: any;

    // ================= VERIFICACIÓN DE FIRMA (MODO TEST) =================
    const signature = req.headers["stripe-signature"] as string | undefined;

    if (stripeWebhookSecret && signature) {
      try {
        event = stripeClient.webhooks.constructEvent(
          req.rawBody,
          signature,
          stripeWebhookSecret
        );
      } catch (err: any) {
        // ⚠️ En entorno de PRUEBA, si la firma falla seguimos con req.body.
        console.error(
          "⚠️ Firma inválida (MODO TEST). Usando req.body directo:",
          err.message
        );
        event = req.body;
      }
    } else {
      console.warn(
        "⚠️ Sin STRIPE_WH_SECRET o sin stripe-signature. Usando req.body directo (MODO TEST)."
      );
      event = req.body;
    }
    // =====================================================================

    console.log("✅ Evento Stripe recibido:", event.type);

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const email =
          session.customer_details?.email || session.customer_email || null;
        const paymentLinkId = session.payment_link || null;

        console.log("Session email:", email);
        console.log("Payment link:", paymentLinkId);

        if (!email) {
          console.warn("⚠️ Session sin email, no se puede mapear a usuario");
          res.json({ received: true });
          return;
        }

        // Buscar usuario por email en la colección Usuarios
        const usersSnap = await db
          .collection("Usuarios")
          .where("email", "==", email)
          .limit(1)
          .get();

        if (usersSnap.empty) {
          console.warn("⚠️ No se encontró usuario con email:", email);
          res.json({ received: true });
          return;
        }

        const userDoc = usersSnap.docs[0];
        const uid = userDoc.id;

        // Por ahora, cualquier pago lo consideramos premium (luego distinguimos por paymentLinkId)
        let planType: "premium" | "student" = "premium";

        // 28 días de acceso desde ahora
        const expiresAt = admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
        );

        await db.collection("Usuarios").doc(uid).update({
          plan: planType, // "premium" o "student"
          planStatus: "active", // acceso pagado activo
          planExpiresAt: expiresAt, // <-- NUEVO
          planUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Plan '${planType}' activado para uid=${uid}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("❌ Error procesando webhook:", err);
      res.status(500).send("Internal error");
    }
  }
);

/* ===================== Utilidades de fecha (LATAM) ===================== */
function todayTZ(tz = "America/Mexico_City") {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-");
  return { todayKey: `${y}-${m}-${d}`, y, m, d };
}

/** Clave de semana ISO: YYYY_WW respetando TZ. */
function isoWeekKey(date = new Date(), tz = "America/Mexico_City") {
  const now = new Date(date.toLocaleString("en-US", { timeZone: tz }));
  const tmp = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const dayNum = (tmp.getUTCDay() + 6) % 7; // 0 = lunes
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((tmp.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${tmp.getUTCFullYear()}_${String(week).padStart(2, "0")}`;
}

/* ============================== Tipos ============================== */
type UserEvent = {
  type:
    | "lesson_completed"
    | "quiz_passed"
    | "daily_checkin"
    | "video_watched"
    | "level_cleared"
    | string;
  amount: number;
  meta?: Record<string, any>;
  createdAt?: FirebaseFirestore.FieldValue | FirebaseFirestore.Timestamp;
};

/* ====================================================================
 * Trigger v2 (Firestore) en: /Usuarios/{uid}/events/{eventId}
 * ==================================================================== */
export const onUserEventCreate = onDocumentCreated(
  {
    document: "Usuarios/{uid}/events/{eventId}",
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const uid = event.params.uid as string;
    const eventData = snap.data() as UserEvent;

    // 1) Normaliza puntos según el tipo de evento
    let points = eventData.amount || 0;
    if (eventData.type === "quiz_passed" && eventData.meta?.score === 100) {
      points = Math.max(points, 50);
    }
    if (eventData.type === "lesson_completed") {
      points = Math.max(points, 50);
    }

    const userRef = db.doc(`Usuarios/${uid}`);
    const statsRef = userRef.collection("stats").doc("general");

    const { todayKey } = todayTZ();
    const weekKey = isoWeekKey();

    await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      const statsDoc = await tx.get(statsRef);

      const country = (userDoc.get("countryCode") ?? "XX") as string;

      const prevPoints = statsDoc.exists ? statsDoc.get("points") || 0 : 0;
      const prevWeekly = statsDoc.exists
        ? statsDoc.get("weeklyProgress") || 0
        : 0;
      const weeklyGoal = statsDoc.exists
        ? statsDoc.get("weeklyGoal") || 350
        : 350;
      const streakCount = statsDoc.exists ? statsDoc.get("streakCount") || 0 : 0;
      const streakUpdatedOn = statsDoc.exists
        ? ((statsDoc.get("streakUpdatedOn") as string) || "")
        : "";

      // 2) Racha diaria
      let newStreak = streakCount;
      if (!streakUpdatedOn) {
        newStreak = 1;
      } else {
        const d = new Date(todayKey);
        const y = new Date(streakUpdatedOn);
        const diff = Math.round((d.getTime() - y.getTime()) / 86400000);
        if (diff === 1) newStreak += 1;
        else if (diff > 1) newStreak = 1; // racha rota
      }

      const newPoints = prevPoints + points;
      const newWeekly = prevWeekly + points;

      // 3) Stats del usuario
      tx.set(
        statsRef,
        {
          points: newPoints,
          weeklyGoal,
          weeklyProgress: newWeekly,
          streakCount: newStreak,
          streakUpdatedOn: todayKey,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // 4) Marca actividad reciente
      tx.set(
        userRef,
        { lastActiveAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      // 5) Leaderboards con rutas de componentes PARES
      // Local (por país): leaderboards_local/{country}/users/{uid}
      tx.set(
        db.doc(`leaderboards_local/${country}/users/${uid}`),
        { pointsAllTime: admin.firestore.FieldValue.increment(points) },
        { merge: true }
      );

      // Semanal: leaderboards_weekly/{weekKey}/users/{uid}
      tx.set(
        db.doc(`leaderboards_weekly/${weekKey}/users/${uid}`),
        { points: admin.firestore.FieldValue.increment(points) },
        { merge: true }
      );

      // Diario: leaderboards_daily/{YYYYMMDD}/users/${uid}
      const dailyKey = todayKey.replace(/-/g, "");
      tx.set(
        db.doc(`leaderboards_daily/${dailyKey}/users/${uid}`),
        { points: admin.firestore.FieldValue.increment(points) },
        { merge: true }
      );
    });

    // 6) Logros: por puntos totales y racha
    const achievementsSnap = await db.collection("achievements").get();
    const stats = (await statsRef.get()).data() as any;

    await Promise.all(
      achievementsSnap.docs.map(async (a) => {
        const cond = a.data().condition as any;
        if (!cond) return;

        let ok = false;
        if (cond.type === "points_total") ok = stats.points >= cond.value;
        if (cond.type === "streak_days") ok = stats.streakCount >= cond.value;
        if (!ok) return;

        await db
          .doc(`Usuarios/${uid}/userAchievements/${a.id}`)
          .set(
            {
              unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
              progress: cond.value,
            },
            { merge: true }
          );

        if (a.data().pointsReward) {
          await statsRef.set(
            { points: admin.firestore.FieldValue.increment(a.data().pointsReward) },
            { merge: true }
          );
        }
      })
    );
  }
);

/* ====================================================================
 * Sembrador HTTP temporal para generar eventos de prueba
 * GET/POST  ?uid=<UID>&type=<tipo>&amount=<num>&secret=SEED_SECRET_123
 * ==================================================================== */
export const seedEvent = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const secret =
        (req.method === "POST"
          ? (req.body?.secret as string)
          : (req.query.secret as string)) ?? "";
      if (secret !== "SEED_SECRET_123") {
        res.status(403).send("forbidden");
        return;
      }

      const uid =
        (req.method === "POST"
          ? (req.body?.uid as string)
          : (req.query.uid as string)) ?? "";
      if (!uid) {
        res.status(400).send("Missing uid");
        return;
      }

      const type =
        (req.method === "POST"
          ? (req.body?.type as string)
          : (req.query.type as string)) ?? "daily_checkin";
      const amountRaw =
        (req.method === "POST"
          ? req.body?.amount
          : (req.query.amount as any)) ?? 5;
      const amount = Number(amountRaw);

      const meta =
        (req.method === "POST" ? (req.body?.meta as any) : undefined) ??
        undefined;

      const id = db.collection("_").doc().id;
      const payload: any = {
        type,
        amount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      if (meta) payload.meta = meta;

      await db.doc(`Usuarios/${uid}/events/${id}`).set(payload);

      res.json({ ok: true, path: `Usuarios/${uid}/events/${id}`, type, amount });
    } catch (e: any) {
      res.status(500).send(e?.message ?? "error");
    }
  }
);

/* ====================================================================
 * Diagnóstico: volcado de datos de UN usuario (paginable)
 * GET/POST /dumpUserData?secret=...&uid=...&limit=50&startAfterId=EVENT_ID&weekKey=YYYY_WW&dailyKey=YYYYMMDD
 * ==================================================================== */
export const dumpUserData = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const isPost = req.method === "POST";
      const secret = (isPost ? req.body?.secret : req.query.secret) as
        | string
        | undefined;
      if (secret !== "SEED_SECRET_123") {
        res.status(403).send("forbidden");
        return;
      }

      const uid = (isPost ? req.body?.uid : req.query.uid) as string | undefined;
      if (!uid) {
        res.status(400).send("Missing uid");
        return;
      }

      const limitRaw = (isPost ? req.body?.limit : req.query.limit) as any;
      const limit = Math.min(Math.max(Number(limitRaw ?? 50), 1), 500);

      const startAfterId = (isPost
        ? req.body?.startAfterId
        : req.query.startAfterId) as string | undefined;

      const weekKeyQ = (isPost ? req.body?.weekKey : req.query.weekKey) as
        | string
        | undefined;
      const dailyKeyQ = (isPost ? req.body?.dailyKey : req.query.dailyKey) as
        | string
        | undefined;

      const userRef = db.doc(`Usuarios/${uid}`);
      const statsRef = userRef.collection("stats").doc("general");

      const [userSnap, statsSnap] = await Promise.all([
        userRef.get(),
        statsRef.get(),
      ]);

      // Página de eventos
      let eventsQuery = userRef
        .collection("events")
        .orderBy("createdAt", "desc")
        .limit(limit);
      if (startAfterId) {
        const cursorDoc = await userRef
          .collection("events")
          .doc(startAfterId)
          .get();
        if (cursorDoc.exists) eventsQuery = eventsQuery.startAfter(cursorDoc);
      }
      const eventsSnap = await eventsQuery.get();

      // Leaderboards (nuevas rutas con componentes pares)
      const userCountry = (userSnap.get("countryCode") ?? "XX") as string;

      const { todayKey } = todayTZ();
      const resolvedDailyKey = dailyKeyQ ?? todayKey.replace(/-/g, "");
      const resolvedWeekKey = weekKeyQ ?? isoWeekKey();

      const [localLB, weeklyLB, dailyLB] = await Promise.all([
        db.doc(`leaderboards_local/${userCountry}/users/${uid}`).get(),
        db.doc(`leaderboards_weekly/${resolvedWeekKey}/users/${uid}`).get(),
        db.doc(`leaderboards_daily/${resolvedDailyKey}/users/${uid}`).get(),
      ]);

      const events = eventsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json({
        user: userSnap.exists ? { id: userSnap.id, ...userSnap.data() } : null,
        stats: statsSnap.exists ? { id: statsSnap.id, ...statsSnap.data() } : null,
        eventsCount: events.length,
        events,
        leaderboards: {
          local: localLB.exists ? localLB.data() : null,
          weekly: {
            weekKey: resolvedWeekKey,
            data: weeklyLB.exists ? weeklyLB.data() : null,
          },
          daily: {
            dailyKey: resolvedDailyKey,
            data: dailyLB.exists ? dailyLB.data() : null,
          },
          countryCode: userCountry,
        },
        page: {
          limit,
          nextStartAfterId: events.length ? events[events.length - 1].id : null,
        },
      });
    } catch (e: any) {
      res.status(500).send(e?.message ?? "error");
    }
  }
);

/* ====================================================================
 * Diagnóstico: listado breve de VARIOS usuarios (panorama)
 * GET/POST /dumpAllUsersBrief?secret=...&limit=100
 * ==================================================================== */
export const dumpAllUsersBrief = onRequest(
  { region: "us-central1" },
  async (req, res) => {
    try {
      const isPost = req.method === "POST";
      const secret = (isPost ? req.body?.secret : req.query.secret) as
        | string
        | undefined;
      if (secret !== "SEED_SECRET_123") {
        res.status(403).send("forbidden");
        return;
      }

      const limitRaw = (isPost ? req.body?.limit : req.query.limit) as any;
      const limit = Math.min(Math.max(Number(limitRaw ?? 100), 1), 500);

      const usersSnap = await db.collection("Usuarios").limit(limit).get();

      const results: any[] = [];
      for (const u of usersSnap.docs) {
        const stats = await db.doc(`Usuarios/${u.id}/stats/general`).get();
        results.push({
          uid: u.id,
          displayName: u.get("displayName") ?? "",
          countryCode: u.get("countryCode") ?? "XX",
          lastActiveAt: u.get("lastActiveAt") ?? null,
          stats: stats.exists
            ? {
                points: stats.get("points") ?? 0,
                weeklyProgress: stats.get("weeklyProgress") ?? 0,
                weeklyGoal: stats.get("weeklyGoal") ?? 350,
                streakCount: stats.get("streakCount") ?? 0,
                streakUpdatedOn: stats.get("streakUpdatedOn") ?? "",
              }
            : null,
        });
      }

      res.json({ count: results.length, users: results });
    } catch (e: any) {
      res.status(500).send(e?.message ?? "error");
    }
  }
);
