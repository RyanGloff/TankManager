import { Router } from "express";
import ParameterRouter from "./ParameterRouter";
import TankRouter from "./TankRouter";
import ParameterReadingRouter from "./ParameterReadingRouter";
import AlarmRouter from "./AlarmRouter";
import DeviceRouter from "./DeviceRouter";
import DeviceTypeRouter from "./DeviceTypeRouter";
import DevicePowerTargetRouter from "./DevicePowerTargetRouter";
import ParameterGoalRouter from "./ParameterGoalRouter";

export default function createApiRouter() {
  const router = Router();

  router.use("/alarms", AlarmRouter());
  router.use("/devices", DeviceRouter());
  router.use("/device-types", DeviceTypeRouter());
  router.use("/device-power-targets", DevicePowerTargetRouter());
  router.use("/parameter-readings", ParameterReadingRouter());
  router.use("/parameters", ParameterRouter());
  router.use("/parameter-goals", ParameterGoalRouter());
  router.use("/tanks", TankRouter());

  return router;
}
