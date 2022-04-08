import { Router } from "express";
const routes = Router();
import accountRoutes from "./account/account.routes";
import authRoutes from "./auth/auth.routes";
import miscRoutes from "./misc/misc.routes";
import tradesRoutes from "./trades/trades.routes";
import statsRoutes from "./stats/stats.routes";


const PATH = {
    ROOT: "/",
    ACCOUNT: "/account",
    AUTH: "/auth",
    MISC: "/misc",
    TRADES: "/trades",
    STATS: "/stats",
  };

  routes.use(PATH.ACCOUNT, accountRoutes);
  routes.use(PATH.AUTH, authRoutes);
  routes.use(PATH.MISC, miscRoutes);
  routes.use(PATH.TRADES, tradesRoutes);
  routes.use(PATH.STATS, statsRoutes);


  export default routes;