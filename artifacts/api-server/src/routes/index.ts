import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use("/stripe", stripeRouter);

export default router;
