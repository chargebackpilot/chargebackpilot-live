import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import stripeRouter from "./stripe";
import adminRouter from "./admin";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(casesRouter);
router.use("/stripe", stripeRouter);
router.use("/admin", adminRouter);

export default router;
